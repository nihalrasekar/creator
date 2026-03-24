from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, File, UploadFile, Query, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import requests
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
import random
import string
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionResponse, CheckoutStatusResponse, CheckoutSessionRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'creatorflow-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Stripe Configuration
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY', '')

# Object Storage Configuration
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
APP_NAME = "creatorflow"
storage_key = None

# Social OAuth Configuration
YOUTUBE_CLIENT_ID = os.environ.get('YOUTUBE_CLIENT_ID', '')
YOUTUBE_CLIENT_SECRET = os.environ.get('YOUTUBE_CLIENT_SECRET', '')
INSTAGRAM_CLIENT_ID = os.environ.get('INSTAGRAM_CLIENT_ID', '')
INSTAGRAM_CLIENT_SECRET = os.environ.get('INSTAGRAM_CLIENT_SECRET', '')
TIKTOK_CLIENT_KEY = os.environ.get('TIKTOK_CLIENT_KEY', '')
TIKTOK_CLIENT_SECRET = os.environ.get('TIKTOK_CLIENT_SECRET', '')

# Referral Configuration
REFERRAL_SIGNUP_BONUS = 5.0  # $5 per signup
REFERRAL_EARNING_PERCENTAGE = 0.10  # 10% of earnings for 12 months
REFERRAL_MILESTONES = {
    5: 25.0,   # 5 referrals = $25 bonus
    10: 75.0,  # 10 referrals = $75 bonus
    25: 200.0, # 25 referrals = $200 bonus
    50: 500.0, # 50 referrals = $500 bonus
    100: 1000.0 # 100 referrals = $1000 bonus
}

app = FastAPI(title="CreatorFlow API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)

# ==================== STORAGE HELPERS ====================

def init_storage():
    """Initialize storage and get storage key"""
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_KEY:
        raise Exception("EMERGENT_LLM_KEY not configured")
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Upload file to storage"""
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    """Download file from storage"""
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp", "pdf": "application/pdf",
    "json": "application/json", "csv": "text/csv", "txt": "text/plain",
    "zip": "application/zip", "mp4": "video/mp4", "mp3": "audio/mpeg",
    "psd": "image/vnd.adobe.photoshop", "ai": "application/illustrator",
    "xmp": "application/octet-stream", "lrtemplate": "application/octet-stream"
}

def generate_referral_code() -> str:
    """Generate unique referral code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

# ==================== MODELS ====================

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = Field(default="creator")  # creator, brand, admin

class UserCreate(UserBase):
    password: str
    referral_code: Optional[str] = None  # Code of the user who referred them

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    created_at: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    username: Optional[str] = None
    referral_code: Optional[str] = None  # User's own referral code

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class CreatorProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    username: str
    display_name: str
    bio: Optional[str] = ""
    avatar: Optional[str] = None
    social_links: Dict[str, str] = {}
    follower_stats: Dict[str, int] = {}
    niche: Optional[str] = None
    location: Optional[str] = None
    is_verified: bool = False
    store_theme: Dict[str, Any] = {}
    created_at: str
    connected_accounts: Dict[str, Any] = {}  # OAuth connected accounts

class SocialAccountConnect(BaseModel):
    platform: str  # youtube, instagram, tiktok
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    # Manual input fields
    follower_count: Optional[int] = None
    profile_url: Optional[str] = None
    username: Optional[str] = None

class FileUploadResponse(BaseModel):
    id: str
    path: str
    original_filename: str
    content_type: str
    size: int
    download_url: str

class ReferralStats(BaseModel):
    referral_code: str
    total_referrals: int
    successful_referrals: int
    total_earnings: float
    pending_earnings: float
    milestone_bonuses: float
    referred_users: List[Dict[str, Any]] = []

class ProductCreate(BaseModel):
    title: str
    description: str
    price: float
    product_type: str = "digital"  # digital, service, affiliate
    files: List[str] = []
    image: Optional[str] = None
    affiliate_url: Optional[str] = None
    commission_rate: Optional[float] = None

class ProductResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    creator_id: str
    title: str
    description: str
    price: float
    product_type: str
    files: List[str] = []
    image: Optional[str] = None
    affiliate_url: Optional[str] = None
    commission_rate: Optional[float] = None
    sales_count: int = 0
    created_at: str

class MembershipTier(BaseModel):
    name: str
    price: float
    benefits: List[str]

class MembershipCreate(BaseModel):
    tiers: List[MembershipTier]

class BrandProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    company_name: str
    industry: str
    logo: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    created_at: str

class CampaignCreate(BaseModel):
    title: str
    brief: str
    budget: float
    target_niche: Optional[str] = None
    target_followers_min: int = 0
    target_followers_max: int = 10000000

class CampaignResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    brand_id: str
    title: str
    brief: str
    budget: float
    status: str = "active"
    target_niche: Optional[str] = None
    target_followers_min: int = 0
    target_followers_max: int = 10000000
    created_at: str

class DealCreate(BaseModel):
    campaign_id: str
    creator_id: str
    payment_amount: float
    deliverables: List[str]

class DealResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    campaign_id: str
    creator_id: str
    brand_id: str
    payment_amount: float
    deliverables: List[str]
    status: str = "pending"
    created_at: str

class StoreSection(BaseModel):
    id: str
    type: str
    title: Optional[str] = None
    content: Optional[Dict[str, Any]] = {}
    order: int

class StoreUpdate(BaseModel):
    sections: List[StoreSection]
    theme: Optional[Dict[str, Any]] = {}

class AIToolRequest(BaseModel):
    tool_type: str
    input_data: Dict[str, Any]

class AIToolResponse(BaseModel):
    tool_type: str
    output: Any
    created_at: str

class CheckoutRequest(BaseModel):
    product_id: Optional[str] = None
    amount: Optional[float] = None
    origin_url: str
    metadata: Optional[Dict[str, str]] = {}

class TransactionResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    session_id: str
    amount: float
    currency: str
    status: str
    payment_status: str
    user_id: Optional[str] = None
    product_id: Optional[str] = None
    metadata: Dict[str, str] = {}
    created_at: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_optional_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
        return user
    except Exception:
        return None

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    username = user_data.email.split('@')[0] + str(uuid.uuid4())[:4]
    user_referral_code = generate_referral_code()
    
    # Check if referred by someone
    referred_by = None
    if user_data.referral_code:
        referrer = await db.users.find_one({"referral_code": user_data.referral_code})
        if referrer:
            referred_by = referrer["id"]
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "role": user_data.role,
        "password_hash": hash_password(user_data.password),
        "username": username,
        "avatar": None,
        "bio": None,
        "referral_code": user_referral_code,
        "referred_by": referred_by,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Track referral if applicable
    if referred_by:
        referral_doc = {
            "id": str(uuid.uuid4()),
            "referrer_id": referred_by,
            "referred_user_id": user_id,
            "referred_user_email": user_data.email,
            "referred_user_name": user_data.name,
            "status": "signed_up",
            "signup_bonus_paid": False,
            "earnings_tracked_until": (datetime.now(timezone.utc) + timedelta(days=365)).isoformat(),
            "total_commission_earned": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.referrals.insert_one(referral_doc)
        
        # Credit signup bonus to referrer
        await db.referral_earnings.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": referred_by,
            "referral_id": referral_doc["id"],
            "type": "signup_bonus",
            "amount": REFERRAL_SIGNUP_BONUS,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Check for milestone bonuses
        referral_count = await db.referrals.count_documents({"referrer_id": referred_by})
        if referral_count in REFERRAL_MILESTONES:
            await db.referral_earnings.insert_one({
                "id": str(uuid.uuid4()),
                "user_id": referred_by,
                "referral_id": None,
                "type": "milestone_bonus",
                "milestone": referral_count,
                "amount": REFERRAL_MILESTONES[referral_count],
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
    
    # Create profile based on role
    if user_data.role == "creator":
        creator_profile = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "username": username,
            "display_name": user_data.name,
            "bio": "",
            "avatar": None,
            "social_links": {},
            "follower_stats": {"youtube": 0, "instagram": 0, "tiktok": 0, "twitter": 0},
            "niche": None,
            "location": None,
            "is_verified": False,
            "store_theme": {"background": "#0D0D1A", "accent": "#6C5CE7"},
            "connected_accounts": {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.creator_profiles.insert_one(creator_profile)
        
        # Create empty store
        store_doc = {
            "id": str(uuid.uuid4()),
            "creator_id": user_id,
            "username": username,
            "sections": [],
            "theme": {"background": "#0D0D1A", "accent": "#6C5CE7"},
            "is_published": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.stores.insert_one(store_doc)
        
    elif user_data.role == "brand":
        brand_profile = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "company_name": user_data.name,
            "industry": "",
            "logo": None,
            "website": None,
            "description": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.brand_profiles.insert_one(brand_profile)
    
    token = create_token(user_id, user_data.email, user_data.role)
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            role=user_data.role,
            created_at=user_doc["created_at"],
            username=username,
            referral_code=user_referral_code
        )
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user["email"], user["role"])
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            role=user["role"],
            created_at=user["created_at"],
            avatar=user.get("avatar"),
            bio=user.get("bio"),
            username=user.get("username"),
            referral_code=user.get("referral_code")
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_current_user)):
    return UserResponse(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        created_at=user["created_at"],
        avatar=user.get("avatar"),
        bio=user.get("bio"),
        username=user.get("username"),
        referral_code=user.get("referral_code")
    )

# ==================== CREATOR ROUTES ====================

@api_router.get("/creators", response_model=List[CreatorProfile])
async def get_creators(
    niche: Optional[str] = None,
    min_followers: int = 0,
    max_followers: int = 10000000,
    limit: int = 20
):
    query = {}
    if niche:
        query["niche"] = niche
    
    creators = await db.creator_profiles.find(query, {"_id": 0}).to_list(limit)
    
    # Filter by follower count
    filtered = []
    for c in creators:
        total_followers = sum(c.get("follower_stats", {}).values())
        if min_followers <= total_followers <= max_followers:
            filtered.append(c)
    
    return filtered

@api_router.get("/creators/{username}", response_model=CreatorProfile)
async def get_creator_by_username(username: str):
    creator = await db.creator_profiles.find_one({"username": username}, {"_id": 0})
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    return creator

@api_router.put("/creators/profile")
async def update_creator_profile(
    update_data: Dict[str, Any],
    user: dict = Depends(get_current_user)
):
    if user["role"] != "creator":
        raise HTTPException(status_code=403, detail="Only creators can update their profile")
    
    allowed_fields = ["display_name", "bio", "avatar", "social_links", "niche", "location", "store_theme"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    await db.creator_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": update_dict}
    )
    
    return {"message": "Profile updated"}

# ==================== PRODUCT ROUTES ====================

@api_router.post("/products", response_model=ProductResponse)
async def create_product(product: ProductCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "creator":
        raise HTTPException(status_code=403, detail="Only creators can create products")
    
    product_doc = {
        "id": str(uuid.uuid4()),
        "creator_id": user["id"],
        "title": product.title,
        "description": product.description,
        "price": product.price,
        "product_type": product.product_type,
        "files": product.files,
        "image": product.image,
        "affiliate_url": product.affiliate_url,
        "commission_rate": product.commission_rate,
        "sales_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.products.insert_one(product_doc)
    return ProductResponse(**product_doc)

@api_router.get("/products", response_model=List[ProductResponse])
async def get_products(creator_id: Optional[str] = None, user: dict = Depends(get_optional_user)):
    query = {}
    if creator_id:
        query["creator_id"] = creator_id
    elif user and user["role"] == "creator":
        query["creator_id"] = user["id"]
    
    products = await db.products.find(query, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, update_data: Dict[str, Any], user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id})
    if not product or product["creator_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Product not found")
    
    allowed_fields = ["title", "description", "price", "image", "files", "affiliate_url", "commission_rate"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    await db.products.update_one({"id": product_id}, {"$set": update_dict})
    return {"message": "Product updated"}

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, user: dict = Depends(get_current_user)):
    product = await db.products.find_one({"id": product_id})
    if not product or product["creator_id"] != user["id"]:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.products.delete_one({"id": product_id})
    return {"message": "Product deleted"}

# ==================== STORE ROUTES ====================

@api_router.get("/store/{username}")
async def get_public_store(username: str):
    store = await db.stores.find_one({"username": username}, {"_id": 0})
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    creator = await db.creator_profiles.find_one({"username": username}, {"_id": 0})
    products = await db.products.find({"creator_id": store["creator_id"]}, {"_id": 0}).to_list(50)
    
    return {
        "store": store,
        "creator": creator,
        "products": products
    }

@api_router.get("/store")
async def get_my_store(user: dict = Depends(get_current_user)):
    if user["role"] != "creator":
        raise HTTPException(status_code=403, detail="Only creators have stores")
    
    store = await db.stores.find_one({"creator_id": user["id"]}, {"_id": 0})
    return store

@api_router.put("/store")
async def update_store(store_data: StoreUpdate, user: dict = Depends(get_current_user)):
    if user["role"] != "creator":
        raise HTTPException(status_code=403, detail="Only creators can update stores")
    
    sections_dict = [s.model_dump() for s in store_data.sections]
    
    await db.stores.update_one(
        {"creator_id": user["id"]},
        {"$set": {"sections": sections_dict, "theme": store_data.theme}}
    )
    return {"message": "Store updated"}

@api_router.post("/store/publish")
async def publish_store(user: dict = Depends(get_current_user)):
    if user["role"] != "creator":
        raise HTTPException(status_code=403, detail="Only creators can publish stores")
    
    await db.stores.update_one(
        {"creator_id": user["id"]},
        {"$set": {"is_published": True}}
    )
    return {"message": "Store published"}

# ==================== MEMBERSHIP ROUTES ====================

@api_router.post("/memberships")
async def create_membership(membership: MembershipCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "creator":
        raise HTTPException(status_code=403, detail="Only creators can create memberships")
    
    membership_doc = {
        "id": str(uuid.uuid4()),
        "creator_id": user["id"],
        "tiers": [t.model_dump() for t in membership.tiers],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.memberships.update_one(
        {"creator_id": user["id"]},
        {"$set": membership_doc},
        upsert=True
    )
    return {"message": "Membership tiers created"}

@api_router.get("/memberships/{creator_id}")
async def get_memberships(creator_id: str):
    membership = await db.memberships.find_one({"creator_id": creator_id}, {"_id": 0})
    return membership or {"tiers": []}

# ==================== BRAND ROUTES ====================

@api_router.get("/brands/profile")
async def get_brand_profile(user: dict = Depends(get_current_user)):
    if user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can access this")
    
    profile = await db.brand_profiles.find_one({"user_id": user["id"]}, {"_id": 0})
    return profile

@api_router.put("/brands/profile")
async def update_brand_profile(update_data: Dict[str, Any], user: dict = Depends(get_current_user)):
    if user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can update their profile")
    
    allowed_fields = ["company_name", "industry", "logo", "website", "description"]
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    await db.brand_profiles.update_one(
        {"user_id": user["id"]},
        {"$set": update_dict}
    )
    return {"message": "Profile updated"}

# ==================== CAMPAIGN ROUTES ====================

@api_router.post("/campaigns", response_model=CampaignResponse)
async def create_campaign(campaign: CampaignCreate, user: dict = Depends(get_current_user)):
    if user["role"] != "brand":
        raise HTTPException(status_code=403, detail="Only brands can create campaigns")
    
    campaign_doc = {
        "id": str(uuid.uuid4()),
        "brand_id": user["id"],
        "title": campaign.title,
        "brief": campaign.brief,
        "budget": campaign.budget,
        "status": "active",
        "target_niche": campaign.target_niche,
        "target_followers_min": campaign.target_followers_min,
        "target_followers_max": campaign.target_followers_max,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.campaigns.insert_one(campaign_doc)
    return CampaignResponse(**campaign_doc)

@api_router.get("/campaigns", response_model=List[CampaignResponse])
async def get_campaigns(user: dict = Depends(get_current_user)):
    if user["role"] == "brand":
        campaigns = await db.campaigns.find({"brand_id": user["id"]}, {"_id": 0}).to_list(100)
    else:
        campaigns = await db.campaigns.find({"status": "active"}, {"_id": 0}).to_list(100)
    return campaigns

@api_router.get("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(campaign_id: str):
    campaign = await db.campaigns.find_one({"id": campaign_id}, {"_id": 0})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign

# ==================== DEAL ROUTES ====================

@api_router.post("/deals", response_model=DealResponse)
async def create_deal(deal: DealCreate, user: dict = Depends(get_current_user)):
    campaign = await db.campaigns.find_one({"id": deal.campaign_id})
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    deal_doc = {
        "id": str(uuid.uuid4()),
        "campaign_id": deal.campaign_id,
        "creator_id": deal.creator_id,
        "brand_id": campaign["brand_id"],
        "payment_amount": deal.payment_amount,
        "deliverables": deal.deliverables,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.deals.insert_one(deal_doc)
    return DealResponse(**deal_doc)

@api_router.get("/deals", response_model=List[DealResponse])
async def get_deals(user: dict = Depends(get_current_user)):
    if user["role"] == "creator":
        deals = await db.deals.find({"creator_id": user["id"]}, {"_id": 0}).to_list(100)
    elif user["role"] == "brand":
        deals = await db.deals.find({"brand_id": user["id"]}, {"_id": 0}).to_list(100)
    else:
        deals = []
    return deals

@api_router.put("/deals/{deal_id}/status")
async def update_deal_status(deal_id: str, status: str, user: dict = Depends(get_current_user)):
    deal = await db.deals.find_one({"id": deal_id})
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    if user["id"] not in [deal["creator_id"], deal["brand_id"]]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.deals.update_one({"id": deal_id}, {"$set": {"status": status}})
    return {"message": "Deal status updated"}

# ==================== AI TOOLS ROUTES (MOCKED) ====================

MOCK_AI_RESPONSES = {
    "idea_generator": {
        "ideas": [
            {"title": "10 Morning Routines That Changed My Life", "virality_score": 92, "platform": "YouTube"},
            {"title": "What $1 Gets You in Different Countries", "virality_score": 88, "platform": "TikTok"},
            {"title": "The Truth About Overnight Success", "virality_score": 85, "platform": "Instagram"},
            {"title": "I Tried AI Tools for 30 Days - Here's What Happened", "virality_score": 91, "platform": "YouTube"},
            {"title": "5 Mistakes Every Beginner Makes", "virality_score": 79, "platform": "TikTok"},
        ]
    },
    "script_writer": {
        "hook": "What if I told you that everything you know about productivity is wrong?",
        "script": "What if I told you that everything you know about productivity is wrong?\n\nFor years, I followed the same advice everyone gives - wake up at 5 AM, meditate, journal, exercise before work.\n\nBut here's the thing nobody tells you...\n\nYour peak productivity hours are unique to YOU. Some people are night owls, and that's not a flaw - it's a superpower.\n\nI stopped fighting my natural rhythm and started working WITH it. The result? I accomplish more in 4 focused hours than I used to in 10 scattered ones.\n\nDrop a comment if you want me to share my exact schedule.",
        "cta": "Follow for more productivity tips that actually work!"
    },
    "caption_writer": {
        "captions": [
            {"platform": "Instagram", "caption": "The algorithm doesn't pick favorites. It picks consistency. Day 47 of showing up. Your turn."},
            {"platform": "TikTok", "caption": "POV: You finally stopped overthinking and just posted"},
            {"platform": "Twitter", "caption": "Hot take: The best time to start was yesterday. The second best time is right now."}
        ]
    },
    "hashtag_optimizer": {
        "hashtags": {
            "high_reach": ["#viral", "#fyp", "#trending", "#explore"],
            "medium_competition": ["#contentcreator", "#creatorlife", "#growthtips"],
            "niche_specific": ["#smallcreator", "#newcreator", "#contentideas"],
            "recommended_mix": "#contentcreator #creatorlife #fyp #smallcreator #growthtips #viral"
        }
    },
    "thumbnail_generator": {
        "suggestions": [
            {"style": "Shocked face with bold text", "colors": ["#FF6B6B", "#FFFFFF"], "text_overlay": "YOU WON'T BELIEVE THIS"},
            {"style": "Before/After split", "colors": ["#6C5CE7", "#00D9FF"], "text_overlay": "THE TRANSFORMATION"},
            {"style": "Minimalist with arrow", "colors": ["#000000", "#00E676"], "text_overlay": "WATCH THIS"},
            {"style": "Question hook", "colors": ["#FFEA00", "#0D0D1A"], "text_overlay": "WHY DOES NOBODY TALK ABOUT THIS?"}
        ]
    },
    "analytics_interpreter": {
        "insights": [
            "Your videos under 60 seconds get 3x more engagement than longer content",
            "Tuesday and Thursday posts at 6PM perform 40% better than other times",
            "Your audience retention drops significantly at the 45-second mark - try stronger hooks",
            "Comments with questions drive 2x more replies - keep asking your audience questions",
            "Your tech content outperforms lifestyle by 2.5x - consider doubling down on tech"
        ],
        "recommendations": [
            "Post more short-form content (under 60 seconds)",
            "Schedule posts for Tuesday/Thursday at 6PM",
            "Add a hook or visual change at the 40-second mark",
            "End videos with a question to boost engagement"
        ]
    },
    "comment_responder": {
        "responses": [
            {"comment": "This is so helpful!", "response": "So glad it helped! Let me know if you have any questions"},
            {"comment": "How do you edit your videos?", "response": "I use CapCut for quick edits and Premiere Pro for longer projects! Tutorial coming soon"},
            {"comment": "First!", "response": "Love the enthusiasm! Hope you enjoyed the video"},
            {"comment": "This changed my perspective", "response": "That means so much to hear! What part resonated most with you?"}
        ]
    },
    "product_description": {
        "description": "Transform your content with our Premium Preset Pack - 25 professionally crafted Lightroom presets designed for content creators.\n\nIncludes:\n- 10 Moody & Cinematic presets\n- 8 Bright & Airy presets  \n- 7 Vintage Film presets\n\nOne-click installation. Works on mobile & desktop. Lifetime access + free updates.\n\nJoin 2,000+ creators already using these presets to level up their feed."
    }
}

@api_router.post("/ai/generate", response_model=AIToolResponse)
async def generate_ai_content(request: AIToolRequest, user: dict = Depends(get_current_user)):
    tool_type = request.tool_type
    
    if tool_type not in MOCK_AI_RESPONSES:
        raise HTTPException(status_code=400, detail=f"Unknown tool type: {tool_type}")
    
    output = MOCK_AI_RESPONSES[tool_type]
    
    # Log the generation
    generation_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "tool_type": tool_type,
        "input": request.input_data,
        "output": output,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.ai_generations.insert_one(generation_doc)
    
    return AIToolResponse(
        tool_type=tool_type,
        output=output,
        created_at=generation_doc["created_at"]
    )

@api_router.get("/ai/history")
async def get_ai_history(user: dict = Depends(get_current_user), limit: int = 20):
    generations = await db.ai_generations.find(
        {"user_id": user["id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(limit)
    return generations

# ==================== ANALYTICS ROUTES (MOCKED) ====================

@api_router.get("/analytics/overview")
async def get_analytics_overview(user: dict = Depends(get_current_user)):
    # Return mock analytics data
    return {
        "total_earnings": 4250.00,
        "earnings_change": 12.5,
        "store_visitors": 12847,
        "visitors_change": 8.3,
        "products_sold": 156,
        "sales_change": 23.0,
        "brand_offers": 8,
        "new_offers": 3,
        "conversion_rate": 3.2,
        "avg_order_value": 27.24
    }

@api_router.get("/analytics/revenue")
async def get_revenue_analytics(user: dict = Depends(get_current_user), period: str = "30d"):
    # Mock revenue data
    import random
    
    days = 30 if period == "30d" else 7 if period == "7d" else 90
    data = []
    
    for i in range(days):
        date = datetime.now(timezone.utc) - timedelta(days=days-i-1)
        data.append({
            "date": date.strftime("%Y-%m-%d"),
            "products": random.randint(50, 200),
            "memberships": random.randint(20, 80),
            "brand_deals": random.randint(0, 500) if random.random() > 0.7 else 0,
            "affiliate": random.randint(10, 50),
            "tips": random.randint(5, 30)
        })
    
    return {"period": period, "data": data}

@api_router.get("/analytics/activity")
async def get_recent_activity(user: dict = Depends(get_current_user)):
    # Mock recent activity
    activities = [
        {"type": "sale", "message": "Someone purchased 'Lightroom Preset Pack'", "amount": 29.00, "time": "2 minutes ago"},
        {"type": "subscriber", "message": "New subscriber to your Pro tier", "amount": 9.99, "time": "15 minutes ago"},
        {"type": "offer", "message": "Brand offer from TechGear Co.", "amount": 500.00, "time": "1 hour ago"},
        {"type": "message", "message": "New message from @NikeMarketing", "amount": None, "time": "3 hours ago"},
        {"type": "milestone", "message": "Your TikTok reached 50K views", "amount": None, "time": "5 hours ago"},
        {"type": "sale", "message": "Someone purchased 'Social Media Templates'", "amount": 19.00, "time": "6 hours ago"},
        {"type": "tip", "message": "Fan tip received", "amount": 10.00, "time": "8 hours ago"},
    ]
    return activities

# ==================== PAYMENT ROUTES ====================

@api_router.post("/payments/checkout")
async def create_checkout(request: CheckoutRequest, http_request: Request, user: dict = Depends(get_optional_user)):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    # Determine amount
    if request.product_id:
        product = await db.products.find_one({"id": request.product_id})
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        amount = float(product["price"])
    elif request.amount:
        amount = float(request.amount)
    else:
        raise HTTPException(status_code=400, detail="Product ID or amount required")
    
    # Build URLs
    success_url = f"{request.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{request.origin_url}/payment/cancel"
    
    # Initialize Stripe
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    # Create metadata
    metadata = request.metadata or {}
    if user:
        metadata["user_id"] = user["id"]
    if request.product_id:
        metadata["product_id"] = request.product_id
    
    # Create checkout session
    checkout_request = CheckoutSessionRequest(
        amount=amount,
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    session = await stripe_checkout.create_checkout_session(checkout_request)
    
    # Create transaction record
    transaction_doc = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "amount": amount,
        "currency": "usd",
        "status": "pending",
        "payment_status": "initiated",
        "user_id": user["id"] if user else None,
        "product_id": request.product_id,
        "metadata": metadata,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction_doc)
    
    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/payments/status/{session_id}")
async def get_payment_status(session_id: str, http_request: Request):
    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    host_url = str(http_request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    status = await stripe_checkout.get_checkout_status(session_id)
    
    # Update transaction in database
    update_data = {
        "status": status.status,
        "payment_status": status.payment_status
    }
    
    # Check if already processed to prevent duplicate processing
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    if transaction and transaction["payment_status"] != "paid" and status.payment_status == "paid":
        # Process the successful payment (e.g., increment sales count)
        if transaction.get("product_id"):
            await db.products.update_one(
                {"id": transaction["product_id"]},
                {"$inc": {"sales_count": 1}}
            )
    
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": update_data}
    )
    
    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    if not STRIPE_API_KEY:
        return {"status": "ok"}
    
    body = await request.body()
    signature = request.headers.get("Stripe-Signature")
    
    host_url = str(request.base_url)
    webhook_url = f"{host_url}api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    
    try:
        webhook_response = await stripe_checkout.handle_webhook(body, signature)
        
        # Update transaction based on webhook event
        if webhook_response.session_id:
            await db.payment_transactions.update_one(
                {"session_id": webhook_response.session_id},
                {"$set": {
                    "status": webhook_response.event_type,
                    "payment_status": webhook_response.payment_status
                }}
            )
        
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return {"status": "error"}

# ==================== SEED DATA ====================

@api_router.post("/seed")
async def seed_database():
    """Seed database with test data"""
    
    # Check if already seeded
    existing = await db.users.find_one({"email": "demo@creator.com"})
    if existing:
        return {"message": "Database already seeded"}
    
    # Create demo creator
    creator_id = str(uuid.uuid4())
    creator_user = {
        "id": creator_id,
        "email": "demo@creator.com",
        "name": "Sarah Creates",
        "role": "creator",
        "password_hash": hash_password("demo123"),
        "username": "sarahcreates",
        "avatar": "https://images.pexels.com/photos/7676395/pexels-photo-7676395.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=200&w=200",
        "bio": "Lifestyle creator & digital product expert",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(creator_user)
    
    creator_profile = {
        "id": str(uuid.uuid4()),
        "user_id": creator_id,
        "username": "sarahcreates",
        "display_name": "Sarah Creates",
        "bio": "Lifestyle creator helping you live your best life. Digital products, tips, and daily inspiration.",
        "avatar": "https://images.pexels.com/photos/7676395/pexels-photo-7676395.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=200&w=200",
        "social_links": {
            "youtube": "https://youtube.com/@sarahcreates",
            "instagram": "https://instagram.com/sarahcreates",
            "tiktok": "https://tiktok.com/@sarahcreates",
            "twitter": "https://twitter.com/sarahcreates"
        },
        "follower_stats": {"youtube": 125000, "instagram": 89000, "tiktok": 210000, "twitter": 45000},
        "niche": "Lifestyle",
        "location": "Los Angeles, CA",
        "is_verified": True,
        "store_theme": {"background": "#0D0D1A", "accent": "#6C5CE7"},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.creator_profiles.insert_one(creator_profile)
    
    # Create demo products
    products = [
        {
            "id": str(uuid.uuid4()),
            "creator_id": creator_id,
            "title": "Lightroom Preset Pack",
            "description": "25 professional presets for stunning photos",
            "price": 29.00,
            "product_type": "digital",
            "files": [],
            "image": "https://images.unsplash.com/photo-1654783912259-659d94fff000?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwY291cnNlJTIwY292ZXIlMjBhcnQlMjAzZCUyMGFic3RyYWN0JTIwZmxvYXRpbmclMjBib29rfGVufDB8fHx8MTc3NDM0MDA4OHww&ixlib=rb-4.1.0&q=85&w=400",
            "sales_count": 234,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "creator_id": creator_id,
            "title": "Content Calendar Template",
            "description": "12-month Notion template for content planning",
            "price": 19.00,
            "product_type": "digital",
            "files": [],
            "image": "https://images.pexels.com/photos/29652321/pexels-photo-29652321.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
            "sales_count": 156,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "creator_id": creator_id,
            "title": "Creator Masterclass",
            "description": "Complete course on building your creator business",
            "price": 149.00,
            "product_type": "digital",
            "files": [],
            "image": "https://images.pexels.com/photos/28408920/pexels-photo-28408920.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=400&w=400",
            "sales_count": 89,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.products.insert_many(products)
    
    # Create demo store
    store = {
        "id": str(uuid.uuid4()),
        "creator_id": creator_id,
        "username": "sarahcreates",
        "sections": [
            {"id": "1", "type": "bio", "title": "About Me", "content": {}, "order": 0},
            {"id": "2", "type": "social_links", "title": "Connect", "content": {}, "order": 1},
            {"id": "3", "type": "products", "title": "My Products", "content": {}, "order": 2},
            {"id": "4", "type": "tip_jar", "title": "Support Me", "content": {}, "order": 3}
        ],
        "theme": {"background": "#0D0D1A", "accent": "#6C5CE7"},
        "is_published": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.stores.insert_one(store)
    
    # Create demo brand
    brand_id = str(uuid.uuid4())
    brand_user = {
        "id": brand_id,
        "email": "demo@brand.com",
        "name": "TechGear Co.",
        "role": "brand",
        "password_hash": hash_password("demo123"),
        "username": "techgear",
        "avatar": None,
        "bio": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(brand_user)
    
    brand_profile = {
        "id": str(uuid.uuid4()),
        "user_id": brand_id,
        "company_name": "TechGear Co.",
        "industry": "Technology",
        "logo": "https://images.unsplash.com/photo-1686140386811-099f53c0dd54?crop=entropy&cs=srgb&fm=jpg&w=200",
        "website": "https://techgear.example.com",
        "description": "Premium tech accessories for creators",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.brand_profiles.insert_one(brand_profile)
    
    # Create demo campaigns
    campaigns = [
        {
            "id": str(uuid.uuid4()),
            "brand_id": brand_id,
            "title": "Product Launch - Wireless Mic",
            "brief": "Looking for tech creators to review our new wireless microphone. 60-second video showing the product in action.",
            "budget": 500.00,
            "status": "active",
            "target_niche": "Tech",
            "target_followers_min": 10000,
            "target_followers_max": 500000,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "brand_id": brand_id,
            "title": "Holiday Gift Guide",
            "brief": "Feature our products in your holiday gift guide content. Static post or story.",
            "budget": 300.00,
            "status": "active",
            "target_niche": None,
            "target_followers_min": 5000,
            "target_followers_max": 200000,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    await db.campaigns.insert_many(campaigns)
    
    # Create more demo creators for discovery
    more_creators = [
        {
            "user": {
                "id": str(uuid.uuid4()),
                "email": "mike@tech.com",
                "name": "Tech With Mike",
                "role": "creator",
                "password_hash": hash_password("demo123"),
                "username": "techwithmike",
                "avatar": "https://images.pexels.com/photos/7676403/pexels-photo-7676403.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=200&w=200",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            "profile": {
                "display_name": "Tech With Mike",
                "bio": "Honest tech reviews and tutorials",
                "niche": "Tech",
                "follower_stats": {"youtube": 520000, "instagram": 180000, "tiktok": 340000, "twitter": 95000}
            }
        },
        {
            "user": {
                "id": str(uuid.uuid4()),
                "email": "jay@fitness.com",
                "name": "Fitness Jay",
                "role": "creator",
                "password_hash": hash_password("demo123"),
                "username": "fitnessjay",
                "avatar": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            "profile": {
                "display_name": "Fitness Jay",
                "bio": "Transform your body, transform your life",
                "niche": "Fitness",
                "follower_stats": {"youtube": 89000, "instagram": 245000, "tiktok": 180000, "twitter": 32000}
            }
        },
        {
            "user": {
                "id": str(uuid.uuid4()),
                "email": "luna@design.com",
                "name": "Design By Luna",
                "role": "creator",
                "password_hash": hash_password("demo123"),
                "username": "designbyluna",
                "avatar": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            "profile": {
                "display_name": "Design By Luna",
                "bio": "UI/UX designer sharing tips and resources",
                "niche": "Design",
                "follower_stats": {"youtube": 45000, "instagram": 120000, "tiktok": 78000, "twitter": 28000}
            }
        }
    ]
    
    for creator_data in more_creators:
        await db.users.insert_one(creator_data["user"])
        profile = {
            "id": str(uuid.uuid4()),
            "user_id": creator_data["user"]["id"],
            "username": creator_data["user"]["username"],
            "avatar": creator_data["user"]["avatar"],
            "social_links": {},
            "location": None,
            "is_verified": False,
            "store_theme": {"background": "#0D0D1A", "accent": "#6C5CE7"},
            "created_at": datetime.now(timezone.utc).isoformat(),
            **creator_data["profile"]
        }
        await db.creator_profiles.insert_one(profile)
        
        # Create store for each creator
        store = {
            "id": str(uuid.uuid4()),
            "creator_id": creator_data["user"]["id"],
            "username": creator_data["user"]["username"],
            "sections": [],
            "theme": {"background": "#0D0D1A", "accent": "#6C5CE7"},
            "is_published": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.stores.insert_one(store)
    
    return {"message": "Database seeded successfully"}

# ==================== ROOT & HEALTH ====================

@api_router.get("/")
async def root():
    return {"message": "CreatorFlow API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
