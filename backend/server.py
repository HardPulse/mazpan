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
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def parse_account_format(line: str) -> Dict[str, Any]:
    """Parse account line and determine format"""
    parts = line.strip().split('|')
    
    if len(parts) == 5:
        # Format 1: email|email_pass|login|account_pass|geo
        return {
            "email": parts[0],
            "email_password": parts[1],
            "login": parts[2],
            "account_password": parts[3],
            "geo": parts[4],
            "client_id": None,
            "key": None,
            "format_type": 1
        }
    elif len(parts) == 6:
        # Format 2: email|email_pass|login|account_pass|client_id|key
        return {
            "email": parts[0],
            "email_password": parts[1],
            "login": parts[2],
            "account_password": parts[3],
            "geo": None,
            "client_id": parts[4],
            "key": parts[5],
            "format_type": 2
        }
    else:
        raise ValueError(f"Invalid account format: {line}")

@app.on_event("startup")
async def startup_event():
    # Create default admin user if not exists
    admin_user = await database.users.find_one({"username": "Логин"}, {"_id": 0})
    if not admin_user:
        admin_data = {
            "user_id": str(uuid.uuid4()),
            "username": "Логин",
            "password": hash_password("пароль"),
            "status": "Admin",
            "balance": 0.0,
            "approved": True,
            "blocked": False,
            "created_at": datetime.utcnow(),
            "language": "ru"
        }
        await database.users.insert_one(admin_data)
        
        # Create main folder for admin
        main_folder = {
            "folder_id": str(uuid.uuid4()),
            "user_id": admin_data["user_id"],
            "name": "Main",
            "cooldown_hours": 1,
            "created_at": datetime.utcnow()
        }
        await database.folders.insert_one(main_folder)

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
    user = await database.users.find_one({"username": user_data.username})
    
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
    return {"folder": folder}

@app.delete("/api/folders/{folder_id}")
async def delete_folder(folder_id: str, current_user: dict = Depends(get_current_user)):
    folder = await database.folders.find_one({"folder_id": folder_id, "user_id": current_user["user_id"]})
    
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    if folder["name"] == "Main":
        raise HTTPException(status_code=400, detail="Cannot delete Main folder")
    
    # Move all accounts from this folder to Main
    main_folder = await database.folders.find_one({"user_id": current_user["user_id"], "name": "Main"})
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
        main_folder = await database.folders.find_one({"user_id": current_user["user_id"], "name": "Main"})
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
        except ValueError as e:
            continue  # Skip invalid formats
    
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
        if account["format_type"] == 1:
            line = f"{account['email']}|{account['email_password']}|{account['login']}|{account['account_password']}|{account['geo']}"
        else:
            line = f"{account['email']}|{account['email_password']}|{account['login']}|{account['account_password']}|{account['client_id']}|{account['key']}"
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
        query["status"] = {"$ne": "Admin"}
    
    users = await database.users.find(query, {"_id": 0}).to_list(None)
    return {"users": users}

@app.post("/api/admin/user-action")
async def admin_user_action(action_data: AdminAction, current_user: dict = Depends(get_current_user)):
    if current_user["status"] not in ["Admin", "Support"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    target_user = await database.users.find_one({"user_id": action_data.user_id})
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Support can't modify Admin users
    if current_user["status"] == "Support" and target_user["status"] == "Admin":
        raise HTTPException(status_code=403, detail="Cannot modify admin users")
    
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
        return {"message": "User rejected and deleted"}
    elif action_data.action == "block":
        update_data["blocked"] = True
    elif action_data.action == "unblock":
        update_data["blocked"] = False
    elif action_data.action == "change_status":
        # Only admin can change to Admin status
        if action_data.value == "Admin" and current_user["status"] != "Admin":
            raise HTTPException(status_code=403, detail="Only admin can promote to admin")
        update_data["status"] = action_data.value
    elif action_data.action == "change_balance":
        update_data["balance"] = float(action_data.value)
    
    await database.users.update_one({"user_id": action_data.user_id}, {"$set": update_data})
    return {"message": "Action completed"}

# Language endpoint
@app.post("/api/user/language")
async def set_language(language_data: dict, current_user: dict = Depends(get_current_user)):
    await database.users.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": {"language": language_data["language"]}}
    )
    return {"message": "Language updated"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)