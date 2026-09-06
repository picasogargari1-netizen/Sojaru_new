#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Restore the Sojaru storefront (user's own MongoDB Atlas + WooCommerce). Verify admin can:
  1) Update the rolling/marquee messages above the header.
  2) Change the Festive Collection title (products come from a WooCommerce category tagged as festive).
  3) Add/update/delete up to 5 hero banner images; only existing images are shown on the homepage.

backend:
  - task: "Admin auth (login) and admin-guarded endpoints"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Admin seeded (hello@sojaru.co.in / admin123). Login verified manually via curl returning is_admin:true. Needs agent verification that non-admin token is rejected on /api/admin/* endpoints."
        -working: true
        -agent: "testing"
        -comment: "✅ ALL AUTH TESTS PASSED (6/6): Admin login returns 200 with token and is_admin=true. Normal user registration works with is_admin=false. Both PUT /api/admin/settings and POST /api/admin/hero-images correctly reject requests with no token (401) and with non-admin token (403). Authorization working perfectly."
  - task: "Marquee texts update via PUT /api/admin/settings"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Endpoint filters empty strings and persists marquee_texts. GET /api/settings should reflect the change."
        -working: true
        -agent: "testing"
        -comment: "✅ ALL MARQUEE TESTS PASSED (4/4): PUT /api/admin/settings successfully updates marquee_texts. Empty/whitespace entries correctly stripped (tested with ['Test line A', 'Test line B', '  '] -> ['Test line A', 'Test line B']). GET /api/settings reflects changes. Original marquee_texts restored successfully."
  - task: "Festive collection update via PUT /api/admin/settings"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Updates festive {title, category_id, enabled}. GET /api/settings reflects it. Verify products fetch for that category via GET /api/products?category=ID."
        -working: true
        -agent: "testing"
        -comment: "✅ ALL FESTIVE TESTS PASSED (6/6): PUT /api/admin/settings successfully updates festive collection (title, category_id, enabled). GET /api/settings correctly reflects changes. GET /api/products?category=<id> returns products without error (tested with category 23, returned 1 item). Original festive settings restored successfully."
  - task: "Hero banner upload/delete (Emergent object storage) max 5"
    implemented: true
    working: true
    file: "backend/server.py"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Storage init previously failed with 400 due to missing EMERGENT_LLM_KEY. Key now added to backend/.env and startup logs 'Storage initialized'. Verify POST /api/admin/hero-images accepts a small image, enforces max 5, image is served via GET /api/media/{path}, and DELETE removes it."
        -working: true
        -agent: "testing"
        -comment: "✅ ALL HERO IMAGE TESTS PASSED (6/6): POST /api/admin/hero-images successfully uploads images and increments count. Uploaded images retrievable via GET /api/media/{path} with correct content-type (image/png). Max-5 limit correctly enforced - 6th upload returns 400 with message 'You can have a maximum of 5 hero images. Delete one first.' DELETE /api/admin/hero-images/{id} successfully removes images. Cleanup verified - final count matches original. Emergent object storage working perfectly."

frontend:
  - task: "Admin dashboard managers (Hero/Marquee/Festive) UI"
    implemented: true
    working: "NA"
    file: "frontend/src/pages/AdminDashboard.jsx"
    stuck_count: 0
    priority: "medium"
    needs_retesting: false
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Already implemented. Not testing frontend yet — awaiting user permission."

metadata:
  created_by: "main_agent"
  version: "1.0"
  test_sequence: 1
  run_ui: false

test_plan:
  current_focus:
    - "Hero banner upload/delete (Emergent object storage) max 5"
    - "Marquee texts update via PUT /api/admin/settings"
    - "Festive collection update via PUT /api/admin/settings"
    - "Admin auth (login) and admin-guarded endpoints"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: |
      App restored with user's own MongoDB Atlas (DB 'Sojaru') and live WooCommerce. Admin creds in /app/memory/test_credentials.md.
      Please test ONLY the backend admin flows: (1) admin login, (2) PUT /api/admin/settings for marquee_texts and festive, (3) POST/DELETE /api/admin/hero-images including the max-5 limit and that the uploaded image is retrievable via /api/media/{path}, and (4) that /api/admin/* rejects non-admin/unauthenticated requests. Use a tiny generated PNG for the upload test and clean up any test image you create so no more than the pre-existing hero images remain.
    -agent: "testing"
    -message: |
      ✅ BACKEND TESTING COMPLETE - ALL 4 ADMIN FLOWS PASSED (22/22 tests)
      
      1. AUTH (6/6 passed): Admin login working with is_admin=true. Authorization correctly enforces admin-only access - both PUT /api/admin/settings and POST /api/admin/hero-images reject unauthenticated (401) and non-admin (403) requests.
      
      2. MARQUEE (4/4 passed): PUT /api/admin/settings updates marquee_texts correctly. Empty/whitespace entries properly stripped. Changes reflected in GET /api/settings. Original values restored.
      
      3. FESTIVE (6/6 passed): PUT /api/admin/settings updates festive collection (title, category_id, enabled). Changes reflected in GET /api/settings. GET /api/products?category=<id> works correctly. Original values restored.
      
      4. HERO IMAGES (6/6 passed): POST /api/admin/hero-images uploads successfully. Images retrievable via GET /api/media/{path} with correct content-type. Max-5 limit enforced with clear error message. DELETE /api/admin/hero-images/{id} removes images. All test images cleaned up. Emergent object storage integration working perfectly.
      
      No issues found. All backend admin functionality verified and working correctly.
