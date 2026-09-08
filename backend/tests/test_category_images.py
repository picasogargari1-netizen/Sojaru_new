"""Tests for Category Images feature: upload, delete, settings response"""
import pytest
import requests
import os
import io

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

ADMIN_EMAIL = "hello@sojaru.co.in"
ADMIN_PASSWORD = "admin123"
TEST_SLUG = "design-refresh-615"

def get_admin_token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code == 200:
        return r.json().get("token")
    return None

@pytest.fixture(scope="module")
def token():
    t = get_admin_token()
    if not t:
        pytest.skip("Admin login failed")
    return t

@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}

# 1. GET /api/settings returns category_images key
def test_settings_has_category_images():
    r = requests.get(f"{BASE_URL}/api/settings")
    assert r.status_code == 200
    data = r.json()
    assert "category_images" in data, f"Missing category_images in settings. Keys: {list(data.keys())}"
    assert isinstance(data["category_images"], dict)

# 2. Upload requires auth (no token → 401/403)
def test_upload_requires_auth():
    img = io.BytesIO(b'\x89PNG\r\n\x1a\n' + b'\x00' * 20)
    r = requests.post(f"{BASE_URL}/api/admin/category-images/{TEST_SLUG}",
                      files={"file": ("test.png", img, "image/png")})
    assert r.status_code in [401, 403], f"Expected 401/403, got {r.status_code}"

# 3. Delete requires auth (no token → 401/403)
def test_delete_requires_auth():
    r = requests.delete(f"{BASE_URL}/api/admin/category-images/{TEST_SLUG}")
    assert r.status_code in [401, 403], f"Expected 401/403, got {r.status_code}"

# 4. Upload custom image for a slug
def test_upload_category_image(auth_headers):
    # minimal 1x1 PNG
    png_1x1 = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
        b'\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00'
        b'\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18'
        b'\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'
    )
    r = requests.post(
        f"{BASE_URL}/api/admin/category-images/{TEST_SLUG}",
        headers=auth_headers,
        files={"file": ("test.png", io.BytesIO(png_1x1), "image/png")}
    )
    assert r.status_code == 200, f"Upload failed: {r.status_code} {r.text}"
    data = r.json()
    assert "category_images" in data, f"Response missing category_images: {data}"
    assert TEST_SLUG in data["category_images"], f"Slug not in category_images: {data['category_images']}"

# 5. After upload, settings reflects the image
def test_settings_reflects_upload_after_upload(auth_headers):
    # Re-upload to ensure state
    png_1x1 = (
        b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01'
        b'\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00'
        b'\x00\x0cIDATx\x9cc\xf8\x0f\x00\x00\x01\x01\x00\x05\x18'
        b'\xd8N\x00\x00\x00\x00IEND\xaeB`\x82'
    )
    requests.post(
        f"{BASE_URL}/api/admin/category-images/{TEST_SLUG}",
        headers=auth_headers,
        files={"file": ("test.png", io.BytesIO(png_1x1), "image/png")}
    )
    r = requests.get(f"{BASE_URL}/api/settings")
    assert r.status_code == 200
    data = r.json()
    assert TEST_SLUG in data.get("category_images", {}), "Settings should have uploaded slug"

# 6. Delete custom image
def test_delete_category_image(auth_headers):
    r = requests.delete(f"{BASE_URL}/api/admin/category-images/{TEST_SLUG}", headers=auth_headers)
    assert r.status_code == 200, f"Delete failed: {r.status_code} {r.text}"
    data = r.json()
    assert "category_images" in data

# 7. After delete, slug not in settings
def test_settings_slug_removed_after_delete():
    r = requests.get(f"{BASE_URL}/api/settings")
    assert r.status_code == 200
    data = r.json()
    assert TEST_SLUG not in data.get("category_images", {}), "Slug should be removed after delete"
