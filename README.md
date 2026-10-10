# EcoRide / Zap_bus

A full-stack sustainable transit and EV bus booking application featuring real-time Redis in-memory visibility, SQLite persistence, and a modern mobile-responsive frontend built with React Native and Expo.

---

## Project Structure

```
Zap_bus/
├── backend/                  # FastAPI + Redis + SQLite Backend
│   ├── backend.py            # Primary REST API & Redis Pub/Sub engine
│   ├── test_backend.py       # Automated integration test suite
│   └── requirements.txt      # Python dependencies
│
├── frontend/                 # React Native & Expo Frontend
│   ├── src/
│   │   ├── api/              # API Client connecting to backend
│   │   ├── components/       # Header, MapCanvas, SavedPlaces, ImpactCard
│   │   ├── context/          # Auth & user state context
│   │   ├── screens/          # Home, Ride History, Marketplace, Profile
│   │   └── theme/            # Stitch design system tokens
│   ├── public/               # Static map assets (map.html)
│   ├── package.json          # Node dependencies
│   ├── App.js                # App entrypoint & bottom dock navigation
│   └── app.json              # Expo configuration
│
├── .gitignore
└── README.md
```

---

## 🚀 Quickstart

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python backend.py
```
*Backend runs on `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.*

### 2. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm start
```
*Press `w` to open in browser at `http://localhost:8081` or scan the QR code using Expo Go on your mobile device.*
