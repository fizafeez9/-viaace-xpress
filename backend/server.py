ffrom fastapi import FastAPI, APIRouter, HTTPException, Request, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------- Models ----------
class SessionExchange(BaseModel):
    session_id: str


class UserOut(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None


class MockLoginRequest(BaseModel):
    name: Optional[str] = "Tetamu"


class LatLng(BaseModel):
    lat: float
    lng: float


class Location(BaseModel):
    label: str
    address: str
    lat: Optional[float] = None
    lng: Optional[float] = None


class QuoteRequest(BaseModel):
    pickup: Location
    stops: List[Location] = []
    size: str  # small | medium | large
    weight: str  # <5 | 5-10 | 10-20 | 20+
    vehicle: str  # motor | kereta


class QuoteResponse(BaseModel):
    distance_km: float
    base_fare: float
    distance_fare: float
    size_surcharge: float
    total: float
    eta_min: int
    currency: str = "MYR"


class OrderCreate(BaseModel):
    pickup: Location
    stops: List[Location] = []
    size: str
    weight: str
    vehicle: str
    payment_method: str  # cash | card | tng
    notes: Optional[str] = None
    quote: QuoteResponse


class Order(BaseModel):
    id: str
    user_id: str
    pickup: Location
    stops: List[Location]
    size: str
    weight: str
    vehicle: str
    payment_method: str
    notes: Optional[str] = None
    quote: QuoteResponse
    status: str  # searching | accepted | picked_up | in_transit | delivered | cancelled
    rider: Optional[Dict[str, Any]] = None
    rider_location: Optional[LatLng] = None
    created_at: str
    updated_at: str


class ChatMessage(BaseModel):
    id: str
    order_id: str
    sender: str  # user | rider
    text: str
    created_at: str


class ChatMessageIn(BaseModel):
    text: str


class RatingIn(BaseModel):
    stars: int
    comment: Optional[str] = ""


# ---------- Auth helpers ----------
async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session.get("expires_at")
    if isinstance(expires_at, datetime):
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------- Startup: indexes ----------
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.user_sessions.create_index("session_token", unique=True)
    await db.user_sessions.create_index("user_id")
    await db.user_sessions.create_index("expires_at", expireAfterSeconds=0)
    await db.orders.create_index("user_id")
    await db.orders.create_index("id", unique=True)
    logger.info("Indexes ready")


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "ViaAce Xpress API"}


@api_router.post("/auth/session")
async def auth_session(payload: SessionExchange):
    sid = payload.session_id
    async with httpx.AsyncClient(timeout=15) as hc:
        r = await hc.get(
            "https://demobackend.my.viaace.xpress/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": sid},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = r.json()
    email = data.get("email")
    name = data.get("name") or email
    picture = data.get("picture")
    session_token = data.get("session_token")
    if not email or not session_token:
        raise HTTPException(status_code=401, detail="Missing auth data")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name, "picture": picture}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc),
        })

    await db.user_sessions.insert_one({
        "session_token": session_token,
        "user_id": user_id,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
        "created_at": datetime.now(timezone.utc),
    })

    return {
        "session_token": session_token,
        "user": {"user_id": user_id, "email": email, "name": name, "picture": picture},
    }


@api_router.post("/auth/mock")
async def auth_mock(payload: MockLoginRequest):
    name = payload.name or "Tetamu"
    email = f"guest_{uuid.uuid4().hex[:8]}@viaace.local"
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    await db.users.insert_one({
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": None,
        "created_at": datetime.now(timezone.utc),
    })
    session_token = f"mock_{uuid.uuid4().hex}"
    await db.user_sessions.insert_one({
        "session_token": session_token,
        "user_id": user_id,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=30),
        "created_at": datetime.now(timezone.utc),
    })
    return {
        "session_token": session_token,
        "user": {"user_id": user_id, "email": email, "name": name, "picture": None},
    }


@api_router.get("/auth/me", response_model=UserOut)
async def me(user=Depends(get_current_user)):
    return UserOut(**user)


@api_router.post("/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1]
        await db.user_sessions.delete_one({"session_token": token})
    return {"ok": True}


# ---------- Quote & Orders ----------
def _distance_km(a: Location, b: Location) -> float:
    if a.lat is None or a.lng is None or b.lat is None or b.lng is None:
        return round(3.0 + (abs(hash(a.address + b.address)) % 200) / 10.0, 2)
    import math
    R = 6371
    lat1, lat2 = math.radians(a.lat), math.radians(b.lat)
    dlat = lat2 - lat1
    dlng = math.radians(b.lng - a.lng)
    x = dlng * math.cos((lat1 + lat2) / 2)
    y = dlat
    return round(math.sqrt(x * x + y * y) * R, 2)


def _calc_quote(payload: QuoteRequest) -> QuoteResponse:
    stops = [payload.pickup, *payload.stops] if payload.stops else [payload.pickup]
    if len(stops) < 2:
        stops.append(payload.pickup)
    total_km = 0.0
    for i in range(len(stops) - 1):
        total_km += _distance_km(stops[i], stops[i + 1])
    if total_km < 1:
        total_km = round(3.0 + random.random() * 8, 2)

    base = 5.0 if payload.vehicle == "motor" else 10.0
    per_km = 1.2 if payload.vehicle == "motor" else 2.2
    size_surcharge = {"small": 0.0, "medium": 2.0, "large": 5.0}.get(payload.size, 0.0)
    weight_surcharge = {"<5": 0.0, "5-10": 1.5, "10-20": 3.0, "20+": 6.0}.get(payload.weight, 0.0)
    distance_fare = round(total_km * per_km, 2)
    total = round(base + distance_fare + size_surcharge + weight_surcharge, 2)
    eta = int(10 + total_km * 3)
    return QuoteResponse(
        distance_km=round(total_km, 2),
        base_fare=base,
        distance_fare=distance_fare,
        size_surcharge=round(size_surcharge + weight_surcharge, 2),
        total=total,
        eta_min=eta,
    )


@api_router.post("/quote", response_model=QuoteResponse)
async def quote(payload: QuoteRequest):
    return _calc_quote(payload)


RIDERS = [
    {"name": "Ahmad Zulkifli", "plate": "WXY 1234", "phone": "+60123456789", "rating": 4.9,
     "photo": "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop&auto=format"},
    {"name": "Siti Nurhaliza", "plate": "PMR 5678", "phone": "+60129998888", "rating": 4.8,
     "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&auto=format"},
    {"name": "Raj Kumar", "plate": "JHR 9012", "phone": "+60177776666", "rating": 5.0,
     "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format"},
]


@api_router.post("/orders")
async def create_order(payload: OrderCreate, user=Depends(get_current_user)):
    order_id = f"VAX{datetime.now().strftime('%y%m%d')}{uuid.uuid4().hex[:6].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    rider = random.choice(RIDERS).copy()
    rider["eta_min"] = payload.quote.eta_min
    if payload.pickup.lat is not None and payload.pickup.lng is not None:
        rider_loc = {"lat": payload.pickup.lat + 0.008, "lng": payload.pickup.lng + 0.008}
    else:
        rider_loc = {"lat": 3.139 + random.random() * 0.02, "lng": 101.6869 + random.random() * 0.02}
    order = {
        "id": order_id,
        "user_id": user["user_id"],
        "pickup": payload.pickup.model_dump(),
        "stops": [s.model_dump() for s in payload.stops],
        "size": payload.size,
        "weight": payload.weight,
        "vehicle": payload.vehicle,
        "payment_method": payload.payment_method,
        "notes": payload.notes,
        "quote": payload.quote.model_dump(),
        "status": "searching",
        "rider": rider,
        "rider_location": rider_loc,
        "created_at": now,
        "updated_at": now,
    }
    await db.orders.insert_one(order.copy())
    order.pop("_id", None)
    return order


@api_router.get("/orders")
async def list_orders(user=Depends(get_current_user)):
    docs = await db.orders.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return docs


@api_router.get("/orders/{order_id}")
async def get_order(order_id: str, user=Depends(get_current_user)):
    doc = await db.orders.find_one({"id": order_id, "user_id": user["user_id"]}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Order not found")
    order = await _progress_order(doc)
    return order


async def _progress_order(doc):
    seq = ["searching", "accepted", "picked_up", "in_transit", "delivered"]
    if doc["status"] == "delivered" or doc["status"] == "cancelled":
        return doc
    created = datetime.fromisoformat(doc["created_at"])
    elapsed = (datetime.now(timezone.utc) - created).total_seconds()
    idx = min(int(elapsed // 25), len(seq) - 1)
    new_status = seq[idx]
    if new_status != doc["status"]:
        rl = doc.get("rider_location") or {"lat": 3.14, "lng": 101.69}
        target = doc["pickup"] if idx < 2 else (doc["stops"][0] if doc["stops"] else doc["pickup"])
        if target.get("lat") is not None:
            rl = {
                "lat": rl["lat"] + (target["lat"] - rl["lat"]) * 0.4,
                "lng": rl["lng"] + (target["lng"] - rl["lng"]) * 0.4,
            }
        doc["rider_location"] = rl
        doc["status"] = new_status
        doc["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.orders.update_one({"id": doc["id"]}, {"$set": {
            "status": new_status, "rider_location": rl, "updated_at": doc["updated_at"]
        }})
    return doc


@api_router.post("/orders/{order_id}/cancel")
async def cancel_order(order_id: str, user=Depends(get_current_user)):
    r = await db.orders.update_one(
        {"id": order_id, "user_id": user["user_id"]},
        {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    if r.matched_count == 0:
        raise HTTPException(404, "Order not found")
    return {"ok": True}


# ---------- Chat ----------
@api_router.get("/orders/{order_id}/chat")
async def get_chat(order_id: str, user=Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": user["user_id"]}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    msgs = await db.chats.find({"order_id": order_id}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return msgs


@api_router.post("/orders/{order_id}/chat")
async def send_chat(order_id: str, payload: ChatMessageIn, user=Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": user["user_id"]}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    msg = {
        "id": f"msg_{uuid.uuid4().hex[:10]}",
        "order_id": order_id,
        "sender": "user",
        "text": payload.text,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.chats.insert_one(msg.copy())
    msg.pop("_id", None)
    replies = [
        "Baik, saya dalam perjalanan.",
        "OK, saya akan sampai sebentar lagi.",
        "Boleh, terima kasih!",
        "Saya sudah tiba di lokasi pickup.",
    ]
    reply = {
        "id": f"msg_{uuid.uuid4().hex[:10]}",
        "order_id": order_id,
        "sender": "rider",
        "text": random.choice(replies),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.chats.insert_one(reply.copy())
    reply.pop("_id", None)
    return [msg, reply]


# ---------- Ratings ----------
@api_router.post("/orders/{order_id}/rate")
async def rate_order(order_id: str, payload: RatingIn, user=Depends(get_current_user)):
    order = await db.orders.find_one({"id": order_id, "user_id": user["user_id"]}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"rating": {"stars": payload.stars, "comment": payload.comment,
                              "created_at": datetime.now(timezone.utc).isoformat()}}},
    )
    return {"ok": True}


# ---------- Notifications ----------
@api_router.get("/notifications")
async def notifications(user=Depends(get_current_user)):
    return [
        {"id": "n1", "title": "Promosi RM5 Off", "body": "Guna kod VIA5 untuk potongan RM5 tempahan pertama anda.",
         "created_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(), "unread": True},
        {"id": "n2", "title": "Selamat datang!", "body": "Terima kasih menggunakan ViaAce Xpress.",
         "created_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(), "unread": False},
    ]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
