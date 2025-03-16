import requests
import json
from datetime import datetime

# Base URL for your Flask API
BASE_URL = "http://localhost:5000/api/v1"

def test_smart_meal_planner():
    """
    Test the smart meal planner endpoint
    """
    print("\n===== TESTING SMART MEAL PLANNER API =====")
    
    # Sample dietary preferences
    dietary_preferences = {
        "preference_type": "vegetarian",
        "avoid_ingredients": ["nuts", "dairy"],
        "preferred_ingredients": ["vegetables", "tofu"],
        "calorie_target": 2000
    }
    
    # Create payload
    payload = {
        "dietary_preferences": dietary_preferences
    }
    
    # Make request to the API
    try:
        response = requests.post(f"{BASE_URL}/smart_meal_planner", json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_meal_plan_result(result)
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {str(e)}")

def test_enhanced_shopping_list():
    """
    Test the enhanced shopping list endpoint
    """
    print("\n===== TESTING ENHANCED SHOPPING LIST API =====")
    
    # Make request to the API
    try:
        response = requests.get(f"{BASE_URL}/enhanced_shopping_list")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print_shopping_list_result(result)
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {str(e)}")

def print_meal_plan_result(result):
    """
    Helper function to display meal plan result in a readable format
    """
    if "meal_plan" in result:
        meal_plan = result["meal_plan"]
        print("\n----- MEAL PLAN -----")
        
        # Print meals
        for meal_type in ["breakfast", "lunch", "dinner"]:
            if meal_type in meal_plan:
                meal = meal_plan[meal_type]
                print(f"\n{meal_type.upper()}: {meal.get('name', 'No name')}")
                print(f"Description: {meal.get('description', 'No description')}")
                
                print("Ingredients:")
                for ingredient in meal.get("ingredients", []):
                    print(f"  - {ingredient}")
                    
                if "instructions" in meal:
                    print(f"Instructions: {meal['instructions']}")
    
    if "shopping_suggestions" in result:
        shopping = result["shopping_suggestions"]
        print("\n----- SHOPPING SUGGESTIONS -----")
        
        # Print missing ingredients
        missing = shopping.get("missing_ingredients", [])
        if missing:
            print("\nMissing ingredients:")
            for ingredient in missing:
                print(f"  - {ingredient}")
        
        # Print recommendations
        recommendations = shopping.get("recommendations", {})
        if recommendations:
            print("\nRecommendations:")
            for ingredient, alternatives in recommendations.items():
                print(f"  - Instead of {ingredient}, try: {', '.join(alternatives)}")

def print_shopping_list_result(result):
    """
    Helper function to display shopping list result in a readable format
    """
    if "shopping_list" not in result:
        print("No shopping list data available")
        return
    
    shopping = result["shopping_list"]
    
    # Print urgent items
    urgent = shopping.get("urgent_items", [])
    if urgent:
        print("\n----- URGENT ITEMS -----")
        for item in urgent:
            print(f"- {item['item_name']} (Days left: {item.get('days_left', 'N/A')})")
            if item.get('suggested_similar_items'):
                print(f"  Similar items: {', '.join(item['suggested_similar_items'])}")
    
    # Print meal plan items
    meal_items = shopping.get("meal_plan_items", [])
    if meal_items:
        print("\n----- MEAL PLAN ITEMS -----")
        for item in meal_items:
            print(f"- {item['item_name']}")
            if item.get('suggested_similar_items'):
                print(f"  Similar items: {', '.join(item['suggested_similar_items'])}")
    
    # Print other items
    other = shopping.get("other_items", [])
    if other:
        print("\n----- OTHER ITEMS -----")
        for item in other:
            print(f"- {item['item_name']} (Days left: {item.get('days_left', 'N/A')})")
            if item.get('suggested_similar_items'):
                print(f"  Similar items: {', '.join(item['suggested_similar_items'])}")
    
    # Print complementary suggestions
    complementary = shopping.get("complementary_suggestions", [])
    if complementary:
        print("\n----- COMPLEMENTARY SUGGESTIONS -----")
        for item in complementary:
            print(f"- {item['item_name']}")


def test_log_consumption():
    """
    Test the consumption logging endpoint
    """
    print("\n===== TESTING CONSUMPTION LOGGING API =====")
    
    # Sample consumption data
    consumption_data = {
        "item_name": "Milk",
        "quantity_used": 0.5,
        "remaining_stock": 1.5
    }
    
    # Make request to the API
    try:
        response = requests.post(f"{BASE_URL}/consumption", json=consumption_data)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Result: {json.dumps(result, indent=2)}")
            print(f"Message: {result.get('message', 'No message')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {str(e)}")

def test_predict_consumption():
    """
    Test the consumption prediction endpoint for a specific item
    """
    print("\n===== TESTING CONSUMPTION PREDICTION API =====")
    
    # Test item name
    item_name = "Milk"
    
    # Make request to the API
    try:
        response = requests.get(f"{BASE_URL}/predict/{item_name}")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Result: {json.dumps(result, indent=2)}")
            print(f"Prediction: {result.get('prediction', 'No prediction')}")
            print(f"Days until empty: {result.get('days_until_empty', 'N/A')}")
            print(f"Refill date: {result.get('refill_date', 'N/A')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {str(e)}")

def test_predict_expiry():
    """
    Test the expiry prediction endpoint
    """
    print("\n===== TESTING EXPIRY PREDICTION API =====")
    
    # Make request to the API
    try:
        response = requests.get(f"{BASE_URL}/predict_expiry")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Result: {json.dumps(result, indent=2)}")
            print(f"Soonest expiry: {result.get('soonest_expiry', 'No prediction')}")
            print(f"Item name: {result.get('item_name', 'N/A')}")
            print(f"Days left: {result.get('days_left', 'N/A')}")
            print(f"Expiry date: {result.get('expiry_date', 'N/A')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {str(e)}")

# Extend the main function to include the new tests
def main():
    """
    Main function to run tests
    """
    print("===== FOOD MANAGEMENT API TESTING CLIENT =====")
    print("1. Test Smart Meal Planner")
    print("2. Test Enhanced Shopping List")
    print("3. Test Both Meal Planning Services")
    print("4. Test Consumption Logging")
    print("5. Test Consumption Prediction")
    print("6. Test Expiry Prediction")
    print("7. Test All Consumption Services")
    print("8. Test All Services")
    print("9. Exit")
    
    while True:
        choice = input("\nEnter your choice (1-9): ")
        
        if choice == "1":
            test_smart_meal_planner()
        elif choice == "2":
            test_enhanced_shopping_list()
        elif choice == "3":
            test_smart_meal_planner()
            test_enhanced_shopping_list()
        elif choice == "4":
            test_log_consumption()
        elif choice == "5":
            test_predict_consumption()
        elif choice == "6":
            test_predict_expiry()
        elif choice == "7":
            test_log_consumption()
            test_predict_consumption()
            test_predict_expiry()
        elif choice == "8":
            test_smart_meal_planner()
            test_enhanced_shopping_list()
            test_log_consumption()
            test_predict_consumption()
            test_predict_expiry()
        elif choice == "9":
            print("\nExiting...")
            break
        else:
            print("\nInvalid choice. Please enter a number between 1 and 9.")

if __name__ == "__main__":
    main()