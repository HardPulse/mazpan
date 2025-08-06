#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Gyat Panel
Tests all backend functionality including authentication, account management, folders, and admin panel.
"""

import requests
import json
import time
import uuid
from datetime import datetime

# Configuration
BASE_URL = "https://c087fe0a-35d8-431e-8068-74146687e26c.preview.emergentagent.com/api"
ADMIN_USERNAME = "Логин"
ADMIN_PASSWORD = "пароль"

# Test data
TEST_USER_USERNAME = f"testuser_{uuid.uuid4().hex[:8]}"
TEST_USER_PASSWORD = "testpass123"

# Account test data - Format 1 and Format 2
ACCOUNTS_FORMAT_1 = """test1@example.com|emailpass1|login1|accpass1|US
test2@example.com|emailpass2|login2|accpass2|UK
test3@example.com|emailpass3|login3|accpass3|DE"""

ACCOUNTS_FORMAT_2 = """test4@example.com|emailpass4|login4|accpass4|client123|key123
test5@example.com|emailpass5|login5|accpass5|client456|key456
test6@example.com|emailpass6|login6|accpass6|client789|key789"""

class GyatPanelTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.main_folder_id = None
        self.test_folder_id = None
        self.test_account_ids = []
        
    def log(self, message, level="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {level}: {message}")
        
    def make_request(self, method, endpoint, data=None, token=None, files=None):
        """Make HTTP request with proper error handling"""
        url = f"{BASE_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        if files:
            headers.pop("Content-Type", None)  # Let requests set it for multipart
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers)
            elif method.upper() == "POST":
                if files:
                    response = self.session.post(url, headers=headers, files=files)
                else:
                    response = self.session.post(url, headers=headers, json=data)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            
            if response.status_code >= 400:
                self.log(f"Error response: {response.text}", "ERROR")
                
            return response
            
        except Exception as e:
            self.log(f"Request failed: {str(e)}", "ERROR")
            return None
    
    def test_health_check(self):
        """Test basic health endpoint"""
        self.log("=== Testing Health Check ===")
        response = self.make_request("GET", "/health")
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                self.log("✅ Health check passed")
                return True
            else:
                self.log("❌ Health check failed - invalid response")
                return False
        else:
            self.log("❌ Health check failed - no response")
            return False
    
    def test_user_registration(self):
        """Test user registration"""
        self.log("=== Testing User Registration ===")
        
        registration_data = {
            "username": TEST_USER_USERNAME,
            "password": TEST_USER_PASSWORD
        }
        
        response = self.make_request("POST", "/register", registration_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if "Registration successful" in data.get("message", ""):
                self.log("✅ User registration successful")
                return True
            else:
                self.log("❌ User registration failed - invalid response")
                return False
        else:
            self.log("❌ User registration failed")
            return False
    
    def test_admin_login(self):
        """Test admin login"""
        self.log("=== Testing Admin Login ===")
        
        login_data = {
            "username": ADMIN_USERNAME,
            "password": ADMIN_PASSWORD
        }
        
        response = self.make_request("POST", "/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("access_token") and data.get("user", {}).get("status") == "Admin":
                self.admin_token = data["access_token"]
                self.log("✅ Admin login successful")
                return True
            else:
                self.log("❌ Admin login failed - invalid response")
                return False
        else:
            self.log("❌ Admin login failed")
            return False
    
    def test_get_pending_users(self):
        """Test getting pending users"""
        self.log("=== Testing Get Pending Users ===")
        
        response = self.make_request("GET", "/admin/pending-users", token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            users = data.get("users", [])
            
            # Find our test user
            test_user = next((u for u in users if u["username"] == TEST_USER_USERNAME), None)
            if test_user:
                self.test_user_id = test_user["user_id"]
                self.log(f"✅ Found pending test user: {self.test_user_id}")
                return True
            else:
                self.log("❌ Test user not found in pending users")
                return False
        else:
            self.log("❌ Failed to get pending users")
            return False
    
    def test_approve_user(self):
        """Test user approval by admin"""
        self.log("=== Testing User Approval ===")
        
        if not self.test_user_id:
            self.log("❌ No test user ID available")
            return False
            
        approval_data = {
            "user_id": self.test_user_id,
            "action": "approve"
        }
        
        response = self.make_request("POST", "/admin/user-action", approval_data, token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if "completed" in data.get("message", ""):
                self.log("✅ User approval successful")
                return True
            else:
                self.log("❌ User approval failed - invalid response")
                return False
        else:
            self.log("❌ User approval failed")
            return False
    
    def test_user_login(self):
        """Test user login after approval"""
        self.log("=== Testing User Login ===")
        
        login_data = {
            "username": TEST_USER_USERNAME,
            "password": TEST_USER_PASSWORD
        }
        
        response = self.make_request("POST", "/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("access_token") and data.get("user", {}).get("username") == TEST_USER_USERNAME:
                self.user_token = data["access_token"]
                self.log("✅ User login successful")
                return True
            else:
                self.log("❌ User login failed - invalid response")
                return False
        else:
            self.log("❌ User login failed")
            return False
    
    def test_get_folders(self):
        """Test getting user folders"""
        self.log("=== Testing Get Folders ===")
        
        response = self.make_request("GET", "/folders", token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            folders = data.get("folders", [])
            
            # Find Main folder
            main_folder = next((f for f in folders if f["name"] == "Main"), None)
            if main_folder:
                self.main_folder_id = main_folder["folder_id"]
                self.log(f"✅ Found Main folder: {self.main_folder_id}")
                return True
            else:
                self.log("❌ Main folder not found")
                return False
        else:
            self.log("❌ Failed to get folders")
            return False
    
    def test_create_folder(self):
        """Test creating a new folder"""
        self.log("=== Testing Create Folder ===")
        
        folder_data = {
            "name": f"TestFolder_{uuid.uuid4().hex[:8]}"
        }
        
        response = self.make_request("POST", "/folders", folder_data, token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            folder = data.get("folder", {})
            if folder.get("folder_id") and folder.get("name") == folder_data["name"]:
                self.test_folder_id = folder["folder_id"]
                self.log(f"✅ Folder created successfully: {self.test_folder_id}")
                return True
            else:
                self.log("❌ Folder creation failed - invalid response")
                return False
        else:
            self.log("❌ Folder creation failed")
            return False
    
    def test_upload_accounts_format1(self):
        """Test uploading accounts in format 1"""
        self.log("=== Testing Upload Accounts Format 1 ===")
        
        account_data = {
            "accounts_text": ACCOUNTS_FORMAT_1,
            "folder_id": self.main_folder_id
        }
        
        response = self.make_request("POST", "/accounts", account_data, token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            count = data.get("count", 0)
            if count == 3:  # We uploaded 3 accounts
                self.log(f"✅ Format 1 accounts uploaded successfully: {count}")
                return True
            else:
                self.log(f"❌ Format 1 upload failed - expected 3, got {count}")
                return False
        else:
            self.log("❌ Format 1 accounts upload failed")
            return False
    
    def test_upload_accounts_format2(self):
        """Test uploading accounts in format 2"""
        self.log("=== Testing Upload Accounts Format 2 ===")
        
        account_data = {
            "accounts_text": ACCOUNTS_FORMAT_2,
            "folder_id": self.test_folder_id
        }
        
        response = self.make_request("POST", "/accounts", account_data, token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            count = data.get("count", 0)
            if count == 3:  # We uploaded 3 accounts
                self.log(f"✅ Format 2 accounts uploaded successfully: {count}")
                return True
            else:
                self.log(f"❌ Format 2 upload failed - expected 3, got {count}")
                return False
        else:
            self.log("❌ Format 2 accounts upload failed")
            return False
    
    def test_get_accounts(self):
        """Test getting accounts"""
        self.log("=== Testing Get Accounts ===")
        
        response = self.make_request("GET", "/accounts", token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            accounts = data.get("accounts", [])
            
            if len(accounts) >= 6:  # We uploaded 6 accounts total
                # Store some account IDs for later tests
                self.test_account_ids = [acc["account_id"] for acc in accounts[:3]]
                self.log(f"✅ Retrieved {len(accounts)} accounts")
                
                # Check if accounts have proper format data
                format1_count = sum(1 for acc in accounts if acc.get("format_type") == 1)
                format2_count = sum(1 for acc in accounts if acc.get("format_type") == 2)
                self.log(f"Format 1 accounts: {format1_count}, Format 2 accounts: {format2_count}")
                
                return True
            else:
                self.log(f"❌ Expected at least 6 accounts, got {len(accounts)}")
                return False
        else:
            self.log("❌ Failed to get accounts")
            return False
    
    def test_download_accounts(self):
        """Test downloading accounts"""
        self.log("=== Testing Download Accounts ===")
        
        if not self.test_account_ids:
            self.log("❌ No test account IDs available")
            return False
            
        download_data = {
            "account_ids": self.test_account_ids
        }
        
        response = self.make_request("POST", "/accounts/download", download_data, token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            content = data.get("content", "")
            filename = data.get("filename", "")
            
            if content and filename and len(content.split('\n')) >= 3:
                self.log("✅ Account download successful")
                return True
            else:
                self.log("❌ Account download failed - invalid content")
                return False
        else:
            self.log("❌ Account download failed")
            return False
    
    def test_move_accounts(self):
        """Test moving accounts between folders"""
        self.log("=== Testing Move Accounts ===")
        
        if not self.test_account_ids or not self.test_folder_id:
            self.log("❌ Missing test data for move operation")
            return False
            
        move_data = {
            "account_ids": self.test_account_ids[:2],  # Move 2 accounts
            "folder_id": self.test_folder_id
        }
        
        response = self.make_request("POST", "/accounts/move", move_data, token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if "Moved" in data.get("message", ""):
                self.log("✅ Account move successful")
                return True
            else:
                self.log("❌ Account move failed - invalid response")
                return False
        else:
            self.log("❌ Account move failed")
            return False
    
    def test_set_folder_cooldown(self):
        """Test setting folder cooldown time"""
        self.log("=== Testing Set Folder Cooldown ===")
        
        if not self.test_folder_id:
            self.log("❌ No test folder ID available")
            return False
            
        cooldown_data = {
            "hours": 2
        }
        
        response = self.make_request("POST", f"/folders/{self.test_folder_id}/cooldown", cooldown_data, token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if "Cooldown time set" in data.get("message", ""):
                self.log("✅ Folder cooldown set successfully")
                return True
            else:
                self.log("❌ Folder cooldown failed - invalid response")
                return False
        else:
            self.log("❌ Folder cooldown failed")
            return False
    
    def test_select_accounts(self):
        """Test account selection by criteria"""
        self.log("=== Testing Select Accounts ===")
        
        # Test select all accounts
        select_data = {
            "criteria": "all",
            "folder_id": self.main_folder_id
        }
        
        response = self.make_request("POST", "/accounts/select", select_data, token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            account_ids = data.get("account_ids", [])
            if len(account_ids) > 0:
                self.log(f"✅ Account selection successful: {len(account_ids)} accounts")
                return True
            else:
                self.log("❌ Account selection failed - no accounts returned")
                return False
        else:
            self.log("❌ Account selection failed")
            return False
    
    def test_delete_accounts(self):
        """Test deleting accounts"""
        self.log("=== Testing Delete Accounts ===")
        
        if not self.test_account_ids:
            self.log("❌ No test account IDs available")
            return False
            
        delete_data = {
            "account_ids": self.test_account_ids[-1:]  # Delete 1 account
        }
        
        response = self.make_request("POST", "/accounts/delete", delete_data, token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if "Deleted" in data.get("message", ""):
                self.log("✅ Account deletion successful")
                return True
            else:
                self.log("❌ Account deletion failed - invalid response")
                return False
        else:
            self.log("❌ Account deletion failed")
            return False
    
    def test_admin_get_all_users(self):
        """Test admin getting all users"""
        self.log("=== Testing Admin Get All Users ===")
        
        response = self.make_request("GET", "/admin/users", token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            users = data.get("users", [])
            
            # Should find our test user
            test_user = next((u for u in users if u["username"] == TEST_USER_USERNAME), None)
            if test_user and test_user.get("approved") == True:
                self.log(f"✅ Found approved test user in all users list")
                return True
            else:
                self.log("❌ Test user not found or not approved in all users list")
                return False
        else:
            self.log("❌ Failed to get all users")
            return False
    
    def test_admin_change_user_balance(self):
        """Test admin changing user balance"""
        self.log("=== Testing Admin Change User Balance ===")
        
        if not self.test_user_id:
            self.log("❌ No test user ID available")
            return False
            
        balance_data = {
            "user_id": self.test_user_id,
            "action": "change_balance",
            "value": 100.50
        }
        
        response = self.make_request("POST", "/admin/user-action", balance_data, token=self.admin_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if "completed" in data.get("message", ""):
                self.log("✅ User balance change successful")
                return True
            else:
                self.log("❌ User balance change failed - invalid response")
                return False
        else:
            self.log("❌ User balance change failed")
            return False
    
    def test_delete_folder(self):
        """Test deleting a folder"""
        self.log("=== Testing Delete Folder ===")
        
        if not self.test_folder_id:
            self.log("❌ No test folder ID available")
            return False
            
        response = self.make_request("DELETE", f"/folders/{self.test_folder_id}", token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if "deleted" in data.get("message", ""):
                self.log("✅ Folder deletion successful")
                return True
            else:
                self.log("❌ Folder deletion failed - invalid response")
                return False
        else:
            self.log("❌ Folder deletion failed")
            return False
    
    def test_user_info(self):
        """Test getting current user info"""
        self.log("=== Testing Get User Info ===")
        
        response = self.make_request("GET", "/me", token=self.user_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get("username") == TEST_USER_USERNAME and data.get("balance") == 100.50:
                self.log("✅ User info retrieval successful")
                return True
            else:
                self.log("❌ User info retrieval failed - invalid data")
                return False
        else:
            self.log("❌ User info retrieval failed")
            return False
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("🚀 Starting Gyat Panel Backend Tests")
        self.log(f"Base URL: {BASE_URL}")
        
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("Admin Login", self.test_admin_login),
            ("Get Pending Users", self.test_get_pending_users),
            ("Approve User", self.test_approve_user),
            ("User Login", self.test_user_login),
            ("Get Folders", self.test_get_folders),
            ("Create Folder", self.test_create_folder),
            ("Upload Accounts Format 1", self.test_upload_accounts_format1),
            ("Upload Accounts Format 2", self.test_upload_accounts_format2),
            ("Get Accounts", self.test_get_accounts),
            ("Download Accounts", self.test_download_accounts),
            ("Move Accounts", self.test_move_accounts),
            ("Set Folder Cooldown", self.test_set_folder_cooldown),
            ("Select Accounts", self.test_select_accounts),
            ("Delete Accounts", self.test_delete_accounts),
            ("Admin Get All Users", self.test_admin_get_all_users),
            ("Admin Change User Balance", self.test_admin_change_user_balance),
            ("Get User Info", self.test_user_info),
            ("Delete Folder", self.test_delete_folder),
        ]
        
        results = {}
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            try:
                result = test_func()
                results[test_name] = result
                if result:
                    passed += 1
                time.sleep(0.5)  # Small delay between tests
            except Exception as e:
                self.log(f"❌ {test_name} failed with exception: {str(e)}", "ERROR")
                results[test_name] = False
        
        # Summary
        self.log("\n" + "="*60)
        self.log("🏁 TEST SUMMARY")
        self.log("="*60)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{status} - {test_name}")
        
        self.log(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED!")
            return True
        else:
            self.log(f"⚠️  {total-passed} tests failed")
            return False

if __name__ == "__main__":
    tester = GyatPanelTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)