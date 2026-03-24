import requests
import sys
import json
from datetime import datetime

class CreatorFlowAPITester:
    def __init__(self, base_url="https://creator-hub-805.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.creator_token = None
        self.brand_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, token=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if token:
            test_headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n=== HEALTH CHECK TESTS ===")
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_seed_database(self):
        """Test database seeding"""
        print("\n=== DATABASE SEEDING ===")
        success, response = self.run_test("Seed Database", "POST", "seed", 200)
        return success

    def test_auth_flow(self):
        """Test authentication for both creator and brand"""
        print("\n=== AUTHENTICATION TESTS ===")
        
        # Test creator login
        creator_data = {
            "email": "demo@creator.com",
            "password": "demo123"
        }
        success, response = self.run_test("Creator Login", "POST", "auth/login", 200, creator_data)
        if success and 'access_token' in response:
            self.creator_token = response['access_token']
            print(f"   Creator token obtained: {self.creator_token[:20]}...")
        
        # Test brand login
        brand_data = {
            "email": "demo@brand.com", 
            "password": "demo123"
        }
        success, response = self.run_test("Brand Login", "POST", "auth/login", 200, brand_data)
        if success and 'access_token' in response:
            self.brand_token = response['access_token']
            print(f"   Brand token obtained: {self.brand_token[:20]}...")

        # Test auth/me endpoints
        if self.creator_token:
            self.run_test("Creator Auth Me", "GET", "auth/me", 200, token=self.creator_token)
        
        if self.brand_token:
            self.run_test("Brand Auth Me", "GET", "auth/me", 200, token=self.brand_token)

    def test_creator_endpoints(self):
        """Test creator-specific endpoints"""
        print("\n=== CREATOR ENDPOINTS ===")
        
        if not self.creator_token:
            print("❌ No creator token available, skipping creator tests")
            return

        # Test creator profile endpoints
        self.run_test("Get Creators List", "GET", "creators", 200)
        self.run_test("Get Creator by Username", "GET", "creators/sarahcreates", 200)
        
        # Test products
        self.run_test("Get Creator Products", "GET", "products", 200, token=self.creator_token)
        
        # Test store
        self.run_test("Get My Store", "GET", "store", 200, token=self.creator_token)
        
        # Test public store
        self.run_test("Get Public Store", "GET", "store/sarahcreates", 200)

    def test_brand_endpoints(self):
        """Test brand-specific endpoints"""
        print("\n=== BRAND ENDPOINTS ===")
        
        if not self.brand_token:
            print("❌ No brand token available, skipping brand tests")
            return

        # Test brand profile
        self.run_test("Get Brand Profile", "GET", "brands/profile", 200, token=self.brand_token)
        
        # Test campaigns
        self.run_test("Get Campaigns", "GET", "campaigns", 200, token=self.brand_token)
        
        # Test deals
        self.run_test("Get Deals", "GET", "deals", 200, token=self.brand_token)

    def test_ai_tools(self):
        """Test AI tools endpoints"""
        print("\n=== AI TOOLS TESTS ===")
        
        if not self.creator_token:
            print("❌ No creator token available, skipping AI tools tests")
            return

        # Test different AI tools
        ai_tools = [
            ("idea_generator", {"niche": "Tech"}),
            ("script_writer", {"topic": "Morning routine", "platform": "youtube", "tone": "casual"}),
            ("caption_writer", {"content": "A video about productivity tips"}),
            ("hashtag_optimizer", {"content": "fitness workout video"}),
            ("analytics_interpreter", {}),
            ("comment_responder", {}),
            ("thumbnail_generator", {"topic": "iPhone review"}),
            ("product_description", {"name": "Preset Pack", "details": "Lightroom presets"})
        ]
        
        for tool_type, input_data in ai_tools:
            self.run_test(f"AI Tool - {tool_type}", "POST", "ai/generate", 200, 
                         {"tool_type": tool_type, "input_data": input_data}, 
                         token=self.creator_token)

        # Test AI history
        self.run_test("AI Generation History", "GET", "ai/history", 200, token=self.creator_token)

    def test_analytics_endpoints(self):
        """Test analytics endpoints"""
        print("\n=== ANALYTICS TESTS ===")
        
        if not self.creator_token:
            print("❌ No creator token available, skipping analytics tests")
            return

        self.run_test("Analytics Overview", "GET", "analytics/overview", 200, token=self.creator_token)
        self.run_test("Revenue Analytics", "GET", "analytics/revenue?period=30d", 200, token=self.creator_token)
        self.run_test("Recent Activity", "GET", "analytics/activity", 200, token=self.creator_token)

    def test_payment_endpoints(self):
        """Test payment-related endpoints"""
        print("\n=== PAYMENT TESTS ===")
        
        # Test checkout creation (should work without auth for public purchases)
        checkout_data = {
            "amount": 29.99,
            "origin_url": "https://creator-hub-805.preview.emergentagent.com",
            "metadata": {"test": "true"}
        }
        success, response = self.run_test("Create Checkout Session", "POST", "payments/checkout", 200, checkout_data)
        
        if success and 'session_id' in response:
            session_id = response['session_id']
            # Test payment status check
            self.run_test("Check Payment Status", "GET", f"payments/status/{session_id}", 200)

    def test_campaign_creation(self):
        """Test campaign creation for brands"""
        print("\n=== CAMPAIGN CREATION TEST ===")
        
        if not self.brand_token:
            print("❌ No brand token available, skipping campaign creation")
            return

        campaign_data = {
            "title": "Test Campaign",
            "brief": "Testing campaign creation via API",
            "budget": 1000.0,
            "target_niche": "Tech",
            "target_followers_min": 10000,
            "target_followers_max": 500000
        }
        
        self.run_test("Create Campaign", "POST", "campaigns", 200, campaign_data, token=self.brand_token)

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting CreatorFlow API Tests")
        print(f"Testing against: {self.base_url}")
        
        # Run tests in order
        self.test_health_check()
        
        # Seed database first
        if not self.test_seed_database():
            print("❌ Database seeding failed, some tests may fail")
        
        self.test_auth_flow()
        self.test_creator_endpoints()
        self.test_brand_endpoints()
        self.test_ai_tools()
        self.test_analytics_endpoints()
        self.test_payment_endpoints()
        self.test_campaign_creation()
        
        # Print final results
        print(f"\n📊 FINAL RESULTS")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for test in self.failed_tests:
                error_msg = test.get('error', f"Expected {test.get('expected')}, got {test.get('actual')}")
                print(f"  - {test['name']}: {error_msg}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = CreatorFlowAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())