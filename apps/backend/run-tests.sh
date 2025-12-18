#!/bin/bash

set -e

BASE_URL="http://localhost:8787"

function run_test() {
	local desc="$1"
	local cmd="$2"
	local expected_status="$3"

	echo
	echo "Testing: $desc"
	echo "Command: $cmd"

	local response
	response=$(eval "$cmd -w '\n%{http_code}' -s" 2>&1)
	local body=$(echo "$response")
	local actual_status=$(echo "$response" | tail -n1)

	if [ "$actual_status" = "$expected_status" ]; then
		echo "Success: $actual_status"
	else
		echo "Failed -> Wanted: $expected_status, Got: $actual_status"
		exit 1
	fi
	echo "Response: $body"
	echo
	echo "----------------------------------------"
}

# accessories tests
echo
echo "\n=== Accessories Tests ==="

run_test "Get accessories list" \
	"curl -X GET \"$BASE_URL/api/accessories?limit=10&offset=0&sort=price:asc\" -H \"Content-Type: application/json\"" \
	"200"

run_test "Get accessories inventory" \
	"curl -X GET \"$BASE_URL/api/accessories/inventory?limit=5&offset=0\" -H \"Content-Type: application/json\"" \
	"200"

run_test "Get manufacturers" \
	"curl -X GET \"$BASE_URL/api/accessories/manufacturers\" -H \"Content-Type: application/json\"" \
	"200"

run_test "Get cars (accessories context)" \
	"curl -X GET \"$BASE_URL/api/accessories/cars\" -H \"Content-Type: application/json\"" \
	"200"

run_test "Get specific accessory" \
	"curl -X GET \"$BASE_URL/api/accessories/1\" -H \"Content-Type: application/json\"" \
	"200"

run_test "Get specific car (accessories context)" \
	"curl -X GET \"$BASE_URL/api/accessories/cars/1\" -H \"Content-Type: application/json\"" \
	"200"

# cars tests
echo
echo "=== Cars Tests ==="

run_test "Get all cars" \
	"curl -X GET \"$BASE_URL/api/cars\" -H \"Content-Type: application/json\"" \
	"200"

run_test "Get car inventory" \
	"curl -X GET \"$BASE_URL/api/cars/inventory?limit=5&offset=0\" -H \"Content-Type: application/json\"" \
	"200"

run_test "Get specific car inventory" \
	"curl -X GET \"$BASE_URL/api/cars/inventory/11faaac6-62af-4ae6-afbe-91a00847a9c4\" -H \"Content-Type: application/json\"" \
	"200"

run_test "Get car manufacturers" \
	"curl -X GET \"$BASE_URL/api/cars/manufacturers\" -H \"Content-Type: application/json\"" \
	"200"

# cart tests
echo
echo "=== Cart Tests ==="

run_test "Get cart details" \
	"curl -X GET \"$BASE_URL/api/cart/details?ids=11faaac6-62af-4ae6-afbe-91a00847a9c4\" -H \"Content-Type: application/json\"" \
	"200"

run_test "Get cart accessories" \
	"curl -X GET \"$BASE_URL/api/cart/accessories?ids=1,2\" -H \"Content-Type: application/json\"" \
	"200"

run_test "Calculate cart total" \
	"curl -X POST \"$BASE_URL/api/cart/total\" -H \"Content-Type: application/json\" -d '{\"items\": [{ \"id\": 1, \"itemType\": \"accessory\", \"name\": \"WeatherTech Front Mats for Camry\", \"qty\": 1 }]}'" \
	"200"

# edge case tests
echo
echo "=== Edge Case Tests ==="

run_test "Non-existent accessory" \
	"curl -X GET \"$BASE_URL/api/accessories/9999\" -H \"Content-Type: application/json\"" \
	"404"

run_test "Non-existent car" \
	"curl -X GET \"$BASE_URL/api/cars/1\" -H \"Content-Type: application/json\"" \
	"404"

# end

echo
echo "=== Done ==="
