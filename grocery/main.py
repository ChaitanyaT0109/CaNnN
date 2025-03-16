from fastapi import FastAPI, HTTPException, Depends, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import os
from datetime import datetime, timedelta
import json
from typing import List, Optional
import asyncio
from moya.conversation.thread import Thread
from moya.tools.base_tool import BaseTool
from moya.tools.ephemeral_memory import EphemeralMemory
from moya.tools.tool_registry import ToolRegistry
from moya.registry.agent_registry import AgentRegistry
from moya.orchestrators.simple_orchestrator import SimpleOrchestrator
from moya.agents.azure_openai_agent import AzureOpenAIAgent, AzureOpenAIAgentConfig
from moya.conversation.message import Message
from mealplanningagent import register_meal_planning_endpoints, get_meal_planning_orchestrator, MealPlanRequest, generate_meal_plan,load_previous_meal_plans

app = FastAPI(title="Smart Kitchen Inventory API")

# Set required environment variables directly in the code
os.environ["AZURE_OPENAI_API_KEY"] = "GKCraQ3njQHy2ESzLrecmyBgQfzjZzOEsz2e9YkIQ9jJ7654kd9zJQQJ99BCACHYHv6XJ3w3AAABACOGobr2"
os.environ["AZURE_OPENAI_ENDPOINT"] = "https://aoi-iiit-hack-2.openai.azure.com/"
os.environ["AZURE_OPENAI_API_VERSION"] = "2023-12-01-preview"
# Add CORS middleware to allow requests from any origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CSV_FILE = "data/consumption_log.csv"

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

# Initialize CSV with sample data if it doesn't exist
if not os.path.exists(CSV_FILE):
    sample_data = pd.DataFrame([
        {"item_name": "Milk", "date_consumed": "2025-03-01", "quantity_used": 1, "remaining_stock": 5},
        {"item_name": "Milk", "date_consumed": "2025-03-05", "quantity_used": 1, "remaining_stock": 4},
        {"item_name": "Milk", "date_consumed": "2025-03-10", "quantity_used": 1, "remaining_stock": 3},
        {"item_name": "Eggs", "date_consumed": "2025-03-02", "quantity_used": 6, "remaining_stock": 12},
        {"item_name": "Eggs", "date_consumed": "2025-03-06", "quantity_used": 6, "remaining_stock": 6},
        {"item_name": "Eggs", "date_consumed": "2025-03-09", "quantity_used": 6, "remaining_stock": 0},
        {"item_name": "Rice", "date_consumed": "2025-03-03", "quantity_used": 500, "remaining_stock": 5000},
        {"item_name": "Rice", "date_consumed": "2025-03-08", "quantity_used": 500, "remaining_stock": 4500},
        {"item_name": "Rice", "date_consumed": "2025-03-13", "quantity_used": 500, "remaining_stock": 4000},
        {"item_name": "Tomatoes", "date_consumed": "2025-03-04", "quantity_used": 3, "remaining_stock": 10},
        {"item_name": "Tomatoes", "date_consumed": "2025-03-07", "quantity_used": 3, "remaining_stock": 7},
        {"item_name": "Tomatoes", "date_consumed": "2025-03-11", "quantity_used": 3, "remaining_stock": 4},
        {"item_name": "Bread", "date_consumed": "2025-03-05", "quantity_used": 1, "remaining_stock": 3},
        {"item_name": "Bread", "date_consumed": "2025-03-08", "quantity_used": 1, "remaining_stock": 2},
        {"item_name": "Bread", "date_consumed": "2025-03-12", "quantity_used": 1, "remaining_stock": 1},
    ])
    sample_data.to_csv(CSV_FILE, index=False)


class ConsumptionLog(BaseModel):
    item_name: str
    quantity_used: float
    remaining_stock: float


class SimilarProductsRequest(BaseModel):
    item_name: str


class ShoppingListItem(BaseModel):
    item_name: str
    refill_by: str
    remaining_stock: float
    daily_usage: float
    days_left: float
    suggested_similar_items: List[str]


class ShoppingListResponse(BaseModel):
    shopping_list: List[ShoppingListItem]


class SimilarProductsResponse(BaseModel):
    item_name: str
    similar_products: List[str]


def load_data():
    """ Load consumption data """
    try:
        return pd.read_csv(CSV_FILE, parse_dates=["date_consumed"])
    except Exception as e:
        print(f"Error loading data: {e}")
        # Return empty DataFrame with correct columns
        return pd.DataFrame(columns=["item_name", "date_consumed", "quantity_used", "remaining_stock"])


def save_data(df):
    """ Save updated data """
    try:
        df.to_csv(CSV_FILE, index=False)
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False
def get_ai_orchestrator():
    """Get or create AI orchestrator singleton"""
    if not hasattr(get_ai_orchestrator, "instance") or get_ai_orchestrator.instance is None:
        try:
            # Print environment variables for debugging
            print(f"AZURE_OPENAI_API_KEY set: {'Yes' if os.getenv('AZURE_OPENAI_API_KEY') else 'No'}")
            print(f"AZURE_OPENAI_ENDPOINT set: {'Yes' if os.getenv('AZURE_OPENAI_ENDPOINT') else 'No'}")
            print(f"AZURE_OPENAI_API_VERSION set: {'Yes' if os.getenv('AZURE_OPENAI_API_VERSION') else 'No'}")
            
            # Ensure the API key is available
            api_key = os.environ.get("AZURE_OPENAI_API_KEY")
            if not api_key:
                raise ValueError("AZURE_OPENAI_API_KEY environment variable is required")
            
            # Get the endpoint
            api_base = os.environ.get("AZURE_OPENAI_ENDPOINT")
            if not api_base:
                raise ValueError("AZURE_OPENAI_ENDPOINT environment variable is required")
            
            # Get API version
            api_version = os.environ.get("AZURE_OPENAI_API_VERSION", "2023-12-01-preview")

            tool_registry = ToolRegistry()
            EphemeralMemory.configure_memory_tools(tool_registry)
            
            agent_config = AzureOpenAIAgentConfig(
                agent_name="product_recommendation_agent",
                description="AI agent for suggesting similar products",
                model_name="gpt-4o",
                agent_type="ChatAgent",
                tool_registry=tool_registry,
                system_prompt="""
                    You are an AI assistant that suggests similar products based on grocery items.
                    When given an item name, suggest 2-3 related products that are commonly purchased together.
                    Keep suggestions concise and relevant to the original item.
                    Return only the names of the suggested products, separated by commas.
                """,
                api_key=api_key,
                api_base=api_base,
                api_version=api_version,
            )

            agent = AzureOpenAIAgent(config=agent_config)
            agent_registry = AgentRegistry()
            agent_registry.register_agent(agent)

            orchestrator = SimpleOrchestrator(agent_registry=agent_registry, default_agent_name="product_recommendation_agent")
            get_ai_orchestrator.instance = orchestrator
            print("AI recommendation engine initialized successfully")
        except Exception as e:
            print(f"Error initializing AI agent: {e}")
            import traceback
            traceback.print_exc()
            # Fallback to None if initialization fails
            get_ai_orchestrator.instance = None
    
    return get_ai_orchestrator.instance

async def get_similar_products(item_name: str) -> List[str]:
    """Get similar product recommendations from AI"""
    orchestrator = get_ai_orchestrator()
    
    if not orchestrator:
        print(f"Warning: AI orchestrator not available for recommendations for {item_name}")
        return []
    
    try:
        prompt = f"Suggest 2-3 similar products or complementary items for {item_name} that people often buy together. Only list the item names, separated by commas."
        response = orchestrator.orchestrate(
            thread_id=f"recommendation_{item_name}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            user_message=prompt
        )
        
        # Clean and process the response
        if not response or len(response.strip()) == 0:
            return []
            
        # Extract product names from the response
        similar_products = [product.strip() for product in response.split(',')]
        return similar_products[:3]  # Limit to maximum 3 recommendations
    except Exception as e:
        print(f"Error getting recommendations for {item_name}: {e}")
        return []


@app.post("/log_consumption/", response_model=dict)
async def log_consumption(entry: ConsumptionLog):
    """ 
    Log item consumption 
    
    Example curl:
    curl -X POST "http://localhost:8000/log_consumption/" 
         -H "Content-Type: application/json" 
         -d '{"item_name":"Milk", "quantity_used":1, "remaining_stock":2}'
    """
    try:
        df = load_data()
        new_entry = {
            "item_name": entry.item_name,
            "date_consumed": datetime.now().strftime("%Y-%m-%d"),
            "quantity_used": entry.quantity_used,
            "remaining_stock": entry.remaining_stock,
        }
        df = pd.concat([df, pd.DataFrame([new_entry])], ignore_index=True)
        save_data(df)
        return {"status": "success", "message": "Consumption logged successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging consumption: {str(e)}")


@app.get("/predict/{item_name}", response_model=dict)
async def predict_consumption(item_name: str):
    """ 
    Predict when an item will run out based on historical usage 
    
    Example curl:
    curl -X GET "http://localhost:8000/predict/Milk"
    """
    try:
        df = load_data()
        df = df[df["item_name"] == item_name]

        if len(df) < 3:
            raise HTTPException(status_code=400, detail="Not enough data for prediction")

        df["date_consumed"] = pd.to_datetime(df["date_consumed"], format="%Y-%m-%d", errors='coerce')
        df = df.sort_values("date_consumed")

        # Calculate average consumption rate
        df["date_diff"] = df["date_consumed"].diff().dt.days
        df["date_diff"] = df["date_diff"].replace(0, 1).fillna(1)  # Avoid division by zero
        df["daily_usage"] = df["quantity_used"] / df["date_diff"]

        # Remove invalid values
        df["daily_usage"] = df["daily_usage"].replace([float('inf'), -float('inf')], None).dropna()

        if df["daily_usage"].isna().all():
            raise HTTPException(status_code=400, detail="Invalid data: Unable to compute usage rate")

        avg_daily_usage = df["daily_usage"].mean()
        remaining_stock = df.iloc[-1]["remaining_stock"]

        if avg_daily_usage <= 0 or remaining_stock <= 0:
            raise HTTPException(status_code=400, detail="Invalid consumption data")

        days_until_empty = remaining_stock / avg_daily_usage
        refill_date = datetime.now() + timedelta(days=days_until_empty)

        return {
            "status": "success", 
            "item_name": item_name,
            "prediction": f"Refill needed by {refill_date.strftime('%Y-%m-%d')}",
            "days_until_empty": round(days_until_empty, 1),
            "refill_date": refill_date.strftime('%Y-%m-%d')
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting consumption: {str(e)}")


@app.get("/predict_expiry/", response_model=dict)
async def predict_expiry():
    """ 
    Predict which item will run out the soonest 
    
    Example curl:
    curl -X GET "http://localhost:8000/predict_expiry/"
    """
    try:
        df = load_data()
        df["date_consumed"] = pd.to_datetime(df["date_consumed"], format="%Y-%m-%d", errors='coerce')
        df = df.sort_values(["item_name", "date_consumed"])

        soonest_item = None
        soonest_date = None
        days_left = None

        for item_name, group in df.groupby("item_name"):
            if len(group) < 3:
                continue  # Skip items with insufficient data

            group["date_diff"] = group["date_consumed"].diff().dt.days
            group["date_diff"] = group["date_diff"].replace(0, 1).fillna(1)
            group["daily_usage"] = group["quantity_used"] / group["date_diff"]

            # Remove invalid values
            group["daily_usage"] = group["daily_usage"].replace([float('inf'), -float('inf')], None).dropna()
            if group["daily_usage"].isna().all():
                continue

            avg_daily_usage = group["daily_usage"].mean()
            remaining_stock = group.iloc[-1]["remaining_stock"]

            if avg_daily_usage <= 0 or remaining_stock <= 0:
                continue  # Skip items with invalid data

            days_until_empty = remaining_stock / avg_daily_usage
            expiry_date = datetime.now() + timedelta(days=days_until_empty)

            if soonest_date is None or expiry_date < soonest_date:
                soonest_date = expiry_date
                soonest_item = item_name
                days_left = days_until_empty

        if soonest_item is None:
            raise HTTPException(status_code=400, detail="No valid expiry predictions available")

        return {
            "status": "success",
            "soonest_expiry": f"{soonest_item} will run out by {soonest_date.strftime('%Y-%m-%d')}",
            "item_name": soonest_item,
            "days_left": round(days_left, 1),
            "expiry_date": soonest_date.strftime('%Y-%m-%d')
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting expiry: {str(e)}")
# First, let's create a new Pydantic model for the request
@app.post("/suggest_for_shopping_list/", response_model=dict)
async def suggest_for_shopping_list(shopping_list: List[str]):
    """ 
    Get AI recommendations for similar products based on a shopping list
    
    Example curl:
    curl -X POST "http://localhost:8000/suggest_for_shopping_list/" 
         -H "Content-Type: application/json" 
         -d '["Milk", "Eggs", "Bread"]'
    """
    try:
        results = {}
        recommendation_tasks = []
        
        # Create tasks for each item in the shopping list
        for item in shopping_list:
            task = get_similar_products(item)
            recommendation_tasks.append((item, task))
        
        # Wait for all recommendation tasks to complete
        for item_name, task in recommendation_tasks:
            try:
                similar_products = await task
                results[item_name] = similar_products
            except Exception as e:
                print(f"Error getting recommendations for {item_name}: {e}")
                results[item_name] = []  # Empty list for items that failed
        
        return {
            "status": "success",
            "recommendations": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error suggesting products for shopping list: {str(e)}")
    
@app.post("/suggest_similar_products/", response_model=SimilarProductsResponse)
async def suggest_similar_products(request: SimilarProductsRequest):
    """
    Get AI recommendations for similar products
    
    Example curl:
    curl -X POST "http://localhost:8000/suggest_similar_products/" 
         -H "Content-Type: application/json" 
         -d '{"item_name":"Milk"}'
    """
    try:
        similar_products = await get_similar_products(request.item_name)
        return SimilarProductsResponse(
            item_name=request.item_name,
            similar_products=similar_products
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error suggesting similar products: {str(e)}")

@app.get("/smart_shopping_list/", response_model=dict)
async def smart_shopping_list():
    """ 
    Generate a smart shopping list based on predicted consumption trends with AI recommendations
    
    Example curl:
    curl -X GET "http://localhost:8000/smart_shopping_list/"
    """
    try:
        df = load_data()
        df["date_consumed"] = pd.to_datetime(df["date_consumed"], errors='coerce')
        df = df.sort_values(["item_name", "date_consumed"])

        shopping_list = []
        recommendation_tasks = []
        items_to_recommend = []

        # First pass: Calculate consumption metrics and identify items running low
        for item_name, group in df.groupby("item_name"):
            if len(group) < 3:
                continue

            group["date_diff"] = group["date_consumed"].diff().dt.days
            group["date_diff"] = group["date_diff"].replace(0, 1).fillna(1)
            group["daily_usage"] = group["quantity_used"] / group["date_diff"]

            group["daily_usage"] = group["daily_usage"].replace([float('inf'), -float('inf')], None).dropna()
            if group["daily_usage"].isna().all():
                continue

            avg_daily_usage = group["daily_usage"].mean()
            remaining_stock = group.iloc[-1]["remaining_stock"]

            if avg_daily_usage <= 0 or remaining_stock <= 0:
                continue

            days_until_empty = remaining_stock / avg_daily_usage
            expiry_date = datetime.now() + timedelta(days=days_until_empty)

            if days_until_empty < 5:
                items_to_recommend.append(item_name)
                
                shopping_list.append({
                    "item_name": item_name,
                    "refill_by": expiry_date.strftime('%Y-%m-%d'),
                    "remaining_stock": remaining_stock,
                    "daily_usage": round(avg_daily_usage, 2),
                    "days_left": round(days_until_empty, 1),
                    "suggested_similar_items": []  # Will be filled later
                })

        # Sort by urgency (lowest days_left first) and take top 5
        shopping_list = sorted(shopping_list, key=lambda x: x["days_left"])[:5]
        
        if not shopping_list:
            return {"status": "success", "message": "All items have sufficient stock", "shopping_list": []}
            
        # Second pass: Get recommendations for all items in parallel
        for item in shopping_list:
            task = get_similar_products(item["item_name"])
            recommendation_tasks.append((item["item_name"], task))
            
        # Wait for all recommendation tasks and update shopping list items
        for item_name, task in recommendation_tasks:
            try:
                similar_products = await task
                # Find the corresponding item in the shopping list
                for item in shopping_list:
                    if item["item_name"] == item_name:
                        item["suggested_similar_items"] = similar_products
                        break
            except Exception as e:
                print(f"Error getting recommendations for {item_name}: {e}")
                # Continue even if one recommendation fails
                continue

        return {"status": "success", "shopping_list": shopping_list}
        
    except Exception as e:
        print(f"Error generating shopping list: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating shopping list: {str(e)}")


@app.get("/items/", response_model=dict)
async def get_all_items():
    """
    Get a list of all tracked items in the system
    
    Example curl:
    curl -X GET "http://localhost:8000/items/"
    """
    try:
        df = load_data()
        unique_items = df["item_name"].unique().tolist()
        return {"status": "success", "items": unique_items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving items: {str(e)}")


@app.get("/item_history/{item_name}", response_model=dict)
async def get_item_history(item_name: str):
    """
    Get consumption history for a specific item
    
    Example curl:
    curl -X GET "http://localhost:8000/item_history/Milk"
    """
    try:
        df = load_data()
        item_data = df[df["item_name"] == item_name].sort_values("date_consumed")
        
        if item_data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for item: {item_name}")
            
        history = []
        for _, row in item_data.iterrows():
            history.append({
                "date": pd.to_datetime(row["date_consumed"]).strftime("%Y-%m-%d"),
                "quantity_used": row["quantity_used"],
                "remaining_stock": row["remaining_stock"]
            })
            
        return {
            "status": "success", 
            "item_name": item_name,
            "history": history
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving item history: {str(e)}")


@app.on_event("startup")
async def startup_event():
    """Initialize the AI agent on startup"""
    # Force initialization of the orchestrator singleton
    orchestrator = get_ai_orchestrator()
    if orchestrator:
        print("AI recommendation engine initialized successfully")
    else:
        print("Warning: AI recommendation engine initialization failed")
         
    # Initialize meal planning orchestrator
    meal_orchestrator = get_meal_planning_orchestrator()
    if meal_orchestrator:
        print("Meal planning AI engine initialized successfully")
    else:
        print("Warning: Meal planning AI engine initialization failed")


# Health check endpoint for monitoring
@app.get("/health", response_model=dict)
async def health_check():
    """
    API health check endpoint
    
    Example curl:
    curl -X GET "http://localhost:8000/health"
    """
    # Check data file access
    data_file_accessible = os.path.exists(CSV_FILE)
    
    # Check AI service status
    ai_service_available = get_ai_orchestrator() is not None
    
    return {
        "status": "healthy" if data_file_accessible and ai_service_available else "degraded",
        "timestamp": datetime.now().isoformat(),
        "data_storage": "accessible" if data_file_accessible else "inaccessible",
        "ai_service": "available" if ai_service_available else "unavailable"
    }

# At the end of your main app file, before the if __name__ == "__main__" block:

# Register the meal planning endpoints
register_meal_planning_endpoints(app)

# Add a combined endpoint for meal planning and shopping suggestions
@app.post("/smart_meal_planner/", response_model=dict)
async def smart_meal_planner(request: MealPlanRequest = Body(...)):
    """
    Generate a meal plan based on dietary preferences and inventory,
    and provide shopping suggestions for missing ingredients
    
    Example curl:
    curl -X POST "http://localhost:8000/smart_meal_planner/" 
         -H "Content-Type: application/json" 
         -d '{
             "dietary_preferences": {
                 "preference_type": "vegetarian",
                 "avoid_ingredients": ["nuts"],
                 "preferred_ingredients": ["vegetables"],
                 "calorie_target": 2000
             },
             "inventory": [
                 {"item_name": "Rice", "quantity": 500, "unit": "g", "expiry_date": "2025-04-01"},
                 {"item_name": "Tomatoes", "quantity": 5, "unit": "pieces", "expiry_date": "2025-03-20"}
             ]
         }'
    """
    try:
        # Generate meal plan
        meal_plan = await generate_meal_plan(request)
        
        # Extract all required ingredients from the meal plan
        required_ingredients = set()
        
        # Collect ingredients from all meals
        for meal_type in ["breakfast", "lunch", "dinner"]:
            meal = getattr(meal_plan, meal_type)
            for ingredient in meal.ingredients:
                # Extract just the ingredient name without quantity
                # Assuming format like "2 cups rice" or "500g flour"
                parts = ingredient.split(" ", 1)
                if len(parts) > 1 and (parts[0].isdigit() or any(char.isdigit() for char in parts[0])):
                    ingredient_name = parts[1]
                else:
                    ingredient_name = ingredient
                
                # Clean up the ingredient name (remove common suffixes)
                for suffix in [", chopped", ", diced", ", sliced", ", minced"]:
                    if suffix in ingredient_name:
                        ingredient_name = ingredient_name.split(suffix)[0]
                
                required_ingredients.add(ingredient_name.strip().lower())
        
        # Check which ingredients are missing from inventory
        inventory_items = {item.item_name.lower() for item in request.inventory}
        missing_ingredients = [ing for ing in required_ingredients if not any(inv in ing or ing in inv for inv in inventory_items)]
        
        # Get AI recommendations for the missing ingredients
        recommendation_tasks = []
        for ingredient in missing_ingredients[:5]:  # Limit to 5 ingredients for recommendations
            task = get_similar_products(ingredient)
            recommendation_tasks.append((ingredient, task))
        
        # Wait for recommendations
        recommendations = {}
        for ingredient, task in recommendation_tasks:
            try:
                similar_products = await task
                recommendations[ingredient] = similar_products
            except Exception as e:
                print(f"Error getting recommendations for {ingredient}: {e}")
                recommendations[ingredient] = []
        
        # Format the response
        formatted_meal_plan = {
            "date": meal_plan.date,
            "breakfast": meal_plan.breakfast.dict(),
            "lunch": meal_plan.lunch.dict(),
            "dinner": meal_plan.dinner.dict(),
            "suggested_recipes": [recipe.dict() for recipe in meal_plan.suggested_recipes]
        }
        
        return {
            "status": "success",
            "meal_plan": formatted_meal_plan,
            "shopping_suggestions": {
                "missing_ingredients": missing_ingredients,
                "recommendations": recommendations
            }
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error with smart meal planner: {str(e)}")
@app.post("/enhanced_smart_shopping_list/", response_model=dict)
async def enhanced_smart_shopping_list(data: dict = Body(...)):
    """ 
    Generate an enhanced smart shopping list based on:
    1. Predicted consumption trends
    2. Current inventory (provided in request)
    3. Today's meal plan requirements
    4. Similar product recommendations
    
    Example curl:
    curl -X POST "http://localhost:8000/enhanced_smart_shopping_list/" 
         -H "Content-Type: application/json" 
         -d '{
             "inventory": [
                 {"item_name": "Rice", "quantity": 500, "unit": "g", "expiry_date": "2025-04-01"},
                 {"item_name": "Tomatoes", "quantity": 5, "unit": "pieces", "expiry_date": "2025-03-20"}
             ]
         }'
    """
    try:
        # Part 1: Process existing consumption data
        df = load_data()
        df["date_consumed"] = pd.to_datetime(df["date_consumed"], errors='coerce')
        df = df.sort_values(["item_name", "date_consumed"])

        # Extract inventory from request
        inventory = data.get("inventory", [])
        inventory_dict = {item["item_name"].lower(): item for item in inventory}
        
        shopping_list = []
        recommendation_tasks = []
        items_to_recommend = []
        
        # Process consumption data and identify items running low
        for item_name, group in df.groupby("item_name"):
            if len(group) < 3:
                continue

            group["date_diff"] = group["date_consumed"].diff().dt.days
            group["date_diff"] = group["date_diff"].replace(0, 1).fillna(1)
            group["daily_usage"] = group["quantity_used"] / group["date_diff"]

            group["daily_usage"] = group["daily_usage"].replace([float('inf'), -float('inf')], None).dropna()
            if group["daily_usage"].isna().all():
                continue

            avg_daily_usage = group["daily_usage"].mean()
            remaining_stock = group.iloc[-1]["remaining_stock"]

            # Update remaining stock if item is in the provided inventory
            inventory_item = inventory_dict.get(item_name.lower())
            if inventory_item:
                # If item is in inventory, use that quantity instead
                remaining_stock = inventory_item["quantity"]

            if avg_daily_usage <= 0:
                continue

            days_until_empty = remaining_stock / avg_daily_usage
            expiry_date = datetime.now() + timedelta(days=days_until_empty)

            if days_until_empty < 7:  # Changed threshold to 7 days
                items_to_recommend.append(item_name)
                
                shopping_list.append({
                    "item_name": item_name,
                    "refill_by": expiry_date.strftime('%Y-%m-%d'),
                    "remaining_stock": remaining_stock,
                    "daily_usage": round(avg_daily_usage, 2),
                    "days_left": round(days_until_empty, 1),
                    "suggested_similar_items": [],  # Will be filled later
                    "source": "consumption_prediction"
                })
        
        # Part 2: Process today's meal plan and find missing ingredients
        try:
            # Get the latest meal plan
            meal_plans = load_previous_meal_plans()
            latest_meal_plan = meal_plans[-1] if meal_plans else None
            
            if latest_meal_plan:
                # Check if the meal plan is for today
                plan_date = datetime.strptime(latest_meal_plan["date"], "%Y-%m-%d").date()
                today = datetime.now().date()
                
                if plan_date == today:
                    # Extract ingredients from all meals
                    required_ingredients = set()
                    
                    for meal_type in ["breakfast", "lunch", "dinner"]:
                        if meal_type in latest_meal_plan:
                            meal = latest_meal_plan[meal_type]
                            for ingredient in meal.get("ingredients", []):
                                # Extract ingredient name without quantity
                                parts = ingredient.split(" ", 1)
                                if len(parts) > 1 and (parts[0].isdigit() or any(char.isdigit() for char in parts[0])):
                                    ingredient_name = parts[1]
                                else:
                                    ingredient_name = ingredient
                                
                                # Clean up ingredient name
                                for suffix in [", chopped", ", diced", ", sliced", ", minced"]:
                                    if suffix in ingredient_name:
                                        ingredient_name = ingredient_name.split(suffix)[0]
                                
                                required_ingredients.add(ingredient_name.strip().lower())
                    
                    # Check which ingredients are missing from inventory
                    inventory_items = {item["item_name"].lower() for item in inventory}
                    
                    # Also check against items in the consumption log
                    existing_items = {item_name.lower() for item_name in df["item_name"].unique()}
                    available_items = inventory_items.union(existing_items)
                    
                    missing_ingredients = [ing for ing in required_ingredients 
                                          if not any(inv in ing or ing in inv for inv in available_items)]
                    
                    # Add missing ingredients to the shopping list
                    for ingredient in missing_ingredients:
                        # Check if already in shopping list
                        if not any(item["item_name"].lower() == ingredient.lower() for item in shopping_list):
                            items_to_recommend.append(ingredient.title())
                            
                            shopping_list.append({
                                "item_name": ingredient.title(),  # Capitalize for better display
                                "refill_by": today.strftime('%Y-%m-%d'),  # Needed today
                                "remaining_stock": 0,
                                "daily_usage": None,
                                "days_left": 0,  # Need immediately
                                "suggested_similar_items": [],
                                "source": "meal_plan_requirement"
                            })
        except Exception as e:
            print(f"Error processing meal plan data: {e}")
            # Continue with the rest of the function even if meal plan processing fails

        # Sort by urgency (lowest days_left first)
        shopping_list = sorted(shopping_list, key=lambda x: x["days_left"])
        
        if not shopping_list:
            return {"status": "success", "message": "All items have sufficient stock", "shopping_list": []}
            
        # Get AI recommendations for similar products in parallel
        recommendation_tasks = []
        for item_name in items_to_recommend:
            task = get_similar_products(item_name)
            recommendation_tasks.append((item_name, task))
            
        # Wait for all recommendation tasks to complete
        recommendation_results = {}
        for item_name, task in recommendation_tasks:
            try:
                similar_products = await task
                recommendation_results[item_name.lower()] = similar_products
            except Exception as e:
                print(f"Error getting recommendations for {item_name}: {e}")
                recommendation_results[item_name.lower()] = []
        
        # Update shopping list with recommendations
        for item in shopping_list:
            item_key = item["item_name"].lower()
            if item_key in recommendation_results:
                item["suggested_similar_items"] = recommendation_results[item_key]
            else:
                # Try partial matching
                for rec_key in recommendation_results:
                    if rec_key in item_key or item_key in rec_key:
                        item["suggested_similar_items"] = recommendation_results[rec_key]
                        break
        
        # Add related items based on similar product recommendations
        related_items = set()
        for item in shopping_list:
            for similar_item in item["suggested_similar_items"]:
                related_items.add(similar_item.lower())
        
        # Check if any recommended/similar items are missing from the shopping list
        for related_item in related_items:
            # Skip if already on the list
            if any(item["item_name"].lower() == related_item for item in shopping_list):
                continue
                
            # Check if in inventory with sufficient quantity
            in_inventory = False
            for inv_item in inventory:
                if inv_item["item_name"].lower() == related_item:
                    in_inventory = True
                    break
                    
            if not in_inventory:
                # Add as a suggested complementary item
                shopping_list.append({
                    "item_name": related_item.title(),
                    "refill_by": None,
                    "remaining_stock": None,
                    "daily_usage": None,
                    "days_left": None,
                    "suggested_similar_items": [],
                    "source": "complementary_suggestion"
                })
        
        # Categorize items
        urgent_items = [item for item in shopping_list if item.get("days_left", 0) is not None and item.get("days_left", 0) <= 2]
        meal_plan_items = [item for item in shopping_list if item.get("source") == "meal_plan_requirement"]
        complementary_items = [item for item in shopping_list if item.get("source") == "complementary_suggestion"]
        other_items = [item for item in shopping_list if item not in urgent_items and item not in meal_plan_items and item not in complementary_items]
        
        return {
            "status": "success", 
            "shopping_list": {
                "urgent_items": urgent_items,
                "meal_plan_items": meal_plan_items,
                "other_items": other_items,
                "complementary_suggestions": complementary_items
            },
            "total_items": len(shopping_list)
        }
        
    except Exception as e:
        print(f"Error generating enhanced shopping list: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating enhanced shopping list: {str(e)}")
# Add a dashboard data endpoint to combine inventory, consumption, and meal planning data
@app.get("/kitchen_dashboard/", response_model=dict)
async def kitchen_dashboard():
    """
    Get combined data for a kitchen dashboard, including inventory status,
    consumption predictions, and the latest meal plan
    
    Example curl:
    curl -X GET "http://localhost:8000/kitchen_dashboard/"
    """
    try:
        # Get inventory items
        df = load_data()
        
        # Get unique items and their latest status
        items_data = []
        for item_name, group in df.groupby("item_name"):
            latest = group.sort_values(by="date_consumed", ascending=True).iloc[-1]

            # latest = group.sort_values("date_consumed").iloc[-1]
            
            # Calculate consumption prediction
            prediction = None
            try:
                group["date_consumed"] = pd.to_datetime(group["date_consumed"])
                group = group.sort_values("date_consumed")
                
                if len(group) >= 3:  # Need at least 3 data points for prediction
                    group["date_diff"] = group["date_consumed"].diff().dt.days
                    group["date_diff"] = group["date_diff"].replace(0, 1).fillna(1)
                    group["daily_usage"] = group["quantity_used"] / group["date_diff"]
                    
                    avg_daily_usage = group["daily_usage"].mean()
                    remaining_stock = latest["remaining_stock"]
                    
                    if avg_daily_usage > 0 and remaining_stock > 0:
                        days_until_empty = remaining_stock / avg_daily_usage
                        refill_date = datetime.now() + timedelta(days=days_until_empty)
                        
                        prediction = {
                            "days_until_empty": round(days_until_empty, 1),
                            "refill_date": refill_date.strftime('%Y-%m-%d')
                        }
            except Exception as e:
                print(f"Error calculating prediction for {item_name}: {e}")
            
            items_data.append({
                "item_name": item_name,
                "remaining_stock": latest["remaining_stock"],
                "last_used": pd.to_datetime(latest["date_consumed"]).strftime('%Y-%m-%d'),
                "prediction": prediction
            })
        
        # Sort by urgency (items with predictions first, then by days_until_empty)
        items_data.sort(key=lambda x: x["prediction"]["days_until_empty"] if x["prediction"] else float('inf'))
        
        # Get the latest meal plan
        try:
            meal_plans = load_previous_meal_plans()
            latest_meal_plan = meal_plans[-1] if meal_plans else None
        except Exception:
            latest_meal_plan = None
            
        # Format the response
        dashboard_data = {
            "status": "success",
            "inventory_status": {
                "total_items": len(items_data),
                "items_running_low": sum(1 for item in items_data if item["prediction"] and item["prediction"]["days_until_empty"] < 7),
                "inventory_details": items_data[:10]  # Top 10 items by urgency
            },
            "latest_meal_plan": latest_meal_plan
        }
        
        return dashboard_data
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error generating dashboard data: {str(e)}")
if __name__ == "__main__":
    import uvicorn
    print("Starting Smart Kitchen Inventory API...")
    uvicorn.run(app, host="0.0.0.0", port=8000)