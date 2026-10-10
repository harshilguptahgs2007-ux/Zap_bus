from fastapi.testclient import TestClient
from backend import app, redis_client

client = TestClient(app)

def test_full_backend():
    print("\n--- 1. Register & Login ---")
    reg_data = {
        "user": "backend_rider",
        "pass_": "Secret12345!",
        "email": "rider@backend.com",
        "age": 24,
        "contact": "+919876543210",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    client.post("/register", json=reg_data)
    login_res = client.post("/login", data={"username": "backend_rider", "password": "Secret12345!"})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    client.put("/me/location", json={"latitude": 12.9716, "longitude": 77.5946}, headers=headers)
    print("User authenticated and location synced to Redis.")

    print("\n--- 2. Book Ride ---")
    ride_data = {
        "pickup_lat": 12.9716,
        "pickup_lng": 77.5946,
        "drop_lat": 12.9850,
        "drop_lng": 77.6400,
        "pickup_address": "Indiranagar Metro",
        "drop_address": "Tech Park Gate 2"
    }
    book_res = client.post("/rides", json=ride_data, headers=headers)
    assert book_res.status_code == 201
    ride = book_res.json()
    ride_id = ride["id"]
    print(f"Ride booked: ID={ride_id}, Distance={ride['distance_km']} km")

    print("\n--- 3. Verify Redis In-Memory Hash ---")
    cached = redis_client.hgetall(f"ride:active:{ride_id}")
    print(f"Redis Hash for ride:active:{ride_id} ->", cached)
    assert cached["status"] == "booked"
    assert float(cached["pickup_lat"]) == 12.9716

    print("\n--- 4. Verify Live Active Rides Endpoint ---")
    live_res = client.get("/rides/active/live")
    assert live_res.status_code == 200
    live_data = live_res.json()
    print("Live active rides from Redis:", live_data)
    assert any(int(r["id"]) == ride_id for r in live_data["rides"])

    print("\n--- 5. Verify Geospatial Discovery ---")
    nearby_res = client.get("/rides/nearby?lat=12.9720&lng=77.5950&radius_km=5")
    assert nearby_res.status_code == 200
    nearby_data = nearby_res.json()
    print("Nearby rides found via Redis GEOSEARCH:", nearby_data["rides"])
    assert any(int(r["id"]) == ride_id for r in nearby_data["rides"])

    print("\n--- 6. Verify User Proximity in Redis ---")
    users_res = client.get("/users/nearby?lat=12.9720&lng=77.5950&radius_km=3")
    assert users_res.status_code == 200
    users_data = users_res.json()
    print("Nearby users found via Redis GEOSEARCH:", users_data["users"])
    assert len(users_data["users"]) >= 1

    print("\n--- 7. Complete Ride ---")
    comp_res = client.post(f"/rides/{ride_id}/complete", headers=headers)
    assert comp_res.status_code == 200
    comp_ride = comp_res.json()
    print(f"Ride completed! Earned {comp_ride['eco_points_earned']} eco points.")
    assert not redis_client.exists(f"ride:active:{ride_id}")
    print("Confirmed: active ride automatically purged from Redis upon completion!")

    print("\n=== ALL BACKEND & REDIS TESTS PASSED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_full_backend()
