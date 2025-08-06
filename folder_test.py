#!/usr/bin/env python3
"""
Quick test for folder creation
"""

import requests
import json
import uuid

BASE_URL = "https://c087fe0a-35d8-431e-8068-74146687e26c.preview.emergentagent.com/api"
ADMIN_USERNAME = "Логин"
ADMIN_PASSWORD = "пароль"

# Test user
TEST_USER_USERNAME = f"testuser_{uuid.uuid4().hex[:8]}"
TEST_USER_PASSWORD = "testpass123"

def test_folder_creation():
    session = requests.Session()
    
    # Register user
    print("Registering user...")
    reg_response = session.post(f"{BASE_URL}/register", json={
        "username": TEST_USER_USERNAME,
        "password": TEST_USER_PASSWORD
    })
    print(f"Registration: {reg_response.status_code}")
    
    # Admin login
    print("Admin login...")
    admin_login = session.post(f"{BASE_URL}/login", json={
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD
    })
    admin_token = admin_login.json()["access_token"]
    print(f"Admin login: {admin_login.status_code}")
    
    # Get pending users
    print("Getting pending users...")
    pending_response = session.get(f"{BASE_URL}/admin/pending-users", 
                                 headers={"Authorization": f"Bearer {admin_token}"})
    users = pending_response.json()["users"]
    test_user = next((u for u in users if u["username"] == TEST_USER_USERNAME), None)
    test_user_id = test_user["user_id"]
    print(f"Found test user: {test_user_id}")
    
    # Approve user
    print("Approving user...")
    approve_response = session.post(f"{BASE_URL}/admin/user-action", 
                                  json={"user_id": test_user_id, "action": "approve"},
                                  headers={"Authorization": f"Bearer {admin_token}"})
    print(f"Approval: {approve_response.status_code}")
    
    # User login
    print("User login...")
    user_login = session.post(f"{BASE_URL}/login", json={
        "username": TEST_USER_USERNAME,
        "password": TEST_USER_PASSWORD
    })
    user_token = user_login.json()["access_token"]
    print(f"User login: {user_login.status_code}")
    
    # Create folder
    print("Creating folder...")
    folder_response = session.post(f"{BASE_URL}/folders", 
                                 json={"name": f"TestFolder_{uuid.uuid4().hex[:8]}"},
                                 headers={"Authorization": f"Bearer {user_token}"})
    print(f"Folder creation: {folder_response.status_code}")
    if folder_response.status_code == 200:
        print("✅ Folder creation successful!")
        print(f"Response: {folder_response.json()}")
    else:
        print("❌ Folder creation failed!")
        print(f"Error: {folder_response.text}")

if __name__ == "__main__":
    test_folder_creation()