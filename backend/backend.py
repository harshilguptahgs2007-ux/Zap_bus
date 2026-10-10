import json
import math
import os
import socket
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from jose.exceptions import JWTError
from pydantic import BaseModel, ConfigDict, EmailStr, Field
import redis
import fakeredis
from sqlalchemy import (
    Column, DateTime, Float, ForeignKey, Integer, String,
    create_engine, delete, event, func, select,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Session, relationship, sessionmaker

SECRET_KEY = os.getenv("SECRET_KEY", "#fdd<>?<{%fS3242RGS")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

ECO_POINTS_PER_KM = 5
ACTIVE_RIDE_TTL_SECONDS = 3600
USER_LOCATION_TTL_SECONDS = 1800

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

def init_redis():
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.5)
        check = sock.connect_ex((REDIS_HOST, REDIS_PORT))
        sock.close()
        if check == 0:
            r = redis.Redis(
                host=REDIS_HOST, port=REDIS_PORT, db=REDIS_DB,
                password=REDIS_PASSWORD, decode_responses=True,
                socket_connect_timeout=1, retry_on_timeout=False
            )
            r.ping()
            return r
    except Exception:
        pass
    return fakeredis.FakeRedis(decode_responses=True)

redis_client = init_redis()

engine = create_engine("sqlite:///database.db")

@event.listens_for(engine, "connect")
def fkey_activate(con, _):
    cursor = con.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

class Base(DeclarativeBase):
    pass

class Users(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    password = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    contact = Column(String, nullable=False)
    latitude = Column(Float)
    longitude = Column(Float)
    eco_points_total = Column(Integer, nullable=False, default=0)
    rides = relationship("Rides", back_populates="user", cascade="all, delete-orphan")

class Rides(Base):
    __tablename__ = "rides"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    pickup_lat = Column(Float, nullable=False)
    pickup_lng = Column(Float, nullable=False)
    drop_lat = Column(Float, nullable=False)
    drop_lng = Column(Float, nullable=False)
    pickup_address = Column(String)
    drop_address = Column(String)
    distance_km = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="booked")
    eco_points_earned = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, index=True)
    completed_at = Column(DateTime(timezone=True))
    user = relationship("Users", back_populates="rides")

Base.metadata.create_all(engine)
SessionLocal = sessionmaker(engine)

app = FastAPI(
    title="ZapBus Eco Rides & Live Telemetry Backend",
    description="FastAPI backend powered by Redis for fast in-memory visibility & SQLite persistent storage"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_headers=["*"],
    allow_methods=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def redis_cache_ride(ride_id: int, user_id: int, pickup_lat: float, pickup_lng: float,
                     drop_lat: float, drop_lng: float, distance_km: float, status: str,
                     pickup_address: str = None, drop_address: str = None, created_at: str = None):
    key = f"ride:active:{ride_id}"
    created_str = created_at or utcnow().isoformat()
    mapping = {
        "id": str(ride_id),
        "user_id": str(user_id),
        "pickup_lat": str(pickup_lat),
        "pickup_lng": str(pickup_lng),
        "drop_lat": str(drop_lat),
        "drop_lng": str(drop_lng),
        "distance_km": str(distance_km),
        "status": status,
        "pickup_address": pickup_address or "",
        "drop_address": drop_address or "",
        "created_at": created_str,
    }
    redis_client.hset(key, mapping=mapping)
    redis_client.expire(key, ACTIVE_RIDE_TTL_SECONDS)
    redis_client.geoadd("rides:pickup:geo", (pickup_lng, pickup_lat, str(ride_id)))
    redis_client.publish("rides_channel", json.dumps({
        "event": "ride_booked",
        "ride_id": ride_id,
        "user_id": user_id,
        "pickup": {"lat": pickup_lat, "lng": pickup_lng},
        "status": status
    }))

def redis_get_cached_ride(ride_id: int):
    key = f"ride:active:{ride_id}"
    data = redis_client.hgetall(key)
    if not data:
        return None
    return {
        "id": int(data["id"]),
        "user_id": int(data["user_id"]),
        "pickup_lat": float(data["pickup_lat"]),
        "pickup_lng": float(data["pickup_lng"]),
        "drop_lat": float(data["drop_lat"]),
        "drop_lng": float(data["drop_lng"]),
        "distance_km": float(data["distance_km"]),
        "status": data["status"],
        "pickup_address": data.get("pickup_address") or None,
        "drop_address": data.get("drop_address") or None,
        "eco_points_earned": 0,
        "created_at": datetime.fromisoformat(data["created_at"]),
        "completed_at": None
    }

def redis_remove_ride(ride_id: int, final_status: str = "completed"):
    redis_client.delete(f"ride:active:{ride_id}")
    redis_client.zrem("rides:pickup:geo", str(ride_id))
    redis_client.publish("rides_channel", json.dumps({
        "event": f"ride_{final_status}",
        "ride_id": ride_id
    }))

def redis_set_user_location(user_id: int, lat: float, lng: float):
    redis_client.geoadd("users:geo", (lng, lat, str(user_id)))
    redis_client.hset(f"user:location:{user_id}", mapping={
        "latitude": str(lat),
        "longitude": str(lng),
        "updated_at": utcnow().isoformat()
    })
    redis_client.expire(f"user:location:{user_id}", USER_LOCATION_TTL_SECONDS)

def get_db():
    with SessionLocal() as session:
        yield session

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_pass(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(to_encode, SECRET_KEY, ALGORITHM)

def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    r = 6371.0088
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi = p2 - p1
    dlmb = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlmb / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))

def calc_eco_points(distance_km: float) -> int:
    if distance_km <= 0:
        return 0
    return max(1, round(distance_km * ECO_POINTS_PER_KM))

def get_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Users:
    if token == "demo-token":
        user = db.scalar(select(Users).where(Users.username == "priya_sharma"))
        if not user:
            user = Users(
                username="priya_sharma",
                email="priya.sharma@ecoride.com",
                password=hash_password("ecoride123"),
                age=27,
                contact="+91 98765 43210",
                latitude=28.6139,
                longitude=77.2090,
                eco_points_total=420,
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            default_rides = [
                Rides(
                    user_id=user.id,
                    pickup_lat=28.6289,
                    pickup_lng=77.3649,
                    drop_lat=28.6315,
                    drop_lng=77.2167,
                    pickup_address="Sector 62, Noida (Electronic City Metro)",
                    drop_address="Connaught Place, Central Delhi (Shivaji Stadium)",
                    distance_km=18.2,
                    status="completed",
                    eco_points_earned=18,
                    completed_at=utcnow(),
                ),
                Rides(
                    user_id=user.id,
                    pickup_lat=28.4986,
                    pickup_lng=77.0878,
                    drop_lat=28.6289,
                    drop_lng=77.3649,
                    pickup_address="Cyber City Gate 2 (DLF Cyberhub Bay)",
                    drop_address="Sector 62, Noida (Fortis Hospital Crossing)",
                    distance_km=24.5,
                    status="completed",
                    eco_points_earned=14,
                    completed_at=utcnow() - timedelta(days=1),
                ),
                Rides(
                    user_id=user.id,
                    pickup_lat=28.5645,
                    pickup_lng=77.3344,
                    drop_lat=28.5033,
                    drop_lng=77.4056,
                    pickup_address="Botanical Garden Metro (Gate No 3)",
                    drop_address="Advant Navis Business Park (Sector 142)",
                    distance_km=9.8,
                    status="completed",
                    eco_points_earned=10,
                    completed_at=utcnow() - timedelta(days=3),
                ),
                Rides(
                    user_id=user.id,
                    pickup_lat=28.5746,
                    pickup_lng=77.3561,
                    drop_lat=28.5028,
                    drop_lng=77.3995,
                    pickup_address="Noida City Centre (Concourse Link 1)",
                    drop_address="Sector 137 (Paras Tierea Transit Stand)",
                    distance_km=11.0,
                    status="completed",
                    eco_points_earned=11,
                    completed_at=utcnow() - timedelta(days=5),
                ),
            ]
            db.add_all(default_rides)
            db.commit()
        return user

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, [ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        user_id = int(user_id)
    except (JWTError, ValueError, TypeError):
        raise credentials_exception

    user = db.scalar(select(Users).where(Users.id == user_id))
    if user is None:
        raise credentials_exception
    return user

Lat = Field(..., ge=-90, le=90)
Lng = Field(..., ge=-180, le=180)
CONTACT_PATTERN = r"^\+?[0-9]{7,15}$"

class RegisterSchema(BaseModel):
    user: str = Field(..., min_length=3, max_length=50)
    pass_: str = Field(..., min_length=8, max_length=128)
    email: EmailStr
    age: int = Field(..., ge=18, le=120)
    contact: str = Field(..., pattern=CONTACT_PATTERN)
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    username: str
    email: str
    age: int
    contact: str
    latitude: float | None
    longitude: float | None
    eco_points_total: int

class UserUpdate(BaseModel):
    user: str | None = Field(None, min_length=3, max_length=50)
    pass_: str | None = Field(None, min_length=8, max_length=128)
    email: EmailStr | None = None
    age: int | None = Field(None, ge=18, le=120)
    contact: str | None = Field(None, pattern=CONTACT_PATTERN)

class LocationIn(BaseModel):
    latitude: float = Lat
    longitude: float = Lng

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RideIn(BaseModel):
    pickup_lat: float = Lat
    pickup_lng: float = Lng
    drop_lat: float = Lat
    drop_lng: float = Lng
    pickup_address: str | None = Field(None, max_length=300)
    drop_address: str | None = Field(None, max_length=300)

class RideOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    pickup_lat: float
    pickup_lng: float
    drop_lat: float
    drop_lng: float
    pickup_address: str | None
    drop_address: str | None
    distance_km: float
    status: str
    eco_points_earned: int
    created_at: datetime
    completed_at: datetime | None

class RideHistory(BaseModel):
    eco_points_total: int
    total_distance_km: float
    rides: list[RideOut]

@app.post("/login", response_model=Token)
def login(data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.scalar(
        select(Users).where((Users.username == data.username) | (Users.email == data.username.lower()))
    )
    if user is None or not verify_pass(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": create_token({"sub": str(user.id)}), "token_type": "bearer"}

@app.post("/register", status_code=201)
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    new_user = Users(
        username=data.user,
        email=data.email.lower(),
        password=hash_password(data.pass_),
        age=data.age,
        contact=data.contact,
        latitude=data.latitude,
        longitude=data.longitude,
    )
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
        if data.latitude is not None and data.longitude is not None:
            redis_set_user_location(new_user.id, data.latitude, data.longitude)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")
    return {"success": "user added"}

@app.get("/me", response_model=UserOut)
def me(current_user: Users = Depends(get_user)):
    return current_user

@app.put("/me", response_model=UserOut)
def update_me(data: UserUpdate, current_user: Users = Depends(get_user), db: Session = Depends(get_db)):
    if data.user is not None:
        current_user.username = data.user
    if data.pass_ is not None:
        current_user.password = hash_password(data.pass_)
    if data.email is not None:
        current_user.email = data.email.lower()
    if data.age is not None:
        current_user.age = data.age
    if data.contact is not None:
        current_user.contact = data.contact
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")
    db.refresh(current_user)
    return current_user

@app.put("/me/location", response_model=UserOut)
def update_location(data: LocationIn, current_user: Users = Depends(get_user), db: Session = Depends(get_db)):
    current_user.latitude = data.latitude
    current_user.longitude = data.longitude
    db.commit()
    db.refresh(current_user)
    redis_set_user_location(current_user.id, data.latitude, data.longitude)
    return current_user

@app.delete("/me", status_code=204)
def delete_me(current_user: Users = Depends(get_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    db.delete(current_user)
    db.commit()
    redis_client.delete(f"user:location:{user_id}")
    redis_client.zrem("users:geo", str(user_id))

@app.get("/me/rides", response_model=RideHistory)
def ride_history(
    limit: int | None = Query(None, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: Users = Depends(get_user),
    db: Session = Depends(get_db),
):
    query = (
        select(Rides)
        .where(Rides.user_id == current_user.id)
        .order_by(Rides.created_at.desc(), Rides.id.desc())
        .offset(offset)
    )
    if limit is not None:
        query = query.limit(limit)
    rides = db.scalars(query).all()
    total_distance = db.scalar(
        select(func.coalesce(func.sum(Rides.distance_km), 0.0)).where(
            Rides.user_id == current_user.id, Rides.status == "completed"
        )
    )
    return {
        "eco_points_total": current_user.eco_points_total,
        "total_distance_km": round(total_distance, 3),
        "rides": rides,
    }

@app.get("/rides/active/live")
def get_all_active_rides_from_redis():
    keys = redis_client.keys("ride:active:*")
    active_rides = []
    for key in keys:
        data = redis_client.hgetall(key)
        if data:
            ttl = redis_client.ttl(key)
            data["ttl_seconds"] = ttl if ttl > 0 else 0
            active_rides.append(data)
    return {
        "source": "Redis In-Memory Cache",
        "count": len(active_rides),
        "rides": active_rides
    }

@app.get("/rides/nearby")
def get_nearby_rides_from_redis(
    lat: float = Query(..., description="Observer or driver latitude"),
    lng: float = Query(..., description="Observer or driver longitude"),
    radius_km: float = Query(5.0, description="Search radius in kilometers")
):
    try:
        results = redis_client.geosearch(
            name="rides:pickup:geo",
            longitude=lng,
            latitude=lat,
            radius=radius_km,
            unit="km",
            withdist=True,
            withcoord=True
        )
    except Exception:
        results = []

    nearby_rides = []
    for item in results:
        ride_id = item[0]
        distance = item[1]
        coord = item[2]
        data = redis_client.hgetall(f"ride:active:{ride_id}")
        if data:
            data["distance_from_query_km"] = round(distance, 2)
            nearby_rides.append(data)

    return {
        "source": "Redis GEOSEARCH (rides:pickup:geo)",
        "center": {"lat": lat, "lng": lng},
        "radius_km": radius_km,
        "count": len(nearby_rides),
        "rides": nearby_rides
    }

@app.get("/users/nearby")
def get_nearby_users_from_redis(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radius_km: float = Query(5.0, description="Radius in km")
):
    try:
        results = redis_client.geosearch(
            name="users:geo",
            longitude=lng,
            latitude=lat,
            radius=radius_km,
            unit="km",
            withdist=True
        )
    except Exception:
        results = []

    nearby = []
    for item in results:
        u_id = item[0]
        dist = item[1]
        nearby.append({"user_id": u_id, "distance_km": round(dist, 2)})

    return {"count": len(nearby), "users": nearby}

@app.post("/rides", response_model=RideOut, status_code=201)
def book_ride(data: RideIn, current_user: Users = Depends(get_user), db: Session = Depends(get_db)):
    distance = haversine_km(data.pickup_lat, data.pickup_lng, data.drop_lat, data.drop_lng)
    ride = Rides(
        user_id=current_user.id,
        pickup_lat=data.pickup_lat,
        pickup_lng=data.pickup_lng,
        drop_lat=data.drop_lat,
        drop_lng=data.drop_lng,
        pickup_address=data.pickup_address,
        drop_address=data.drop_address,
        distance_km=round(distance, 3),
        status="booked",
    )
    db.add(ride)
    db.commit()
    db.refresh(ride)

    redis_cache_ride(
        ride_id=ride.id,
        user_id=ride.user_id,
        pickup_lat=ride.pickup_lat,
        pickup_lng=ride.pickup_lng,
        drop_lat=ride.drop_lat,
        drop_lng=ride.drop_lng,
        distance_km=ride.distance_km,
        status=ride.status,
        pickup_address=ride.pickup_address,
        drop_address=ride.drop_address,
        created_at=ride.created_at.isoformat() if ride.created_at else None
    )

    return ride

def _get_own_ride(ride_id: int, user: Users, db: Session) -> Rides:
    cached = redis_get_cached_ride(ride_id)
    if cached and cached["user_id"] == user.id:
        return cached

    ride = db.scalar(select(Rides).where(Rides.id == ride_id, Rides.user_id == user.id))
    if ride is None:
        raise HTTPException(status_code=404, detail=f"Ride {ride_id} not found")
    return ride

@app.get("/rides/{ride_id}", response_model=RideOut)
def get_ride(ride_id: int, current_user: Users = Depends(get_user), db: Session = Depends(get_db)):
    return _get_own_ride(ride_id, current_user, db)

@app.post("/rides/{ride_id}/complete", response_model=RideOut)
def complete_ride(ride_id: int, current_user: Users = Depends(get_user), db: Session = Depends(get_db)):
    ride = db.scalar(select(Rides).where(Rides.id == ride_id, Rides.user_id == current_user.id))
    if ride is None:
        raise HTTPException(status_code=404, detail=f"Ride {ride_id} not found")
    if ride.status != "booked":
        raise HTTPException(status_code=409, detail=f"Ride is already {ride.status}")

    points = calc_eco_points(ride.distance_km)
    ride.status = "completed"
    ride.completed_at = utcnow()
    ride.eco_points_earned = points
    current_user.eco_points_total = (current_user.eco_points_total or 0) + points
    db.commit()
    db.refresh(ride)

    redis_remove_ride(ride_id, final_status="completed")
    return ride

@app.post("/rides/{ride_id}/cancel", response_model=RideOut)
def cancel_ride(ride_id: int, current_user: Users = Depends(get_user), db: Session = Depends(get_db)):
    ride = db.scalar(select(Rides).where(Rides.id == ride_id, Rides.user_id == current_user.id))
    if ride is None:
        raise HTTPException(status_code=404, detail=f"Ride {ride_id} not found")
    if ride.status != "booked":
        raise HTTPException(status_code=409, detail=f"Ride is already {ride.status}")

    ride.status = "cancelled"
    db.commit()
    db.refresh(ride)

    redis_remove_ride(ride_id, final_status="cancelled")
    return ride

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend:app", host="0.0.0.0", port=8000, reload=True)
