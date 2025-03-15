from flask import Flask, jsonify, request
from flask_pymongo import PyMongo
from bson import ObjectId
from flask_cors import CORS
from datetime import datetime
import uuid

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb+srv://nsai66022:1dD9PKWva67YeXOC@cluster0.wqu95.mongodb.net/FoodsDatabase?retryWrites=true&w=majority&appName=Cluster0"
mongo = PyMongo(app)
CORS(app)

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