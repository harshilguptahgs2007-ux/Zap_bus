import math
import os
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt
from jose.exceptions import JWTError
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import (
    Column, DateTime, Float, ForeignKey, Integer, String,
    create_engine, delete, event, func, select,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import DeclarativeBase, Session, relationship, sessionmaker

SECRET_KEY = "#fdd<>?<{%fS3242RGS"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

_origins_env = os.getenv("ALLOWED_ORIGINS")
ALLOWED_ORIGINS = _origins_env.split(",") if _origins_env else ["http://localhost:3000"]

ECO_POINTS_PER_KM = 5

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

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_headers=["*"],
    allow_methods=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


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
    return current_user


@app.delete("/me", status_code=204)
def delete_me(current_user: Users = Depends(get_user), db: Session = Depends(get_db)):
    db.delete(current_user)
    db.commit()


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
    return ride


def _get_own_ride(ride_id: int, user: Users, db: Session) -> Rides:
    ride = db.scalar(select(Rides).where(Rides.id == ride_id, Rides.user_id == user.id))
    if ride is None:
        raise HTTPException(status_code=404, detail=f"Ride {ride_id} not found")
    return ride


@app.get("/rides/{ride_id}", response_model=RideOut)
def get_ride(ride_id: int, current_user: Users = Depends(get_user), db: Session = Depends(get_db)):
    return _get_own_ride(ride_id, current_user, db)


@app.post("/rides/{ride_id}/complete", response_model=RideOut)
def complete_ride(ride_id: int, current_user: Users = Depends(get_user), db: Session = Depends(get_db)):
    ride = _get_own_ride(ride_id, current_user, db)
    if ride.status != "booked":
        raise HTTPException(status_code=409, detail=f"Ride is already {ride.status}")

    points = calc_eco_points(ride.distance_km)
    ride.status = "completed"
    ride.completed_at = utcnow()
    ride.eco_points_earned = points
    current_user.eco_points_total = (current_user.eco_points_total or 0) + points
    db.commit()
    db.refresh(ride)
    return ride


@app.post("/rides/{ride_id}/cancel", response_model=RideOut)
def cancel_ride(ride_id: int, current_user: Users = Depends(get_user), db: Session = Depends(get_db)):
    ride = _get_own_ride(ride_id, current_user, db)
    if ride.status != "booked":
        raise HTTPException(status_code=409, detail=f"Ride is already {ride.status}")
    ride.status = "cancelled"
    db.commit()
    db.refresh(ride)
    return ride
