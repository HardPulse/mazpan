from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, timedelta
import os
import motor.motor_asyncio
import uuid
import hashlib
import jwt
import re
from passlib.context import CryptContext
import json
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "gyat_panel")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
database: AsyncIOMotorDatabase = client[DB_NAME]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = "gyat-panel-secret-key-2024"
ALGORITHM = "HS256"

# Models
class UserRegistration(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class AccountData(BaseModel):
    accounts_text: str
    folder_id: Optional[str] = None

class FolderCreate(BaseModel):
    name: str

class AccountsDownload(BaseModel):
    account_ids: List[str]

class AccountsMove(BaseModel):
    account_ids: List[str]
    folder_id: str

class AccountsDelete(BaseModel):
    account_ids: List[str]

class TimeSettings(BaseModel):
    hours: int
    folder_id: Optional[str] = None

class SelectAccounts(BaseModel):
    criteria: str  # "cooldown", "geo", "all"
    value: Optional[str] = None
    folder_id: Optional[str] = None

class AdminAction(BaseModel):
    user_id: str
    action: str  # "approve", "reject", "block", "unblock", "change_status", "change_balance"
    value: Optional[Union[str, float]] = None

class DeleteUser(BaseModel):
    user_id: str

class UserSettings(BaseModel):
    current_password: str
    new_password: Optional[str] = None
    language: Optional[str] = None

# Shop Models
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class ProductCreate(BaseModel):
    title: str
    description: str
    price: float
    category_id: str
    product_type: str  # "accounts" or "other"
    platform: Optional[str] = None  # "web" or "mobile" for accounts
    geo: Optional[str] = None  # for accounts
    domain: Optional[str] = None  # NEW: domain field for accounts
    content: str  # accounts data or text content
    is_unique: Optional[bool] = True  # for "other" type products

class ProductPurchase(BaseModel):
    product_id: str
    quantity: int
    min_age_hours: Optional[int] = None  # for accounts filtering by age

# Statistics Models
class DailyStats(BaseModel):
    date: str
    total_sales: int
    total_revenue: float
    purchases: List[Dict[str, Any]]

# Role Upgrade Models
class RoleUpgrade(BaseModel):
    target_role: str  # "Super User" or "VIP User"

class AdminUserEdit(BaseModel):
    user_id: str
    action: str  # "add_balance", "set_role", "block", "unblock"
    value: Optional[Union[str, float, int]] = None  # balance amount, role name, or days for role
    days: Optional[int] = 30  # days for temporary roles (Super User, VIP User)

# Utility functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

    user = await database.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

# Role management functions
def get_role_prices():
    """Get prices for role upgrades"""
    return {
        "Super User": 25.0,
        "VIP User": 60.0
    }

def get_available_upgrades(current_role: str):
    """Get available role upgrades for current role"""
    upgrades = {
        "User": ["Super User", "VIP User"],
        "Super User": ["VIP User"],
        "VIP User": ["VIP User"],  # Can only extend VIP
        "Admin": [],  # Admin can't upgrade
        "Support": []  # Support can't upgrade
    }
    return upgrades.get(current_role, [])

async def check_and_update_expired_roles():
    """Check and downgrade expired roles to User"""
    current_time = datetime.utcnow()
    
    # Find users with expired roles
    expired_users = await database.users.find({
        "role_expires_at": {"$lt": current_time},
        "status": {"$in": ["Super User", "VIP User"]}
    }).to_list(None)
    
    for user in expired_users:
        await database.users.update_one(
            {"user_id": user["user_id"]},
            {
                "$set": {"status": "User"},
                "$unset": {"role_expires_at": ""}
            }
        )
        logger.info(f"Role expired for user {user['user_id']}, downgraded to User")

async def extend_user_role(user_id: str, role: str, days: int = 30):
    """Extend user role by specified days"""
    current_time = datetime.utcnow()
    
    # Get current user
    user = await database.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Calculate new expiration date
    if user.get("role_expires_at") and user.get("status") == role:
        # If user already has this role and it hasn't expired, extend from current expiration
        current_expiry = user["role_expires_at"]
        if current_expiry > current_time:
            new_expiry = current_expiry + timedelta(days=days)
        else:
            new_expiry = current_time + timedelta(days=days)
    else:
        # New role or expired role, start from now
        new_expiry = current_time + timedelta(days=days)
    
    # Update user role and expiration
    await database.users.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "status": role,
                "role_expires_at": new_expiry
            }
        }
    )
    
    return new_expiry

def parse_account_format(line: str) -> Dict[str, Any]:
    """Parse account line - supports multiple formats including 6-field format"""
    parts = line.strip().split('|')
    
    if len(parts) >= 2:
        # Determine format type and parse accordingly
        if len(parts) == 6:
            # New 6-field format: email|email_password|login|account_password|data1|data2
            account_data = {
                "email": parts[0],
                "email_password": parts[1],
                "login": parts[2],
                "account_password": parts[3],
                "geo": "N/A",  # Set N/A for 6-field format as requested
                "data1": parts[4],  # Additional data field 1
                "data2": parts[5],  # Additional data field 2
                "format_type": 6,
                "raw_data": line.strip()
            }
        elif len(parts) == 5:
            # Standard 5-field format: email|email_password|login|account_password|geo
            account_data = {
                "email": parts[0],
                "email_password": parts[1],
                "login": parts[2],
                "account_password": parts[3],
                "geo": parts[4] if parts[4] else None,
                "data1": None,
                "data2": None,
                "format_type": 5,
                "raw_data": line.strip()
            }
        else:
            # Flexible parsing for other formats - use available parts
            account_data = {
                "email": parts[0] if len(parts) > 0 else "",
                "email_password": parts[1] if len(parts) > 1 else "",
                "login": parts[2] if len(parts) > 2 else parts[0],  # fallback to email
                "account_password": parts[3] if len(parts) > 3 else parts[1],  # fallback to email_pass
                "geo": parts[4] if len(parts) > 4 else None,
                "data1": None,
                "data2": None,
                "format_type": len(parts),
                "raw_data": line.strip()
            }
        return account_data
    else:
        # Single value - treat as username/login
        return {
            "email": line.strip(),
            "email_password": "",
            "login": line.strip(),
            "account_password": "",
            "geo": None,
            "data1": None,
            "data2": None,
            "format_type": 1,
            "raw_data": line.strip()
        }

@app.on_event("startup")
async def startup_event():
    pass

# Auth endpoints
@app.post("/api/register")
async def register(user_data: UserRegistration):
    # Check if user exists
    existing_user = await database.users.find_one({"username": user_data.username}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Validate password
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    # Create user
    user_id = str(uuid.uuid4())
    new_user = {
        "user_id": user_id,
        "username": user_data.username,
        "password": hash_password(user_data.password),
        "plain_password": user_data.password,
        "status": "User",
        "balance": 0.0,
        "approved": False,
        "blocked": False,
        "created_at": datetime.utcnow(),
        "language": "ru"
    }

    await database.users.insert_one(new_user)

    return {"message": "Registration successful. Waiting for admin approval."}

@app.post("/api/login")
async def login(user_data: UserLogin):
    user = await database.users.find_one({"username": user_data.username}, {"_id": 0})

    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user["blocked"]:
        raise HTTPException(status_code=401, detail="Account is blocked")

    if not user["approved"]:
        raise HTTPException(status_code=401, detail="Account not approved yet")

    access_token = create_access_token(data={"sub": user["user_id"]})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "status": user["status"],
            "balance": user["balance"],
            "language": user.get("language", "ru")
        }
    }

@app.get("/api/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "status": current_user["status"],
        "balance": current_user["balance"],
        "language": current_user.get("language", "ru")
    }

# Folders endpoints
@app.get("/api/folders")
async def get_folders(current_user: dict = Depends(get_current_user)):
    folders = await database.folders.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(None)

    # Ensure Main folder exists
    main_folder = next((f for f in folders if f["name"] == "Main"), None)
    if not main_folder:
        main_folder = {
            "folder_id": str(uuid.uuid4()),
            "user_id": current_user["user_id"],
            "name": "Main",
            "cooldown_hours": 1,
            "created_at": datetime.utcnow()
        }
        await database.folders.insert_one(main_folder)
        folders.append(main_folder)

    return {"folders": folders}

@app.post("/api/folders")
async def create_folder(folder_data: FolderCreate, current_user: dict = Depends(get_current_user)):
    folder = {
        "folder_id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "name": folder_data.name,
        "cooldown_hours": 1,
        "created_at": datetime.utcnow()
    }

    await database.folders.insert_one(folder)

    # Return folder without _id
    folder_response = {
        "folder_id": folder["folder_id"],
        "user_id": folder["user_id"],
        "name": folder["name"],
        "cooldown_hours": folder["cooldown_hours"],
        "created_at": folder["created_at"]
    }

    return {"folder": folder_response}

@app.delete("/api/folders/{folder_id}")
async def delete_folder(folder_id: str, current_user: dict = Depends(get_current_user)):
    folder = await database.folders.find_one({"folder_id": folder_id, "user_id": current_user["user_id"]}, {"_id": 0})

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    if folder["name"] == "Main":
        raise HTTPException(status_code=400, detail="Cannot delete Main folder")

    # Move all accounts from this folder to Main
    main_folder = await database.folders.find_one({"user_id": current_user["user_id"], "name": "Main"}, {"_id": 0})
    await database.accounts.update_many(
        {"folder_id": folder_id},
        {"$set": {"folder_id": main_folder["folder_id"]}}
    )

    await database.folders.delete_one({"folder_id": folder_id})
    return {"message": "Folder deleted"}

# Accounts endpoints
@app.post("/api/accounts")
async def upload_accounts(account_data: AccountData, current_user: dict = Depends(get_current_user)):
    lines = [line.strip() for line in account_data.accounts_text.split('\n') if line.strip()]

    if not lines:
        raise HTTPException(status_code=400, detail="No account data provided")

    folder_id = account_data.folder_id
    if not folder_id:
        # Get Main folder
        main_folder = await database.folders.find_one({"user_id": current_user["user_id"], "name": "Main"}, {"_id": 0})
        folder_id = main_folder["folder_id"]

    accounts = []
    for line in lines:
        try:
            account_info = parse_account_format(line)
            account = {
                "account_id": str(uuid.uuid4()),
                "user_id": current_user["user_id"],
                "folder_id": folder_id,
                "uploaded_at": datetime.utcnow(),
                **account_info
            }
            accounts.append(account)
        except Exception as e:
            logger.warning(f"Skipping invalid account format: {line}")
            continue

    if accounts:
        await database.accounts.insert_many(accounts)

    return {"message": f"Uploaded {len(accounts)} accounts", "count": len(accounts)}

@app.get("/api/accounts")
async def get_accounts(folder_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["user_id"]}
    if folder_id:
        query["folder_id"] = folder_id

    accounts = await database.accounts.find(query, {"_id": 0}).to_list(None)

    # Get folder info for cooldown calculation
    folders = await database.folders.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(None)
    folder_map = {f["folder_id"]: f for f in folders}

    # Calculate cooldown status
    for account in accounts:
        folder = folder_map.get(account["folder_id"])
        if folder:
            cooldown_hours = folder.get("cooldown_hours", 1)
            time_diff = datetime.utcnow() - account["uploaded_at"]
            account["cooldown_completed"] = time_diff >= timedelta(hours=cooldown_hours)
            account["time_since_upload"] = str(time_diff).split('.')[0]  # Remove microseconds
        else:
            account["cooldown_completed"] = False
            account["time_since_upload"] = "0:00:00"

    return {"accounts": accounts}

@app.post("/api/accounts/download")
async def download_accounts(download_data: AccountsDownload, current_user: dict = Depends(get_current_user)):
    accounts = await database.accounts.find({
        "account_id": {"$in": download_data.account_ids},
        "user_id": current_user["user_id"]
    }, {"_id": 0}).to_list(None)

    account_lines = []
    for account in accounts:
        # Use raw_data if available, otherwise reconstruct based on format
        if account.get("raw_data"):
            account_lines.append(account["raw_data"])
        else:
            # Fallback reconstruction based on format type
            if account.get("format_type") == 6:
                # 6-field format: email|email_password|login|account_password|data1|data2
                line = f"{account['email']}|{account['email_password']}|{account['login']}|{account['account_password']}|{account.get('data1', '')}|{account.get('data2', '')}"
            elif account.get("format_type") == 5:
                # 5-field format: email|email_password|login|account_password|geo
                line = f"{account['email']}|{account['email_password']}|{account['login']}|{account['account_password']}|{account.get('geo', '')}"
            elif account.get("format_type") == 1:
                # Single field format
                line = account['email']
            else:
                # Default fallback for other formats
                line = f"{account['email']}|{account['email_password']}|{account['login']}|{account['account_password']}|{account.get('geo', '')}"
            account_lines.append(line)

    return {"content": "\n".join(account_lines), "filename": f"accounts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"}

@app.post("/api/accounts/move")
async def move_accounts(move_data: AccountsMove, current_user: dict = Depends(get_current_user)):
    result = await database.accounts.update_many(
        {
            "account_id": {"$in": move_data.account_ids},
            "user_id": current_user["user_id"]
        },
        {"$set": {"folder_id": move_data.folder_id}}
    )

    return {"message": f"Moved {result.modified_count} accounts"}

@app.post("/api/accounts/delete")
async def delete_accounts(delete_data: AccountsDelete, current_user: dict = Depends(get_current_user)):
    result = await database.accounts.delete_many({
        "account_id": {"$in": delete_data.account_ids},
        "user_id": current_user["user_id"]
    })

    return {"message": f"Deleted {result.deleted_count} accounts"}

@app.post("/api/folders/{folder_id}/cooldown")
async def set_folder_cooldown(folder_id: str, time_settings: TimeSettings, current_user: dict = Depends(get_current_user)):
    result = await database.folders.update_one(
        {"folder_id": folder_id, "user_id": current_user["user_id"]},
        {"$set": {"cooldown_hours": time_settings.hours}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Folder not found")

    return {"message": f"Cooldown time set to {time_settings.hours} hours"}

@app.post("/api/accounts/select")
async def select_accounts(select_data: SelectAccounts, current_user: dict = Depends(get_current_user)):
    query = {"user_id": current_user["user_id"]}

    if select_data.folder_id:
        query["folder_id"] = select_data.folder_id

    if select_data.criteria == "geo" and select_data.value:
        query["geo"] = select_data.value

    accounts = await database.accounts.find(query, {"_id": 0}).to_list(None)

    if select_data.criteria == "cooldown":
        # Get folder info for cooldown calculation
        folders = await database.folders.find({"user_id": current_user["user_id"]}, {"_id": 0}).to_list(None)
        folder_map = {f["folder_id"]: f for f in folders}

        cooldown_accounts = []
        for account in accounts:
            folder = folder_map.get(account["folder_id"])
            if folder:
                cooldown_hours = folder.get("cooldown_hours", 1)
                time_diff = datetime.utcnow() - account["uploaded_at"]
                if time_diff >= timedelta(hours=cooldown_hours):
                    cooldown_accounts.append(account["account_id"])

        return {"account_ids": cooldown_accounts}

    return {"account_ids": [account["account_id"] for account in accounts]}

# Shop endpoints
@app.get("/api/shop/categories")
async def get_categories(current_user: dict = Depends(get_current_user)):
    categories = await database.categories.find({}, {"_id": 0}).to_list(None)
    return {"categories": categories}

@app.post("/api/shop/categories")
async def create_category(category_data: CategoryCreate, current_user: dict = Depends(get_current_user)):
    if current_user["status"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admin can create categories")
    
    category = {
        "category_id": str(uuid.uuid4()),
        "name": category_data.name,
        "description": category_data.description,
        "created_at": datetime.utcnow()
    }
    
    await database.categories.insert_one(category)
    return {"category": {k: v for k, v in category.items() if k != "_id"}}

@app.delete("/api/shop/categories/{category_id}")
async def delete_category(category_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["status"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admin can delete categories")
    
    # Check if category exists
    category = await database.categories.find_one({"category_id": category_id}, {"_id": 0})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if there are products in this category and delete them first
    products_count = await database.products.count_documents({"category_id": category_id})
    if products_count > 0:
        # Delete all products in this category first
        delete_result = await database.products.delete_many({"category_id": category_id})
        logger.info(f"Deleted {delete_result.deleted_count} products from category {category_id}")
    
    # Delete the category
    result = await database.categories.delete_one({"category_id": category_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {
        "message": "Category deleted successfully",
        "deleted_products": products_count
    }

@app.get("/api/shop/products")
async def get_products(
    category_id: Optional[str] = None,
    product_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"available_quantity": {"$gt": 0}}
    
    if category_id:
        query["category_id"] = category_id
    if product_type:
        query["product_type"] = product_type
        
    products = await database.products.find(query, {"_id": 0}).to_list(None)
    
    # For accounts, calculate available quantities by age
    for product in products:
        if product["product_type"] == "accounts":
            # Parse content to get individual accounts with timestamps
            lines = [line.strip() for line in product["content"].split('\n') if line.strip()]
            now = datetime.utcnow()
            
            age_stats = {
                "0h": 0, "1h": 0, "4h": 0, "12h": 0, "24h": 0, "36h": 0
            }
            
            # Simulate account ages based on product creation time
            created_at = product["created_at"]
            for i, line in enumerate(lines):
                # Each account has slightly different upload time
                account_age = now - (created_at + timedelta(minutes=i))
                hours = account_age.total_seconds() / 3600
                
                if hours >= 36:
                    age_stats["36h"] += 1
                elif hours >= 24:
                    age_stats["24h"] += 1
                elif hours >= 12:
                    age_stats["12h"] += 1
                elif hours >= 4:
                    age_stats["4h"] += 1
                elif hours >= 1:
                    age_stats["1h"] += 1
                else:
                    age_stats["0h"] += 1
            
            product["age_stats"] = age_stats
    
    return {"products": products}

@app.post("/api/shop/products")
async def create_product(product_data: ProductCreate, current_user: dict = Depends(get_current_user)):
    if current_user["status"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admin can create products")
    
    # Calculate quantity based on product type
    if product_data.product_type == "accounts":
        lines = [line.strip() for line in product_data.content.split('\n') if line.strip()]
        available_quantity = len(lines)
    else:
        available_quantity = 1 if product_data.is_unique else 999999
    
    product = {
        "product_id": str(uuid.uuid4()),
        "title": product_data.title,
        "description": product_data.description,
        "price": product_data.price,
        "category_id": product_data.category_id,
        "product_type": product_data.product_type,
        "platform": product_data.platform,
        "geo": product_data.geo,
        "domain": product_data.domain,  # NEW: domain field
        "content": product_data.content,
        "is_unique": product_data.is_unique,
        "original_quantity": available_quantity,
        "available_quantity": available_quantity,
        "sold_quantity": 0,
        "created_at": datetime.utcnow(),
        "created_by": current_user["user_id"]
    }
    
    await database.products.insert_one(product)
    return {"product": {k: v for k, v in product.items() if k != "_id"}}

@app.post("/api/shop/purchase")
async def purchase_product(purchase_data: ProductPurchase, current_user: dict = Depends(get_current_user)):
    product = await database.products.find_one({"product_id": purchase_data.product_id}, {"_id": 0})
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product["available_quantity"] < purchase_data.quantity:
        raise HTTPException(status_code=400, detail="Not enough quantity available")
    
    total_cost = product["price"] * purchase_data.quantity
    
    if current_user["balance"] < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # For accounts type, handle age filtering
    content_lines = []
    if product["product_type"] == "accounts":
        lines = [line.strip() for line in product["content"].split('\n') if line.strip()]
        
        if purchase_data.min_age_hours:
            # Filter accounts by age
            now = datetime.utcnow()
            created_at = product["created_at"]
            filtered_lines = []
            
            for i, line in enumerate(lines):
                account_age = now - (created_at + timedelta(minutes=i))
                hours = account_age.total_seconds() / 3600
                
                if hours >= purchase_data.min_age_hours:
                    filtered_lines.append(line)
                    
                if len(filtered_lines) >= purchase_data.quantity:
                    break
            
            if len(filtered_lines) < purchase_data.quantity:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Only {len(filtered_lines)} accounts available with {purchase_data.min_age_hours}+ hours age"
                )
            
            content_lines = filtered_lines[:purchase_data.quantity]
        else:
            content_lines = lines[:purchase_data.quantity]
        
        # Update product content (remove sold accounts)
        remaining_lines = lines[purchase_data.quantity:]
        updated_content = '\n'.join(remaining_lines)
    else:
        content_lines = [product["content"]]
        updated_content = product["content"] if not product["is_unique"] else ""
    
    # Update product availability
    new_available = product["available_quantity"] - purchase_data.quantity
    if product["product_type"] == "other" and product["is_unique"]:
        new_available = 0
    
    await database.products.update_one(
        {"product_id": purchase_data.product_id},
        {
            "$set": {
                "available_quantity": new_available,
                "sold_quantity": product["sold_quantity"] + purchase_data.quantity,
                "content": updated_content
            }
        }
    )
    
    # Update user balance
    await database.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$inc": {"balance": -total_cost}}
    )
    
    # Create purchase record
    purchase_record = {
        "purchase_id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "username": current_user["username"],  # For statistics
        "product_id": purchase_data.product_id,
        "product_title": product["title"],
        "quantity": purchase_data.quantity,
        "unit_price": product["price"],
        "total_cost": total_cost,
        "content": '\n'.join(content_lines),
        "purchased_at": datetime.utcnow(),
        "min_age_hours": purchase_data.min_age_hours
    }
    
    await database.purchases.insert_one(purchase_record)
    
    return {
        "message": "Purchase successful",
        "content": '\n'.join(content_lines),
        "filename": f"purchase_{purchase_record['purchase_id']}.txt",
        "total_cost": total_cost,
        "new_balance": current_user["balance"] - total_cost
    }

@app.get("/api/shop/purchases")
async def get_user_purchases(current_user: dict = Depends(get_current_user)):
    purchases = await database.purchases.find(
        {"user_id": current_user["user_id"]}, 
        {"_id": 0}
    ).to_list(None)
    return {"purchases": purchases}

@app.delete("/api/shop/products/{product_id}")
async def delete_product(product_id: str, current_user: dict = Depends(get_current_user)):
    if current_user["status"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admin can delete products")
    
    result = await database.products.delete_one({"product_id": product_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"message": "Product deleted successfully"}

@app.put("/api/shop/products/{product_id}")
async def update_product(product_id: str, product_data: ProductCreate, current_user: dict = Depends(get_current_user)):
    if current_user["status"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admin can update products")
    
    # Check if product exists
    existing_product = await database.products.find_one({"product_id": product_id}, {"_id": 0})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Calculate new quantity based on product type
    if product_data.product_type == "accounts":
        lines = [line.strip() for line in product_data.content.split('\n') if line.strip()]
        available_quantity = len(lines)
    else:
        available_quantity = 1 if product_data.is_unique else 999999
    
    # Calculate sold quantity to maintain it
    sold_quantity = existing_product.get("sold_quantity", 0)
    
    update_data = {
        "title": product_data.title,
        "description": product_data.description,
        "price": product_data.price,
        "category_id": product_data.category_id,
        "product_type": product_data.product_type,
        "platform": product_data.platform,
        "geo": product_data.geo,
        "domain": product_data.domain,
        "content": product_data.content,
        "is_unique": product_data.is_unique,
        "original_quantity": available_quantity,
        "available_quantity": available_quantity,
        "sold_quantity": sold_quantity,
        "updated_at": datetime.utcnow()
    }
    
    result = await database.products.update_one(
        {"product_id": product_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update product")
    
    return {"message": "Product updated successfully"}

@app.get("/api/shop/products/{product_id}")
async def get_product(product_id: str, current_user: dict = Depends(get_current_user)):
    product = await database.products.find_one({"product_id": product_id}, {"_id": 0})
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    return {"product": product}

# NEW: Statistics endpoint for admin
@app.get("/api/admin/shop-statistics")
async def get_shop_statistics(current_user: dict = Depends(get_current_user)):
    if current_user["status"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admin can view statistics")
    
    # Get current date for daily statistics
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    # Get today's purchases
    today_purchases = await database.purchases.find({
        "purchased_at": {
            "$gte": start_of_day,
            "$lte": end_of_day
        }
    }, {"_id": 0}).to_list(None)
    
    # Calculate statistics
    total_sales = len(today_purchases)
    total_revenue = sum(purchase["total_cost"] for purchase in today_purchases)
    
    # Format purchase details for display
    purchase_details = []
    for purchase in today_purchases:
        purchase_details.append({
            "username": purchase.get("username", "Unknown"),
            "product_title": purchase["product_title"],
            "quantity": purchase["quantity"],
            "total_cost": purchase["total_cost"],
            "purchased_at": purchase["purchased_at"].strftime("%H:%M:%S")
        })
    
    return {
        "date": today.strftime("%Y-%m-%d"),
        "total_sales": total_sales,
        "total_revenue": round(total_revenue, 2),
        "purchases": purchase_details
    }

# NEW: 7-day statistics endpoint for admin (balance top-ups and role purchases only)
@app.get("/api/admin/statistics")
async def get_admin_statistics(current_user: dict = Depends(get_current_user)):
    if current_user["status"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admin can view statistics")
    
    # Get date range for last 7 days
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=7)
    
    # Get balance operations (top-ups) from user_logs collection
    balance_operations = []
    try:
        balance_operations = await database.user_logs.find({
            "timestamp": {
                "$gte": start_date,
                "$lte": end_date
            },
            "action": {"$in": ["admin_balance_add", "admin_balance_set"]}
        }, {"_id": 0}).to_list(None)
    except:
        balance_operations = []
    
    # Get role purchases from user_logs collection
    role_operations = []
    try:
        role_operations = await database.user_logs.find({
            "timestamp": {
                "$gte": start_date,
                "$lte": end_date
            },
            "action": {"$in": ["role_purchase", "role_upgrade"]}
        }, {"_id": 0}).to_list(None)
    except:
        role_operations = []
    
    # Calculate daily statistics
    daily_stats = {}
    for i in range(7):
        date = (end_date - timedelta(days=i)).date()
        daily_stats[date.strftime("%Y-%m-%d")] = {
            "date": date.strftime("%Y-%m-%d"),
            "balance_topups": 0,
            "balance_topups_amount": 0.0,
            "role_purchases": 0,
            "role_purchases_amount": 0.0
        }
    
    # Process balance operations
    for operation in balance_operations:
        date_str = operation["timestamp"].date().strftime("%Y-%m-%d")
        if date_str in daily_stats:
            daily_stats[date_str]["balance_topups"] += 1
            daily_stats[date_str]["balance_topups_amount"] += operation.get("amount", 0.0)
    
    # Process role operations
    for operation in role_operations:
        date_str = operation["timestamp"].date().strftime("%Y-%m-%d")
        if date_str in daily_stats:
            daily_stats[date_str]["role_purchases"] += 1
            daily_stats[date_str]["role_purchases_amount"] += operation.get("amount", 0.0)
    
    # Convert to list and sort by date
    stats_list = list(daily_stats.values())
    stats_list.sort(key=lambda x: x["date"], reverse=True)
    
    # Calculate totals
    total_balance_topups = sum(day["balance_topups"] for day in stats_list)
    total_balance_amount = sum(day["balance_topups_amount"] for day in stats_list)
    total_role_purchases = sum(day["role_purchases"] for day in stats_list)
    total_role_amount = sum(day["role_purchases_amount"] for day in stats_list)
    
    # Prepare detailed operations for display
    all_operations = []
    
    # Add balance operations
    for operation in balance_operations:
        all_operations.append({
            "type": "balance_topup",
            "username": operation.get("username", "Unknown"),
            "amount": operation.get("amount", 0.0),
            "timestamp": operation["timestamp"],
            "description": f"Пополнение счета на ${operation.get('amount', 0.0)}"
        })
    
    # Add role operations
    for operation in role_operations:
        all_operations.append({
            "type": "role_purchase",
            "username": operation.get("username", "Unknown"),
            "amount": operation.get("amount", 0.0),
            "timestamp": operation["timestamp"],
            "description": f"Покупка роли {operation.get('role', 'Unknown')} за ${operation.get('amount', 0.0)}"
        })
    
    # Sort operations by timestamp (newest first)
    all_operations.sort(key=lambda x: x["timestamp"], reverse=True)
    
    return {
        "period": "7 days",
        "start_date": start_date.strftime("%Y-%m-%d"),
        "end_date": end_date.strftime("%Y-%m-%d"),
        "daily_stats": stats_list,
        "operations": all_operations,
        "totals": {
            "balance_topups": total_balance_topups,
            "balance_topups_amount": round(total_balance_amount, 2),
            "role_purchases": total_role_purchases,
            "role_purchases_amount": round(total_role_amount, 2),
            "total_revenue": round(total_balance_amount + total_role_amount, 2)
        }
    }

# Admin endpoints
@app.get("/api/admin/pending-users")
async def get_pending_users(current_user: dict = Depends(get_current_user)):
    if current_user["status"] not in ["Admin", "Support"]:
        raise HTTPException(status_code=403, detail="Access denied")

    users = await database.users.find({"approved": False}, {"_id": 0}).to_list(None)
    return {"users": users}

@app.get("/api/admin/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    if current_user["status"] not in ["Admin", "Support"]:
        raise HTTPException(status_code=403, detail="Access denied")

    query = {}
    if current_user["status"] == "Support":
        query["$and"] = [
            {"status": {"$nin": ["Admin", "Support"]}},  # Исключаем Admin и Support
            {"user_id": {"$ne": current_user["user_id"]}}  # Исключаем текущего пользователя
        ]

    users = await database.users.find(query, {"_id": 0}).to_list(None)
    return {"users": users}

@app.post("/api/admin/user-action")
async def admin_user_action(action_data: AdminAction, current_user: dict = Depends(get_current_user)):
    logger.info(f"Admin action requested: {action_data.action} for user_id: {action_data.user_id} by {current_user['status']} ({current_user['user_id']}) with value: {action_data.value}")

    if current_user["status"] not in ["Admin", "Support"]:
        logger.error("Access denied: User not Admin or Support")
        raise HTTPException(status_code=403, detail="Access denied")

    target_user = await database.users.find_one({"user_id": action_data.user_id}, {"_id": 0})
    if not target_user:
        logger.error(f"User not found: {action_data.user_id}")
        raise HTTPException(status_code=404, detail="User not found")

    # Support can't modify Admin or Support users or themselves
    if current_user["status"] == "Support":
        if target_user["status"] in ["Admin", "Support"]:
            logger.error("Support cannot modify Admin or Support users")
            raise HTTPException(status_code=403, detail="Cannot modify admin or support users")
        if target_user["user_id"] == current_user["user_id"]:
            logger.error("Support cannot modify own account")
            raise HTTPException(status_code=403, detail="Cannot modify own account")

    update_data = {}

    if action_data.action == "approve":
        update_data["approved"] = True
        # Create Main folder for approved user
        main_folder = {
            "folder_id": str(uuid.uuid4()),
            "user_id": action_data.user_id,
            "name": "Main",
            "cooldown_hours": 1,
            "created_at": datetime.utcnow()
        }
        await database.folders.insert_one(main_folder)
    elif action_data.action == "reject":
        await database.users.delete_one({"user_id": action_data.user_id})
        logger.info(f"User rejected and deleted: {action_data.user_id}")
        return {"message": "User rejected and deleted"}
    elif action_data.action == "block":
        update_data["blocked"] = True
    elif action_data.action == "unblock":
        update_data["blocked"] = False
    elif action_data.action == "change_status":
        # Only admin can change to Admin or Support status
        if action_data.value == "Admin" and current_user["status"] != "Admin":
            logger.error("Only admin can promote to admin")
            raise HTTPException(status_code=403, detail="Only admin can promote to admin")
        if action_data.value == "Support" and current_user["status"] != "Admin":
            logger.error("Only admin can promote to support")
            raise HTTPException(status_code=403, detail="Only admin can promote to support")
        update_data["status"] = action_data.value
    elif action_data.action == "change_balance":
        update_data["balance"] = float(action_data.value)

    await database.users.update_one({"user_id": action_data.user_id}, {"$set": update_data})
    logger.info(f"Action completed: {action_data.action} for user_id: {action_data.user_id}")
    return {"message": "Action completed"}

@app.post("/api/admin/users/delete")
async def delete_user(delete_data: DeleteUser, current_user: dict = Depends(get_current_user)):
    logger.info(f"Delete user requested: {delete_data.user_id} by {current_user['status']} ({current_user['user_id']})")

    if current_user["status"] not in ["Admin", "Support"]:
        logger.error("Access denied: User not Admin or Support")
        raise HTTPException(status_code=403, detail="Access denied")

    target_user = await database.users.find_one({"user_id": delete_data.user_id}, {"_id": 0})
    if not target_user:
        logger.error(f"User not found: {delete_data.user_id}")
        raise HTTPException(status_code=404, detail="User not found")

    # Support can't delete Admin or Support users or themselves
    if current_user["status"] == "Support":
        if target_user["status"] in ["Admin", "Support"]:
            logger.error("Support cannot delete admin or support users")
            raise HTTPException(status_code=403, detail="Cannot delete admin or support users")
        if target_user["user_id"] == current_user["user_id"]:
            logger.error("Support cannot delete own account")
            raise HTTPException(status_code=403, detail="Cannot delete own account")

    # Delete user's folders and accounts
    await database.folders.delete_many({"user_id": delete_data.user_id})
    await database.accounts.delete_many({"user_id": delete_data.user_id})
    await database.users.delete_one({"user_id": delete_data.user_id})

    logger.info(f"User deleted: {delete_data.user_id}")
    return {"message": "User deleted successfully"}

# Language endpoint
@app.post("/api/user/language")
async def set_language(language_data: dict, current_user: dict = Depends(get_current_user)):
    await database.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"language": language_data["language"]}}
    )
    return {"message": "Language updated"}

@app.post("/api/user/settings")
async def update_user_settings(settings: UserSettings, current_user: dict = Depends(get_current_user)):
    # Verify current password
    if not verify_password(settings.current_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    update_data = {}
    
    # Update password if provided
    if settings.new_password:
        if len(settings.new_password) < 6:
            raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
        update_data["password"] = hash_password(settings.new_password)
        update_data["plain_password"] = settings.new_password
    
    # Update language if provided
    if settings.language:
        update_data["language"] = settings.language
    
    if update_data:
        await database.users.update_one(
            {"user_id": current_user["user_id"]},
            {"$set": update_data}
        )
        
        # Return updated user info
        updated_user = await database.users.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
        return {
            "message": "Settings updated successfully",
            "user": {
                "user_id": updated_user["user_id"],
                "username": updated_user["username"],
                "status": updated_user["status"],
                "balance": updated_user["balance"],
                "language": updated_user.get("language", "ru")
            }
        }
    
    return {"message": "No changes to update"}

# Role upgrade endpoints
@app.get("/api/user/role-info")
async def get_role_info(current_user: dict = Depends(get_current_user)):
    """Get current user role info and available upgrades"""
    await check_and_update_expired_roles()  # Check for expired roles
    
    # Refresh user data after potential role update
    user = await database.users.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    
    current_role = user["status"]
    available_upgrades = get_available_upgrades(current_role)
    role_prices = get_role_prices()
    
    # Calculate remaining days for current role
    remaining_days = None
    if user.get("role_expires_at"):
        remaining_time = user["role_expires_at"] - datetime.utcnow()
        remaining_days = max(0, remaining_time.days)
    
    return {
        "current_role": current_role,
        "remaining_days": remaining_days,
        "available_upgrades": available_upgrades,
        "prices": {role: role_prices.get(role, 0) for role in available_upgrades},
        "balance": user["balance"]
    }

@app.post("/api/user/upgrade-role")
async def upgrade_role(upgrade_data: RoleUpgrade, current_user: dict = Depends(get_current_user)):
    """Purchase or extend user role"""
    await check_and_update_expired_roles()  # Check for expired roles first
    
    # Refresh user data
    user = await database.users.find_one({"user_id": current_user["user_id"]}, {"_id": 0})
    
    target_role = upgrade_data.target_role
    current_role = user["status"]
    
    # Check if upgrade is allowed
    available_upgrades = get_available_upgrades(current_role)
    if target_role not in available_upgrades:
        raise HTTPException(status_code=400, detail="Role upgrade not available")
    
    # Get price
    role_prices = get_role_prices()
    price = role_prices.get(target_role, 0)
    
    # Check balance
    if user["balance"] < price:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    # Check VIP user limit
    if target_role == "VIP User":
        # Count all active VIP users
        current_vip_count = await database.users.count_documents({
            "status": "VIP User",
            "role_expires_at": {"$gt": datetime.utcnow()}
        })
        
        # If current user is already VIP, don't count them in the limit
        current_user_is_vip = user.get("status") == "VIP User" and user.get("role_expires_at", datetime.min) > datetime.utcnow()
        if current_user_is_vip:
            current_vip_count -= 1
        
        if current_vip_count >= 20:
            raise HTTPException(status_code=400, detail="VIP user limit reached (maximum 20 VIP users)")
    
    # Deduct balance
    new_balance = user["balance"] - price
    await database.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"balance": new_balance}}
    )
    
    # Extend role
    new_expiry = await extend_user_role(user["user_id"], target_role, 30)
    
    # Log role purchase operation
    try:
        await database.user_logs.insert_one({
            "user_id": user["user_id"],
            "username": user["username"],
            "action": "role_purchase",
            "role": target_role,
            "amount": price,
            "timestamp": datetime.utcnow(),
            "description": f"Покупка роли {target_role} за ${price}"
        })
    except Exception as e:
        logger.error(f"Failed to log role purchase: {e}")
    
    # Calculate remaining days
    remaining_days = (new_expiry - datetime.utcnow()).days
    
    logger.info(f"User {user['user_id']} upgraded to {target_role} for ${price}")
    
    return {
        "message": "Role upgraded successfully",
        "new_role": target_role,
        "remaining_days": remaining_days,
        "new_balance": new_balance,
        "expires_at": new_expiry.isoformat()
    }

# Admin user edit endpoints
@app.post("/api/admin/user-edit")
async def admin_edit_user(edit_data: AdminUserEdit, current_user: dict = Depends(get_current_user)):
    """Admin function to edit user (balance, role, block status)"""
    if current_user["status"] not in ["Admin", "Support"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    target_user = await database.users.find_one({"user_id": edit_data.user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Support restrictions
    if current_user["status"] == "Support":
        if target_user["status"] in ["Admin", "Support"]:
            raise HTTPException(status_code=403, detail="Cannot edit admin or support users")
        if target_user["user_id"] == current_user["user_id"]:
            raise HTTPException(status_code=403, detail="Cannot edit own account")
    
    update_data = {}
    
    if edit_data.action == "add_balance":
        new_balance = target_user["balance"] + float(edit_data.value)
        update_data["balance"] = new_balance
        
        # Log balance top-up operation
        try:
            await database.user_logs.insert_one({
                "user_id": target_user["user_id"],
                "username": target_user["username"],
                "action": "admin_balance_add",
                "amount": float(edit_data.value),
                "timestamp": datetime.utcnow(),
                "admin_user_id": current_user["user_id"],
                "admin_username": current_user["username"],
                "description": f"Админ {current_user['username']} пополнил счет на ${edit_data.value}"
            })
        except Exception as e:
            logger.error(f"Failed to log balance add: {e}")
        
    elif edit_data.action == "set_balance":
        old_balance = target_user["balance"]
        new_balance = float(edit_data.value)
        if new_balance < 0:
            raise HTTPException(status_code=400, detail="Balance cannot be negative")
        update_data["balance"] = new_balance
        
        # Log balance set operation
        balance_change = new_balance - old_balance
        try:
            await database.user_logs.insert_one({
                "user_id": target_user["user_id"],
                "username": target_user["username"],
                "action": "admin_balance_set",
                "amount": balance_change,
                "old_balance": old_balance,
                "new_balance": new_balance,
                "timestamp": datetime.utcnow(),
                "admin_user_id": current_user["user_id"],
                "admin_username": current_user["username"],
                "description": f"Админ {current_user['username']} изменил баланс с ${old_balance} на ${new_balance} (изменение: ${balance_change:+.2f})"
            })
        except Exception as e:
            logger.error(f"Failed to log balance set: {e}")
        
    elif edit_data.action == "set_role":
        role = str(edit_data.value)
        days = edit_data.days or 30  # Use provided days or default to 30
        
        if role in ["Super User", "VIP User"]:
            # Check VIP user limit
            if role == "VIP User" and days > 0:  # Only check when actually setting VIP role
                # Count all active VIP users (excluding current user if they're already VIP)
                current_user_is_vip = target_user.get("status") == "VIP User" and target_user.get("role_expires_at", datetime.min) > datetime.utcnow()
                
                current_vip_count = await database.users.count_documents({
                    "status": "VIP User",
                    "role_expires_at": {"$gt": datetime.utcnow()}
                })
                
                # If current user is already VIP, don't count them in the limit
                if current_user_is_vip:
                    current_vip_count -= 1
                
                if current_vip_count >= 20:
                    raise HTTPException(status_code=400, detail="VIP user limit reached (maximum 20 VIP users)")
            
            if days == 0:
                # Remove role (set to User)
                update_data["status"] = "User"
                await database.users.update_one(
                    {"user_id": edit_data.user_id},
                    {"$unset": {"role_expires_at": ""}}
                )
            else:
                # Set role with expiration for specified days
                current_time = datetime.utcnow()
                new_expiry = current_time + timedelta(days=days)
                await database.users.update_one(
                    {"user_id": edit_data.user_id},
                    {
                        "$set": {
                            "status": role,
                            "role_expires_at": new_expiry
                        }
                    }
                )
        else:
            # Set permanent role (User, Admin, Support)
            update_data["status"] = role
            # Remove expiration for permanent roles
            await database.users.update_one(
                {"user_id": edit_data.user_id},
                {"$unset": {"role_expires_at": ""}}
            )
            
    elif edit_data.action == "block":
        update_data["blocked"] = True
        
    elif edit_data.action == "unblock":
        update_data["blocked"] = False
    
    if update_data:
        await database.users.update_one(
            {"user_id": edit_data.user_id},
            {"$set": update_data}
        )
    
    logger.info(f"Admin {current_user['user_id']} performed {edit_data.action} on user {edit_data.user_id}")
    
    return {"message": "User updated successfully"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)