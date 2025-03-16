from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from bson import ObjectId
from flask_cors import CORS
from datetime import datetime
import uuid
import requests
app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb+srv://nsai66022:1dD9PKWva67YeXOC@cluster0.wqu95.mongodb.net/FoodsDatabase?retryWrites=true&w=majority&appName=Cluster0"
mongo = PyMongo(app)
CORS(app)

# Base URL for the meal planning service
MEAL_PLANNING_BASE_URL = "http://localhost:8000"

@app.route('/api/v1/smart_meal_planner', methods=['POST'])
def smart_meal_planner():
    """
    Generate a meal plan with shopping suggestions using inventory from the database
    and dietary preferences provided in the request
    """
    # Get dietary preferences from request
    data = request.json
    if not data or 'dietary_preferences' not in data:
        return jsonify({"error": "Dietary preferences are required"}), 400
    
    dietary_preferences = data['dietary_preferences']
    
    # Get inventory from the database
    foods = mongo.db.Foods.find()
    inventory = []
    
    for food in foods:
        # Format inventory items to match the expected structure
        inventory_item = {
            "item_name": food.get('name', 'Unknown'),
            "quantity": food.get('quantity', 0),
            "unit": food.get('unit', 'g'),
            "expiry_date": None
        }
        
        # Convert expiry date if available
        if 'expiryDate' in food and food['expiryDate']:
            if isinstance(food['expiryDate'], datetime):
                inventory_item["expiry_date"] = food['expiryDate'].strftime('%Y-%m-%d')
            elif isinstance(food['expiryDate'], str):
                inventory_item["expiry_date"] = food['expiryDate'].split('T')[0]  # Format ISO date
        
        inventory.append(inventory_item)
    
    # Prepare payload for the meal planning service
    payload = {
        "dietary_preferences": dietary_preferences,
        "inventory": inventory
    }
    
    # Make request to meal planning service
    try:
        response = requests.post(f"{MEAL_PLANNING_BASE_URL}/smart_meal_planner/", json=payload)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": f"Meal planning service error: {response.text}"}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to meal planning service: {str(e)}"}), 500

@app.route('/api/v1/enhanced_shopping_list', methods=['GET'])
def enhanced_shopping_list():
    """
    Generate an enhanced shopping list based on inventory from the database,
    consumption trends and meal plans
    """
    # Get inventory from the database
    foods = mongo.db.Foods.find()
    inventory = []
    
    for food in foods:
        # Format inventory items to match the expected structure
        inventory_item = {
            "item_name": food.get('name', 'Unknown'),
            "quantity": food.get('quantity', 0),
            "unit": food.get('unit', 'g'),
            "expiry_date": None
        }
        
        # Convert expiry date if available
        if 'expiryDate' in food and food['expiryDate']:
            if isinstance(food['expiryDate'], datetime):
                inventory_item["expiry_date"] = food['expiryDate'].strftime('%Y-%m-%d')
            elif isinstance(food['expiryDate'], str):
                inventory_item["expiry_date"] = food['expiryDate'].split('T')[0]  # Format ISO date
        
        inventory.append(inventory_item)
    
    # Prepare payload for the meal planning service
    payload = {
        "inventory": inventory
    }
    
    # Make request to meal planning service
    try:
        response = requests.post(f"{MEAL_PLANNING_BASE_URL}/enhanced_smart_shopping_list/", json=payload)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": f"Shopping list service error: {response.text}"}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to meal planning service: {str(e)}"}), 500
@app.route('/api/v1/foods', methods=['GET'])
def get_foods():
    foods = mongo.db.Foods.find()
    response = []
    for food in foods:
        food['_id'] = str(food['_id'])
        if isinstance(food.get('boughtDate'), datetime):
            food['boughtDate'] = food['boughtDate'].isoformat()
        if isinstance(food.get('expiryDate'), datetime):
            food['expiryDate'] = food['expiryDate'].isoformat()
        response.append(food)
    return jsonify(response)

@app.route('/api/v1/foods', methods=['POST'])
def add_food():
    food = request.json
    
    # Convert date strings to datetime objects if they exist in the request
    if 'boughtDate' in food and isinstance(food['boughtDate'], str):
        food['boughtDate'] = datetime.fromisoformat(food['boughtDate'])
    if 'expiryDate' in food and isinstance(food['expiryDate'], str):
        food['expiryDate'] = datetime.fromisoformat(food['expiryDate'])
    
    # Generate UUID if not provided
    if '_id' not in food:
        food['_id'] = str(uuid.uuid4())
    
    food_id = mongo.db.Foods.insert_one(food).inserted_id
    response = mongo.db.Foods.find_one({'_id': food_id})
    response['_id'] = str(response['_id'])
    
    # Convert datetime objects to ISO strings for JSON response
    if isinstance(response.get('boughtDate'), datetime):
        response['boughtDate'] = response['boughtDate'].isoformat()
    if isinstance(response.get('expiryDate'), datetime):
        response['expiryDate'] = response['expiryDate'].isoformat()
    
    return jsonify(response)

@app.route('/api/v1/foods/<id>', methods=['GET'])
def get_food(id):
    # Check if ID is UUID format or ObjectId format
    try:
        if len(id) == 24:  # Likely ObjectId format
            food = mongo.db.Foods.find_one({'_id': ObjectId(id)})
        else:  # Likely UUID format
            food = mongo.db.Foods.find_one({'_id': id})
    except:
        food = mongo.db.Foods.find_one({'_id': id})
        
    if not food:
        return jsonify({"error": "Food not found"}), 404
        
    food['_id'] = str(food['_id'])
    
    # Convert datetime objects to ISO strings for JSON response
    if isinstance(food.get('boughtDate'), datetime):
        food['boughtDate'] = food['boughtDate'].isoformat()
    if isinstance(food.get('expiryDate'), datetime):
        food['expiryDate'] = food['expiryDate'].isoformat()
        
    return jsonify(food)

@app.route('/api/v1/foods/<id>', methods=['PUT'])
def update_food(id):
    food = request.json
    
    # Convert date strings to datetime objects if they exist in the request
    if 'boughtDate' in food and isinstance(food['boughtDate'], str):
        food['boughtDate'] = datetime.fromisoformat(food['boughtDate'])
    if 'expiryDate' in food and isinstance(food['expiryDate'], str):
        food['expiryDate'] = datetime.fromisoformat(food['expiryDate'])
    
    # Check if ID is UUID format or ObjectId format
    try:
        if len(id) == 24:  # Likely ObjectId format
            mongo.db.Foods.update_one({'_id': ObjectId(id)}, {'$set': food})
            response = mongo.db.Foods.find_one({'_id': ObjectId(id)})
        else:  # Likely UUID format
            mongo.db.Foods.update_one({'_id': id}, {'$set': food})
            response = mongo.db.Foods.find_one({'_id': id})
    except:
        mongo.db.Foods.update_one({'_id': id}, {'$set': food})
        response = mongo.db.Foods.find_one({'_id': id})
    
    if not response:
        return jsonify({"error": "Food not found"}), 404
        
    response['_id'] = str(response['_id'])
    
    # Convert datetime objects to ISO strings for JSON response
    if isinstance(response.get('boughtDate'), datetime):
        response['boughtDate'] = response['boughtDate'].isoformat()
    if isinstance(response.get('expiryDate'), datetime):
        response['expiryDate'] = response['expiryDate'].isoformat()
        
    return jsonify(response)
CONSUMPTION_SERVICE_BASE_URL = "http://localhost:8000"

@app.route('/api/v1/consumption', methods=['POST'])
def log_consumption():
    """
    Log item consumption by passing data to the consumption tracking service
    """
    # Get consumption data from request
    data = request.json
    if not data or 'item_name' not in data or 'quantity_used' not in data or 'remaining_stock' not in data:
        return jsonify({"error": "Item name, quantity used, and remaining stock are required"}), 400
    
    # Prepare payload for the consumption service
    payload = {
        "item_name": data['item_name'],
        "quantity_used": data['quantity_used'],
        "remaining_stock": data['remaining_stock']
    }
    
    # Make request to consumption logging service
    try:
        response = requests.post(f"{CONSUMPTION_SERVICE_BASE_URL}/log_consumption/", json=payload)
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": f"Consumption logging service error: {response.text}"}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to consumption service: {str(e)}"}), 500

@app.route('/api/v1/predict/<item_name>', methods=['GET'])
def predict_consumption(item_name):
    """
    Predict when an item will run out based on historical usage
    """
    # Make request to prediction service
    try:
        response = requests.get(f"{CONSUMPTION_SERVICE_BASE_URL}/predict/{item_name}")
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": f"Prediction service error: {response.text}"}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to prediction service: {str(e)}"}), 500

@app.route('/api/v1/predict_expiry', methods=['GET'])
def predict_expiry():
    """
    Predict which item will run out the soonest
    """
    # Make request to expiry prediction service
    try:
        response = requests.get(f"{CONSUMPTION_SERVICE_BASE_URL}/predict_expiry/")
        
        if response.status_code == 200:
            return jsonify(response.json())
        else:
            return jsonify({"error": f"Expiry prediction service error: {response.text}"}), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to expiry prediction service: {str(e)}"}), 500
@app.route('/api/v1/foods/<id>', methods=['DELETE'])
def delete_food(id):
    # Check if ID is UUID format or ObjectId format
    try:
        if len(id) == 24:  # Likely ObjectId format
            result = mongo.db.Foods.delete_one({'_id': ObjectId(id)})
        else:  # Likely UUID format
            result = mongo.db.Foods.delete_one({'_id': id})
    except:
        result = mongo.db.Foods.delete_one({'_id': id})
    
    if result.deleted_count == 0:
        return jsonify({"error": "Food not found"}), 404
        
    response = {'message': 'Food with id ' + id + ' has been deleted'}
    return jsonify(response)
if __name__ == '__main__':
    app.run(debug=True)