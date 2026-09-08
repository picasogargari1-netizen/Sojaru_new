#!/usr/bin/env python3
"""
Backend API Health Test Suite
Tests the 6 critical endpoints after deployment fix
"""
import requests
import json
import sys

# Test configuration
BASE_URL = "http://localhost:8001"
ADMIN_EMAIL = "hello@sojaru.co.in"
ADMIN_PASSWORD = "admin123"
WRONG_PASSWORD = "wrongpassword123"

def print_test(test_num, description):
    print(f"\n{'='*70}")
    print(f"TEST {test_num}: {description}")
    print('='*70)

def print_result(passed, message):
    status = "✅ PASSED" if passed else "❌ FAILED"
    print(f"{status}: {message}")
    return passed

def test_1_categories():
    """Test 1: GET /api/categories - expect 200 with array of categories"""
    print_test(1, "GET /api/categories (WooCommerce data)")
    
    try:
        response = requests.get(f"{BASE_URL}/api/categories", timeout=30)
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        if not isinstance(data, list):
            return print_result(False, f"Expected array, got {type(data)}")
        
        if len(data) == 0:
            return print_result(False, "Categories array is empty")
        
        # Check first category has expected structure
        if data:
            cat = data[0]
            if not all(k in cat for k in ['id', 'name', 'slug']):
                return print_result(False, f"Category missing required fields: {cat}")
        
        return print_result(True, f"Returned {len(data)} categories from WooCommerce")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_2_products():
    """Test 2: GET /api/products?per_page=3 - expect 200 with items array and total > 0"""
    print_test(2, "GET /api/products?per_page=3")
    
    try:
        response = requests.get(f"{BASE_URL}/api/products?per_page=3", timeout=30)
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        if 'items' not in data:
            return print_result(False, f"Response missing 'items' key: {list(data.keys())}")
        
        if not isinstance(data['items'], list):
            return print_result(False, f"'items' should be array, got {type(data['items'])}")
        
        if len(data['items']) == 0:
            return print_result(False, "Products items array is empty")
        
        if 'total' not in data:
            return print_result(False, "Response missing 'total' key")
        
        if data['total'] <= 0:
            return print_result(False, f"Expected total > 0, got {data['total']}")
        
        return print_result(True, f"Returned {len(data['items'])} products, total={data['total']}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_3_settings():
    """Test 3: GET /api/settings - expect 200 with hero, marquee_texts keys"""
    print_test(3, "GET /api/settings (MongoDB data)")
    
    try:
        response = requests.get(f"{BASE_URL}/api/settings", timeout=30)
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        if 'hero' not in data:
            return print_result(False, f"Response missing 'hero' key: {list(data.keys())}")
        
        if 'marquee_texts' not in data:
            return print_result(False, f"Response missing 'marquee_texts' key: {list(data.keys())}")
        
        # Verify hero structure
        hero = data['hero']
        required_hero_keys = ['subtitle', 'primary_label', 'primary_link', 'secondary_label', 'secondary_link']
        missing_keys = [k for k in required_hero_keys if k not in hero]
        if missing_keys:
            return print_result(False, f"Hero missing keys: {missing_keys}")
        
        # Verify marquee_texts is array
        if not isinstance(data['marquee_texts'], list):
            return print_result(False, f"marquee_texts should be array, got {type(data['marquee_texts'])}")
        
        return print_result(True, f"Settings returned with hero and marquee_texts (marquee has {len(data['marquee_texts'])} items)")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_4_admin_login():
    """Test 4: POST /api/auth/login with admin credentials - expect 200, token, is_admin=true"""
    print_test(4, "POST /api/auth/login (admin credentials)")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=30
        )
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}. Response: {response.text}")
        
        data = response.json()
        
        if 'token' not in data:
            return print_result(False, f"Response missing 'token' key: {list(data.keys())}")
        
        if not data['token']:
            return print_result(False, "Token is empty")
        
        if 'user' not in data:
            return print_result(False, f"Response missing 'user' key: {list(data.keys())}")
        
        user = data['user']
        
        if 'is_admin' not in user:
            return print_result(False, f"User missing 'is_admin' key: {list(user.keys())}")
        
        if user['is_admin'] != True:
            return print_result(False, f"Expected is_admin=true, got {user['is_admin']}")
        
        # Store token for next test
        global admin_token
        admin_token = data['token']
        
        return print_result(True, f"Admin login successful, token received, is_admin=true")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_5_auth_me():
    """Test 5: GET /api/auth/me with admin token - expect 200 with user object (tests projection fix)"""
    print_test(5, "GET /api/auth/me (with admin token - tests MongoDB projection fix)")
    
    if 'admin_token' not in globals():
        return print_result(False, "No admin token available (test 4 must pass first)")
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {admin_token}"},
            timeout=30
        )
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}. Response: {response.text}")
        
        data = response.json()
        
        # Verify user object structure
        required_keys = ['id', 'email', 'is_admin']
        missing_keys = [k for k in required_keys if k not in data]
        if missing_keys:
            return print_result(False, f"User object missing keys: {missing_keys}. Got: {list(data.keys())}")
        
        if data['is_admin'] != True:
            return print_result(False, f"Expected is_admin=true, got {data['is_admin']}")
        
        if data['email'] != ADMIN_EMAIL:
            return print_result(False, f"Expected email={ADMIN_EMAIL}, got {data['email']}")
        
        # This is the critical test - if projection was missing, this would crash with ObjectId serialization error
        return print_result(True, f"Auth /me working correctly with projection fix. User: {data['email']}, is_admin={data['is_admin']}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_6_wrong_password():
    """Test 6: POST /api/auth/login with wrong password - expect 401"""
    print_test(6, "POST /api/auth/login (wrong password - expect 401)")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": WRONG_PASSWORD},
            timeout=30
        )
        
        if response.status_code != 401:
            return print_result(False, f"Expected status 401, got {response.status_code}")
        
        return print_result(True, f"Wrong password correctly rejected with 401")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def main():
    print("\n" + "="*70)
    print("BACKEND API HEALTH TEST SUITE")
    print("Testing deployment fix: .env files + MongoDB projections")
    print("="*70)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin credentials: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    
    results = []
    
    # Run all tests
    results.append(("Test 1: GET /api/categories", test_1_categories()))
    results.append(("Test 2: GET /api/products", test_2_products()))
    results.append(("Test 3: GET /api/settings", test_3_settings()))
    results.append(("Test 4: Admin login", test_4_admin_login()))
    results.append(("Test 5: GET /api/auth/me", test_5_auth_me()))
    results.append(("Test 6: Wrong password", test_6_wrong_password()))
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print("\n" + "="*70)
    print(f"FINAL RESULT: {passed}/{total} tests passed")
    print("="*70)
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! Backend API is healthy.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. See details above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
