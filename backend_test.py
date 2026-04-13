import requests
import sys
import json
from datetime import datetime

class WeatherAPITester:
    def __init__(self, base_url="https://skycast-50.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            
            result = {
                'test_name': name,
                'endpoint': endpoint,
                'method': method,
                'expected_status': expected_status,
                'actual_status': response.status_code,
                'success': success,
                'response_data': None,
                'error': None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result['response_data'] = response.json()
                except:
                    result['response_data'] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    result['error'] = error_data
                    print(f"   Error: {error_data}")
                except:
                    result['error'] = response.text
                    print(f"   Error: {response.text}")

            self.test_results.append(result)
            return success, result.get('response_data', {})

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                'test_name': name,
                'endpoint': endpoint,
                'method': method,
                'expected_status': expected_status,
                'actual_status': 'ERROR',
                'success': False,
                'response_data': None,
                'error': str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n=== Testing Health Endpoints ===")
        
        # Test root endpoint
        self.run_test("Root Endpoint", "GET", "", 200)
        
        # Test health endpoint
        self.run_test("Health Check", "GET", "health", 200)

    def test_weather_endpoints(self):
        """Test weather API endpoints"""
        print("\n=== Testing Weather Endpoints ===")
        
        # Test current weather for London
        success, data = self.run_test(
            "Current Weather - London", 
            "GET", 
            "weather/current/London", 
            200
        )
        
        if success and data:
            print(f"   Location: {data.get('location', {}).get('name', 'N/A')}")
            print(f"   Temperature: {data.get('current', {}).get('temp_c', 'N/A')}°C")
        
        # Test current weather with coordinates
        success, data = self.run_test(
            "Current Weather - Coordinates", 
            "GET", 
            "weather/current/51.5074,-0.1278", 
            200
        )
        
        # Test forecast for London
        success, data = self.run_test(
            "Weather Forecast - London", 
            "GET", 
            "weather/forecast/London", 
            200,
            params={'days': 7, 'aqi': True, 'alerts': True}
        )
        
        if success and data:
            forecast_days = len(data.get('forecast', {}).get('forecastday', []))
            print(f"   Forecast days: {forecast_days}")
        
        # Test invalid location
        self.run_test(
            "Invalid Location", 
            "GET", 
            "weather/current/InvalidCityName123", 
            400
        )

    def test_search_endpoint(self):
        """Test location search endpoint"""
        print("\n=== Testing Search Endpoint ===")
        
        # Test search for London
        success, data = self.run_test(
            "Search Locations - London", 
            "GET", 
            "weather/search", 
            200,
            params={'q': 'London'}
        )
        
        if success and data:
            print(f"   Found {len(data)} locations")
            if data:
                print(f"   First result: {data[0].get('name', 'N/A')}, {data[0].get('country', 'N/A')}")
        
        # Test search with short query
        success, data = self.run_test(
            "Search Locations - Short Query", 
            "GET", 
            "weather/search", 
            200,
            params={'q': 'Lo'}
        )

    def test_favorites_endpoints(self):
        """Test favorite cities CRUD operations"""
        print("\n=== Testing Favorites Endpoints ===")
        
        # Get initial favorites
        success, initial_favorites = self.run_test(
            "Get Favorites - Initial", 
            "GET", 
            "favorites", 
            200
        )
        
        # Add a favorite city
        test_city = {
            "name": "Test City",
            "region": "Test Region",
            "country": "Test Country",
            "lat": 40.7128,
            "lon": -74.0060
        }
        
        success, add_response = self.run_test(
            "Add Favorite City", 
            "POST", 
            "favorites", 
            200,
            data=test_city
        )
        
        favorite_id = None
        if success and add_response:
            favorite_id = add_response.get('id')
            print(f"   Added favorite with ID: {favorite_id}")
        
        # Get favorites after adding
        success, updated_favorites = self.run_test(
            "Get Favorites - After Add", 
            "GET", 
            "favorites", 
            200
        )
        
        # Try to add duplicate
        self.run_test(
            "Add Duplicate Favorite", 
            "POST", 
            "favorites", 
            400,
            data=test_city
        )
        
        # Remove the favorite if we have the ID
        if favorite_id:
            self.run_test(
                "Remove Favorite City", 
                "DELETE", 
                f"favorites/{favorite_id}", 
                200
            )
        
        # Try to remove non-existent favorite
        self.run_test(
            "Remove Non-existent Favorite", 
            "DELETE", 
            "favorites/non-existent-id", 
            404
        )

    def test_history_endpoints(self):
        """Test search history endpoints"""
        print("\n=== Testing History Endpoints ===")
        
        # Get initial history
        success, initial_history = self.run_test(
            "Get History - Initial", 
            "GET", 
            "history", 
            200
        )
        
        # Add search history
        test_search = {
            "query": "Test Search",
            "name": "Test City",
            "region": "Test Region", 
            "country": "Test Country",
            "lat": 40.7128,
            "lon": -74.0060
        }
        
        success, add_response = self.run_test(
            "Add Search History", 
            "POST", 
            "history", 
            200,
            data=test_search
        )
        
        # Get history after adding
        success, updated_history = self.run_test(
            "Get History - After Add", 
            "GET", 
            "history", 
            200
        )
        
        # Clear history
        self.run_test(
            "Clear History", 
            "DELETE", 
            "history", 
            200
        )
        
        # Get history after clearing
        success, cleared_history = self.run_test(
            "Get History - After Clear", 
            "GET", 
            "history", 
            200
        )

    def test_astronomy_endpoint(self):
        """Test astronomy endpoint"""
        print("\n=== Testing Astronomy Endpoint ===")
        
        # Test astronomy for London
        success, data = self.run_test(
            "Astronomy Data - London", 
            "GET", 
            "weather/astronomy/London", 
            200
        )
        
        if success and data:
            astro = data.get('astronomy', {}).get('astro', {})
            print(f"   Sunrise: {astro.get('sunrise', 'N/A')}")
            print(f"   Sunset: {astro.get('sunset', 'N/A')}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Weather API Tests")
        print(f"Testing against: {self.base_url}")
        
        self.test_health_endpoints()
        self.test_weather_endpoints()
        self.test_search_endpoint()
        self.test_favorites_endpoints()
        self.test_history_endpoints()
        self.test_astronomy_endpoint()
        
        # Print summary
        print(f"\n📊 Test Summary")
        print(f"Tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {self.tests_run - self.tests_passed}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Save detailed results
        with open('/app/test_reports/backend_test_results.json', 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'summary': {
                    'tests_run': self.tests_run,
                    'tests_passed': self.tests_passed,
                    'tests_failed': self.tests_run - self.tests_passed,
                    'success_rate': (self.tests_passed/self.tests_run)*100
                },
                'test_results': self.test_results
            }, f, indent=2)
        
        return self.tests_passed == self.tests_run

def main():
    tester = WeatherAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())