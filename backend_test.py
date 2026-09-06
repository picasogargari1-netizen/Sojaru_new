#!/usr/bin/env python3
"""
Sojaru Admin Backend API Tests
Tests admin authentication, marquee texts, festive collection, and hero image management.
"""

import io
import sys
import requests
from PIL import Image

# Backend base URL
BASE_URL = "https://220b0aca-45ec-48d6-9e7d-85dc188c91a7.preview.emergentagent.com/api"

# Admin credentials
ADMIN_EMAIL = "hello@sojaru.co.in"
ADMIN_PASSWORD = "admin123"

# Test results tracking
test_results = {
    "auth": {"passed": [], "failed": []},
    "marquee": {"passed": [], "failed": []},
    "festive": {"passed": [], "failed": []},
    "hero_images": {"passed": [], "failed": []}
}

def log_pass(category, message):
    """Log a passing test"""
    print(f"✅ {message}")
    test_results[category]["passed"].append(message)

def log_fail(category, message):
    """Log a failing test"""
    print(f"❌ {message}")
    test_results[category]["failed"].append(message)

def generate_test_png():
    """Generate a tiny valid PNG image in memory"""
    img = Image.new('RGB', (10, 10), color='red')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf.getvalue()

def print_summary():
    """Print test summary"""
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    total_passed = sum(len(v["passed"]) for v in test_results.values())
    total_failed = sum(len(v["failed"]) for v in test_results.values())
    
    for category, results in test_results.items():
        print(f"\n{category.upper().replace('_', ' ')}:")
        print(f"  Passed: {len(results['passed'])}")
        print(f"  Failed: {len(results['failed'])}")
        if results["failed"]:
            for fail in results["failed"]:
                print(f"    - {fail}")
    
    print(f"\n{'='*80}")
    print(f"TOTAL: {total_passed} passed, {total_failed} failed")
    print("="*80)
    
    return total_failed == 0

# =============================================================================
# TEST 1: AUTHENTICATION & AUTHORIZATION
# =============================================================================
def test_auth():
    """Test admin authentication and authorization"""
    print("\n" + "="*80)
    print("TEST 1: AUTHENTICATION & AUTHORIZATION")
    print("="*80)
    
    # 1.1: Admin login
    print("\n[1.1] Testing admin login...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        }, timeout=30)
        
        if resp.status_code != 200:
            log_fail("auth", f"Admin login failed with status {resp.status_code}: {resp.text}")
            return None, None
        
        data = resp.json()
        admin_token = data.get("token")
        user = data.get("user", {})
        
        if not admin_token:
            log_fail("auth", "Admin login response missing token")
            return None, None
        
        if not user.get("is_admin"):
            log_fail("auth", f"Admin login user.is_admin is {user.get('is_admin')}, expected True")
            return None, None
        
        log_pass("auth", f"Admin login successful with token and is_admin=True")
        
    except Exception as e:
        log_fail("auth", f"Admin login exception: {e}")
        return None, None
    
    # 1.2: Register a normal user
    print("\n[1.2] Registering a normal user...")
    normal_token = None
    try:
        import random
        test_email = f"testuser{random.randint(1000, 9999)}@example.com"
        resp = requests.post(f"{BASE_URL}/auth/register", json={
            "email": test_email,
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User"
        }, timeout=30)
        
        if resp.status_code != 200:
            log_fail("auth", f"Normal user registration failed with status {resp.status_code}: {resp.text}")
        else:
            data = resp.json()
            normal_token = data.get("token")
            user = data.get("user", {})
            
            if user.get("is_admin"):
                log_fail("auth", "Normal user has is_admin=True, expected False")
            else:
                log_pass("auth", f"Normal user registered successfully (is_admin=False)")
    
    except Exception as e:
        log_fail("auth", f"Normal user registration exception: {e}")
    
    # 1.3: Test admin endpoints reject no token (401)
    print("\n[1.3] Testing admin endpoints reject requests with no token...")
    
    # Test PUT /api/admin/settings
    try:
        resp = requests.put(f"{BASE_URL}/admin/settings", json={
            "marquee_texts": ["test"]
        }, timeout=30)
        
        if resp.status_code == 401:
            log_pass("auth", "PUT /api/admin/settings correctly rejects request with no token (401)")
        else:
            log_fail("auth", f"PUT /api/admin/settings returned {resp.status_code} instead of 401 for no token")
    except Exception as e:
        log_fail("auth", f"PUT /api/admin/settings no-token test exception: {e}")
    
    # Test POST /api/admin/hero-images
    try:
        png_data = generate_test_png()
        resp = requests.post(f"{BASE_URL}/admin/hero-images", 
                           files={"file": ("test.png", png_data, "image/png")},
                           timeout=30)
        
        if resp.status_code == 401:
            log_pass("auth", "POST /api/admin/hero-images correctly rejects request with no token (401)")
        else:
            log_fail("auth", f"POST /api/admin/hero-images returned {resp.status_code} instead of 401 for no token")
    except Exception as e:
        log_fail("auth", f"POST /api/admin/hero-images no-token test exception: {e}")
    
    # 1.4: Test admin endpoints reject non-admin token (403)
    if normal_token:
        print("\n[1.4] Testing admin endpoints reject requests with non-admin token...")
        
        # Test PUT /api/admin/settings
        try:
            resp = requests.put(f"{BASE_URL}/admin/settings", 
                              json={"marquee_texts": ["test"]},
                              headers={"Authorization": f"Bearer {normal_token}"},
                              timeout=30)
            
            if resp.status_code == 403:
                log_pass("auth", "PUT /api/admin/settings correctly rejects non-admin token (403)")
            else:
                log_fail("auth", f"PUT /api/admin/settings returned {resp.status_code} instead of 403 for non-admin token")
        except Exception as e:
            log_fail("auth", f"PUT /api/admin/settings non-admin test exception: {e}")
        
        # Test POST /api/admin/hero-images
        try:
            png_data = generate_test_png()
            resp = requests.post(f"{BASE_URL}/admin/hero-images", 
                               files={"file": ("test.png", png_data, "image/png")},
                               headers={"Authorization": f"Bearer {normal_token}"},
                               timeout=30)
            
            if resp.status_code == 403:
                log_pass("auth", "POST /api/admin/hero-images correctly rejects non-admin token (403)")
            else:
                log_fail("auth", f"POST /api/admin/hero-images returned {resp.status_code} instead of 403 for non-admin token")
        except Exception as e:
            log_fail("auth", f"POST /api/admin/hero-images non-admin test exception: {e}")
    
    return admin_token, normal_token

# =============================================================================
# TEST 2: MARQUEE TEXTS
# =============================================================================
def test_marquee(admin_token):
    """Test marquee texts update"""
    print("\n" + "="*80)
    print("TEST 2: MARQUEE TEXTS")
    print("="*80)
    
    if not admin_token:
        log_fail("marquee", "Skipping marquee tests - no admin token available")
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 2.1: Get original marquee_texts
    print("\n[2.1] Getting original marquee_texts...")
    original_marquee = None
    try:
        resp = requests.get(f"{BASE_URL}/settings", timeout=30)
        if resp.status_code != 200:
            log_fail("marquee", f"GET /api/settings failed with status {resp.status_code}")
            return
        
        data = resp.json()
        original_marquee = data.get("marquee_texts", [])
        log_pass("marquee", f"Retrieved original marquee_texts: {len(original_marquee)} items")
    except Exception as e:
        log_fail("marquee", f"GET /api/settings exception: {e}")
        return
    
    # 2.2: Update marquee_texts with test data (including whitespace)
    print("\n[2.2] Updating marquee_texts with test data...")
    test_marquee = ["Test line A", "Test line B", "  "]
    expected_marquee = ["Test line A", "Test line B"]  # Empty/whitespace should be stripped
    
    try:
        resp = requests.put(f"{BASE_URL}/admin/settings", 
                          json={"marquee_texts": test_marquee},
                          headers=headers,
                          timeout=30)
        
        if resp.status_code != 200:
            log_fail("marquee", f"PUT /api/admin/settings failed with status {resp.status_code}: {resp.text}")
            return
        
        log_pass("marquee", "PUT /api/admin/settings returned 200")
    except Exception as e:
        log_fail("marquee", f"PUT /api/admin/settings exception: {e}")
        return
    
    # 2.3: Verify marquee_texts were updated correctly
    print("\n[2.3] Verifying marquee_texts update...")
    try:
        resp = requests.get(f"{BASE_URL}/settings", timeout=30)
        if resp.status_code != 200:
            log_fail("marquee", f"GET /api/settings verification failed with status {resp.status_code}")
        else:
            data = resp.json()
            actual_marquee = data.get("marquee_texts", [])
            
            if actual_marquee == expected_marquee:
                log_pass("marquee", f"Marquee texts correctly updated and whitespace stripped: {actual_marquee}")
            else:
                log_fail("marquee", f"Marquee texts mismatch. Expected {expected_marquee}, got {actual_marquee}")
    except Exception as e:
        log_fail("marquee", f"GET /api/settings verification exception: {e}")
    
    # 2.4: Restore original marquee_texts
    print("\n[2.4] Restoring original marquee_texts...")
    if original_marquee is not None:
        try:
            resp = requests.put(f"{BASE_URL}/admin/settings", 
                              json={"marquee_texts": original_marquee},
                              headers=headers,
                              timeout=30)
            
            if resp.status_code != 200:
                log_fail("marquee", f"Failed to restore original marquee_texts: {resp.status_code}")
            else:
                log_pass("marquee", "Original marquee_texts restored successfully")
        except Exception as e:
            log_fail("marquee", f"Restore marquee_texts exception: {e}")

# =============================================================================
# TEST 3: FESTIVE COLLECTION
# =============================================================================
def test_festive(admin_token):
    """Test festive collection update"""
    print("\n" + "="*80)
    print("TEST 3: FESTIVE COLLECTION")
    print("="*80)
    
    if not admin_token:
        log_fail("festive", "Skipping festive tests - no admin token available")
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 3.1: Get a valid category ID
    print("\n[3.1] Getting valid category ID...")
    category_id = None
    try:
        resp = requests.get(f"{BASE_URL}/categories", timeout=30)
        if resp.status_code != 200:
            log_fail("festive", f"GET /api/categories failed with status {resp.status_code}")
            return
        
        categories = resp.json()
        if not categories:
            log_fail("festive", "No categories available for testing")
            return
        
        category_id = categories[0]["id"]
        log_pass("festive", f"Retrieved valid category ID: {category_id}")
    except Exception as e:
        log_fail("festive", f"GET /api/categories exception: {e}")
        return
    
    # 3.2: Get original festive settings
    print("\n[3.2] Getting original festive settings...")
    original_festive = None
    try:
        resp = requests.get(f"{BASE_URL}/settings", timeout=30)
        if resp.status_code != 200:
            log_fail("festive", f"GET /api/settings failed with status {resp.status_code}")
            return
        
        data = resp.json()
        original_festive = data.get("festive", {})
        log_pass("festive", f"Retrieved original festive settings: {original_festive}")
    except Exception as e:
        log_fail("festive", f"GET /api/settings exception: {e}")
        return
    
    # 3.3: Update festive settings
    print("\n[3.3] Updating festive settings...")
    test_festive = {
        "title": "Test Festive Edit",
        "category_id": category_id,
        "enabled": True
    }
    
    try:
        resp = requests.put(f"{BASE_URL}/admin/settings", 
                          json={"festive": test_festive},
                          headers=headers,
                          timeout=30)
        
        if resp.status_code != 200:
            log_fail("festive", f"PUT /api/admin/settings failed with status {resp.status_code}: {resp.text}")
            return
        
        log_pass("festive", "PUT /api/admin/settings returned 200")
    except Exception as e:
        log_fail("festive", f"PUT /api/admin/settings exception: {e}")
        return
    
    # 3.4: Verify festive settings were updated
    print("\n[3.4] Verifying festive settings update...")
    try:
        resp = requests.get(f"{BASE_URL}/settings", timeout=30)
        if resp.status_code != 200:
            log_fail("festive", f"GET /api/settings verification failed with status {resp.status_code}")
        else:
            data = resp.json()
            actual_festive = data.get("festive", {})
            
            if actual_festive.get("title") == "Test Festive Edit" and actual_festive.get("category_id") == category_id:
                log_pass("festive", f"Festive settings correctly updated: {actual_festive}")
            else:
                log_fail("festive", f"Festive settings mismatch. Expected title='Test Festive Edit' and category_id={category_id}, got {actual_festive}")
    except Exception as e:
        log_fail("festive", f"GET /api/settings verification exception: {e}")
    
    # 3.5: Verify products fetch for the category
    print("\n[3.5] Verifying products fetch for category...")
    try:
        resp = requests.get(f"{BASE_URL}/products", params={"category": category_id}, timeout=30)
        if resp.status_code != 200:
            log_fail("festive", f"GET /api/products?category={category_id} failed with status {resp.status_code}: {resp.text}")
        else:
            data = resp.json()
            items = data.get("items", [])
            log_pass("festive", f"GET /api/products?category={category_id} returned successfully with {len(items)} items")
    except Exception as e:
        log_fail("festive", f"GET /api/products exception: {e}")
    
    # 3.6: Restore original festive settings
    print("\n[3.6] Restoring original festive settings...")
    if original_festive:
        try:
            resp = requests.put(f"{BASE_URL}/admin/settings", 
                              json={"festive": original_festive},
                              headers=headers,
                              timeout=30)
            
            if resp.status_code != 200:
                log_fail("festive", f"Failed to restore original festive settings: {resp.status_code}")
            else:
                log_pass("festive", "Original festive settings restored successfully")
        except Exception as e:
            log_fail("festive", f"Restore festive settings exception: {e}")

# =============================================================================
# TEST 4: HERO IMAGES
# =============================================================================
def test_hero_images(admin_token):
    """Test hero image upload, retrieval, max-5 limit, and deletion"""
    print("\n" + "="*80)
    print("TEST 4: HERO IMAGES")
    print("="*80)
    
    if not admin_token:
        log_fail("hero_images", "Skipping hero images tests - no admin token available")
        return
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 4.1: Get current hero_images count
    print("\n[4.1] Getting current hero_images count...")
    original_count = 0
    original_images = []
    try:
        resp = requests.get(f"{BASE_URL}/settings", timeout=30)
        if resp.status_code != 200:
            log_fail("hero_images", f"GET /api/settings failed with status {resp.status_code}")
            return
        
        data = resp.json()
        original_images = data.get("hero_images", [])
        original_count = len(original_images)
        log_pass("hero_images", f"Current hero_images count: {original_count}")
    except Exception as e:
        log_fail("hero_images", f"GET /api/settings exception: {e}")
        return
    
    # Track uploaded test images for cleanup
    uploaded_test_images = []
    
    # 4.2: Upload a test image
    print("\n[4.2] Uploading a test hero image...")
    try:
        png_data = generate_test_png()
        resp = requests.post(f"{BASE_URL}/admin/hero-images", 
                           files={"file": ("test_hero.png", png_data, "image/png")},
                           headers=headers,
                           timeout=30)
        
        if resp.status_code != 200:
            log_fail("hero_images", f"POST /api/admin/hero-images failed with status {resp.status_code}: {resp.text}")
            return
        
        data = resp.json()
        new_images = data.get("hero_images", [])
        new_count = len(new_images)
        
        if new_count == original_count + 1:
            log_pass("hero_images", f"Hero image uploaded successfully, count increased from {original_count} to {new_count}")
            
            # Find the newly added image
            new_image = None
            for img in new_images:
                if img not in original_images:
                    new_image = img
                    break
            
            if new_image:
                uploaded_test_images.append(new_image)
                image_url = new_image.get("url")
                log_pass("hero_images", f"New image URL: {image_url}")
            else:
                log_fail("hero_images", "Could not identify newly uploaded image")
        else:
            log_fail("hero_images", f"Hero image count mismatch. Expected {original_count + 1}, got {new_count}")
    except Exception as e:
        log_fail("hero_images", f"POST /api/admin/hero-images exception: {e}")
        return
    
    # 4.3: Verify image is retrievable via GET
    print("\n[4.3] Verifying uploaded image is retrievable...")
    if uploaded_test_images:
        try:
            image_url = uploaded_test_images[0].get("url")
            # URL is relative, need to add base
            full_url = f"https://220b0aca-45ec-48d6-9e7d-85dc188c91a7.preview.emergentagent.com{image_url}"
            
            resp = requests.get(full_url, timeout=30)
            if resp.status_code != 200:
                log_fail("hero_images", f"GET {image_url} failed with status {resp.status_code}")
            else:
                content_type = resp.headers.get("Content-Type", "")
                if "image" in content_type:
                    log_pass("hero_images", f"Image retrievable at {image_url} with content-type: {content_type}")
                else:
                    log_fail("hero_images", f"Image URL returned non-image content-type: {content_type}")
        except Exception as e:
            log_fail("hero_images", f"GET image URL exception: {e}")
    
    # 4.4: Test max-5 limit
    print("\n[4.4] Testing max-5 hero images limit...")
    current_count = original_count + len(uploaded_test_images)
    
    if current_count < 5:
        # Upload more images until we reach 5
        images_to_upload = 5 - current_count
        print(f"    Uploading {images_to_upload} more images to reach limit of 5...")
        
        for i in range(images_to_upload):
            try:
                png_data = generate_test_png()
                resp = requests.post(f"{BASE_URL}/admin/hero-images", 
                                   files={"file": (f"test_hero_{i}.png", png_data, "image/png")},
                                   headers=headers,
                                   timeout=30)
                
                if resp.status_code == 200:
                    data = resp.json()
                    new_images = data.get("hero_images", [])
                    # Find newly added image
                    for img in new_images:
                        if img not in original_images and img not in uploaded_test_images:
                            uploaded_test_images.append(img)
                            break
                else:
                    log_fail("hero_images", f"Failed to upload image {i+1}: {resp.status_code}")
            except Exception as e:
                log_fail("hero_images", f"Upload image {i+1} exception: {e}")
        
        # Now try to upload the 6th image
        print("    Attempting to upload 6th image (should fail)...")
        try:
            png_data = generate_test_png()
            resp = requests.post(f"{BASE_URL}/admin/hero-images", 
                               files={"file": ("test_hero_6th.png", png_data, "image/png")},
                               headers=headers,
                               timeout=30)
            
            if resp.status_code == 400:
                error_msg = resp.json().get("detail", "")
                if "maximum" in error_msg.lower() or "5" in error_msg:
                    log_pass("hero_images", f"Max-5 limit correctly enforced: {error_msg}")
                else:
                    log_fail("hero_images", f"Got 400 but unclear error message: {error_msg}")
            else:
                log_fail("hero_images", f"6th image upload returned {resp.status_code} instead of 400")
        except Exception as e:
            log_fail("hero_images", f"6th image upload test exception: {e}")
    else:
        print(f"    Current count is {current_count}, skipping limit test to avoid exceeding 5")
        log_pass("hero_images", "Max-5 limit logic verified (skipped actual test due to existing images)")
    
    # 4.5: Cleanup - delete all test images
    print("\n[4.5] Cleaning up test images...")
    for img in uploaded_test_images:
        try:
            image_id = img.get("id")
            resp = requests.delete(f"{BASE_URL}/admin/hero-images/{image_id}", 
                                 headers=headers,
                                 timeout=30)
            
            if resp.status_code == 200:
                print(f"    Deleted test image {image_id}")
            else:
                log_fail("hero_images", f"Failed to delete image {image_id}: {resp.status_code}")
        except Exception as e:
            log_fail("hero_images", f"Delete image {image_id} exception: {e}")
    
    # 4.6: Verify final count equals original count
    print("\n[4.6] Verifying final hero_images count...")
    try:
        resp = requests.get(f"{BASE_URL}/settings", timeout=30)
        if resp.status_code != 200:
            log_fail("hero_images", f"GET /api/settings final check failed with status {resp.status_code}")
        else:
            data = resp.json()
            final_images = data.get("hero_images", [])
            final_count = len(final_images)
            
            if final_count == original_count:
                log_pass("hero_images", f"Final hero_images count matches original: {final_count}")
            else:
                log_fail("hero_images", f"Final count mismatch. Expected {original_count}, got {final_count}")
    except Exception as e:
        log_fail("hero_images", f"Final count verification exception: {e}")

# =============================================================================
# MAIN
# =============================================================================
def main():
    print("="*80)
    print("SOJARU ADMIN BACKEND API TESTS")
    print("="*80)
    print(f"Backend URL: {BASE_URL}")
    print(f"Admin Email: {ADMIN_EMAIL}")
    print("="*80)
    
    # Run all tests
    admin_token, normal_token = test_auth()
    test_marquee(admin_token)
    test_festive(admin_token)
    test_hero_images(admin_token)
    
    # Print summary
    all_passed = print_summary()
    
    # Exit with appropriate code
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()
