from fastapi import FastAPI, HTTPException, Depends, Body
from pydantic import BaseModel
import pandas as pd
import os
from datetime import datetime, timedelta
import json
from typing import List, Dict, Optional, Any
import asyncio
from moya.conversation.thread import Thread
from moya.tools.base_tool import BaseTool
from moya.tools.ephemeral_memory import EphemeralMemory
from moya.tools.tool_registry import ToolRegistry
from moya.registry.agent_registry import AgentRegistry
from moya.orchestrators.simple_orchestrator import SimpleOrchestrator
from moya.agents.azure_openai_agent import AzureOpenAIAgent, AzureOpenAIAgentConfig

# New models for meal planning
class InventoryItem(BaseModel):
    item_name: str
    quantity: float
    unit: str
    expiry_date: Optional[str] = None


class DietaryPreference(BaseModel):
    preference_type: str  # vegetarian, vegan, gluten-free, etc.
    avoid_ingredients: List[str] = []
    preferred_ingredients: List[str] = []
    calorie_target: Optional[int] = None


class MealPlanRequest(BaseModel):
    dietary_preferences: DietaryPreference
    inventory: List[InventoryItem]
    meal_date: Optional[str] = None  # Default to today if not provided


class RecipeDetails(BaseModel):
    name: str
    ingredients: List[str]
    instructions: List[str]
    dietary_tags: List[str] = []
    prep_time: Optional[int] = None  # minutes
    calories: Optional[int] = None


class MealPlan(BaseModel):
    date: str
    breakfast: RecipeDetails
    lunch: RecipeDetails 
    dinner: RecipeDetails
    suggested_recipes: List[RecipeDetails] = []


# Store for previous meal plans
MEAL_PLANS_FILE = "data/meal_plans.json"

# Ensure meal plans file exists
if not os.path.exists(MEAL_PLANS_FILE):
    os.makedirs(os.path.dirname(MEAL_PLANS_FILE), exist_ok=True)
    with open(MEAL_PLANS_FILE, 'w') as f:
        json.dump([], f)


def get_meal_planning_orchestrator():
    """Get or create meal planning AI orchestrator singleton"""
    if not hasattr(get_meal_planning_orchestrator, "instance") or get_meal_planning_orchestrator.instance is None:
        try:
            # Reuse the same environment variables from the existing agent
            api_key = os.environ.get("AZURE_OPENAI_API_KEY")
            api_base = os.environ.get("AZURE_OPENAI_ENDPOINT")
            api_version = os.environ.get("AZURE_OPENAI_API_VERSION", "2023-12-01-preview")
            
            if not api_key or not api_base:
                raise ValueError("Azure OpenAI environment variables are required")
            
            tool_registry = ToolRegistry()
            EphemeralMemory.configure_memory_tools(tool_registry)
            
            agent_config = AzureOpenAIAgentConfig(
                agent_name="meal_planning_agent",
                description="AI agent for meal planning based on inventory and dietary preferences",
                model_name="gpt-4o",
                agent_type="ChatAgent",
                tool_registry=tool_registry,
                system_prompt="""
    You are an expert meal planning assistant that creates personalized meal plans.
    
    You will receive:
    1. A list of inventory items with quantities and expiry dates
    2. Dietary preferences and restrictions
    3. Consumption history data from a CSV
    
    Your task is to create a full day's meal plan with breakfast, lunch, and dinner that:
    - Prioritizes using ingredients that will expire soon
    - Respects all dietary preferences and restrictions
    - Creates balanced, nutritious meals
    - Varies from previous meal suggestions when possible
    
    For each meal, provide:
    - Recipe name (use "name" field)
    - List of ingredients as simple strings (e.g., "2 cups rice", "3 eggs")
    - Step-by-step cooking instructions
    - Any dietary tags (vegetarian, vegan, etc.)
    - Estimated preparation time (as a number in minutes only)
    - Approximate calorie count (when possible)
    
    Also suggest 2-3 alternative recipe ideas based on the available ingredients.
    
    Format your response as a structured JSON with the keys: breakfast, lunch, dinner, and suggested_recipes.
    
    IMPORTANT: Follow these format requirements:
    1. Use "name" (not "recipe_name") for the recipe name
    2. "ingredients" should be an array of strings, not objects
    3. "prep_time" should be an integer number of minutes (without the word "minutes")
    4. "instructions" should be an array of strings
    5. "dietary_tags" should be an array of strings
""",
                api_key=api_key,
                api_base=api_base,
                api_version=api_version,
            )

            agent = AzureOpenAIAgent(config=agent_config)
            agent_registry = AgentRegistry()
            agent_registry.register_agent(agent)

            orchestrator = SimpleOrchestrator(agent_registry=agent_registry, default_agent_name="meal_planning_agent")
            get_meal_planning_orchestrator.instance = orchestrator
            print("Meal planning AI engine initialized successfully")
        except Exception as e:
            print(f"Error initializing meal planning AI agent: {e}")
            import traceback
            traceback.print_exc()
            get_meal_planning_orchestrator.instance = None
    
    return get_meal_planning_orchestrator.instance


def load_consumption_data():
    """Load consumption data from CSV"""
    try:
        CSV_FILE = "data/consumption_log.csv"
        df = pd.read_csv(CSV_FILE)
        # Handle date parsing more flexibly
        df["date_consumed"] = pd.to_datetime(df["date_consumed"], errors='coerce')
        return df
    except Exception as e:
        print(f"Error loading consumption data: {e}")
        # Return empty DataFrame with correct columns
        return pd.DataFrame(columns=["item_name", "date_consumed", "quantity_used", "remaining_stock"])
def parse_date_safely(date_string):
    """Parse date strings safely handling various formats"""
    if not date_string:
        return None
        
    try:
        # Try different date parsing approaches
        formats_to_try = [
            "%Y-%m-%d",
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%m/%d/%Y",
            "%d/%m/%Y"
        ]
        
        for fmt in formats_to_try:
            try:
                return datetime.strptime(date_string, fmt)
            except ValueError:
                continue
                
        # If none of the formats worked, try pandas' flexible parser
        return pd.to_datetime(date_string).to_pydatetime()
    except Exception as e:
        print(f"Error parsing date '{date_string}': {e}")
        return None

def get_consumption_patterns():
    """Analyze consumption patterns from the consumption log"""
    df = load_consumption_data()
    patterns = {}
    
    # Group by item and calculate usage patterns
    for item_name, group in df.groupby("item_name"):
        group = group.sort_values("date_consumed")
        
        if len(group) >= 2:
            # Calculate average consumption frequency (days between uses)
            group["date_consumed"] = pd.to_datetime(group["date_consumed"])
            date_diffs = group["date_consumed"].diff().dt.days.dropna()
            
            if not date_diffs.empty:
                avg_frequency = date_diffs.mean()
                last_used = group["date_consumed"].max()
                avg_quantity = group["quantity_used"].mean()
                
                patterns[item_name] = {
                    "avg_frequency_days": round(avg_frequency, 1),
                    "last_used": last_used.strftime("%Y-%m-%d"),
                    "avg_quantity": round(avg_quantity, 2),
                    "days_since_last_use": (datetime.now() - last_used).days
                }
    
    return patterns


def load_previous_meal_plans():
    """Load previously suggested meal plans"""
    try:
        with open(MEAL_PLANS_FILE, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading previous meal plans: {e}")
        return []


def save_meal_plan(meal_plan):
    """Save a meal plan to the history"""
    try:
        plans = load_previous_meal_plans()
        
        # Convert to dict for storage
        plan_dict = {
            "date": meal_plan.date,
            "breakfast": meal_plan.breakfast.dict(),
            "lunch": meal_plan.lunch.dict(),
            "dinner": meal_plan.dinner.dict(),
            "suggested_recipes": [recipe.dict() for recipe in meal_plan.suggested_recipes]
        }
        
        # Add to history, keeping only the last 10 meal plans
        plans.append(plan_dict)
        if len(plans) > 10:
            plans = plans[-10:]
            
        with open(MEAL_PLANS_FILE, 'w') as f:
            json.dump(plans, f, indent=2)
            
        return True
    except Exception as e:
        print(f"Error saving meal plan: {e}")
        return False


async def generate_meal_plan(request: MealPlanRequest) -> MealPlan:
    """Generate a meal plan using the AI orchestrator"""
    orchestrator = get_meal_planning_orchestrator()
    
    if not orchestrator:
        raise ValueError("Meal planning AI engine not available")
    
    # Get consumption patterns
    consumption_patterns = get_consumption_patterns()
    
    # Get previous meal plans
    previous_plans = load_previous_meal_plans()
    recent_recipes = []
    
    # Extract recent recipe names to avoid repetition
    for plan in previous_plans[-3:]:  # Last 3 plans
        if "breakfast" in plan:
            recent_recipes.append(plan["breakfast"]["name"])
        if "lunch" in plan:
            recent_recipes.append(plan["lunch"]["name"])
        if "dinner" in plan:
            recent_recipes.append(plan["dinner"]["name"])
    
    # Prepare the prompt with all necessary information
    meal_date = request.meal_date or datetime.now().strftime("%Y-%m-%d")
    
    # Identify soon-to-expire items
    soon_to_expire = []
    # With this:
    for item in request.inventory:
        if item.expiry_date:
            try:
                expiry = parse_date_safely(item.expiry_date)
                if expiry:
                    days_to_expiry = (expiry - datetime.now()).days
                    if days_to_expiry <= 3:  # Items expiring in 3 days or less
                        soon_to_expire.append(f"{item.item_name} (expires in {days_to_expiry} days)")
            except ValueError:
                pass
    
    prompt = f"""
    Create a meal plan for {meal_date} with breakfast, lunch, and dinner based on the following information:

    DIETARY PREFERENCES:
    Type: {request.dietary_preferences.preference_type}
    Avoid ingredients: {', '.join(request.dietary_preferences.avoid_ingredients)}
    Preferred ingredients: {', '.join(request.dietary_preferences.preferred_ingredients)}
    Calorie target: {request.dietary_preferences.calorie_target or 'Not specified'}

    AVAILABLE INVENTORY:
    {json.dumps([item.dict() for item in request.inventory], indent=2)}

    SOON-TO-EXPIRE ITEMS (prioritize using these):
    {', '.join(soon_to_expire) if soon_to_expire else 'None'}

    CONSUMPTION PATTERNS:
    {json.dumps(consumption_patterns, indent=2)}

    RECENTLY SUGGESTED RECIPES (avoid repetition):
    {', '.join(recent_recipes)}

    Please provide a complete meal plan with breakfast, lunch, and dinner recipes.
    For each recipe, include a name, ingredients list, cooking instructions, dietary tags, prep time, and calories.
    Also suggest 2-3 additional recipes based on the available ingredients.

    Return your response in JSON format.
    """
    
    try:
        # Generate response from AI
        response = orchestrator.orchestrate(
            thread_id=f"meal_plan_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            user_message=prompt
        )
        
        # Parse JSON response
        try:
            plan_data = json.loads(response)
        except json.JSONDecodeError:
            # If the response isn't valid JSON, try to extract JSON content
            import re
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', response)
            if json_match:
                plan_data = json.loads(json_match.group(1))
            else:
                raise ValueError("Could not parse AI response as JSON")
        
        # Transform the data to match the RecipeDetails model format
        def transform_recipe_data(recipe_data):
            # Handle the name field
            if "recipe_name" in recipe_data and "name" not in recipe_data:
                recipe_data["name"] = recipe_data.pop("recipe_name")
            
            # Handle ingredients as objects
            if "ingredients" in recipe_data and recipe_data["ingredients"] and isinstance(recipe_data["ingredients"][0], dict):
                transformed_ingredients = []
                for ing in recipe_data["ingredients"]:
                    if isinstance(ing, dict):
                        # Format ingredient as string
                        item_name = ing.get("item_name", "")
                        quantity = ing.get("quantity", "")
                        unit = ing.get("unit", "")
                        ingredient_str = f"{quantity} {unit} {item_name}".strip()
                        transformed_ingredients.append(ingredient_str)
                    else:
                        transformed_ingredients.append(ing)
                recipe_data["ingredients"] = transformed_ingredients
            
            # Handle prep_time field
            if "prep_time" in recipe_data and isinstance(recipe_data["prep_time"], str):
                # Extract the numeric part from strings like "15 minutes"
                import re
                match = re.search(r'(\d+)', recipe_data["prep_time"])
                if match:
                    recipe_data["prep_time"] = int(match.group(1))
                else:
                    recipe_data["prep_time"] = None
            
            return recipe_data
        
        # Transform all recipe data
        for meal_type in ["breakfast", "lunch", "dinner"]:
            if meal_type in plan_data:
                plan_data[meal_type] = transform_recipe_data(plan_data[meal_type])
        
        if "suggested_recipes" in plan_data and isinstance(plan_data["suggested_recipes"], list):
            plan_data["suggested_recipes"] = [transform_recipe_data(recipe) for recipe in plan_data["suggested_recipes"]]
        
        # Convert to MealPlan object
        breakfast = RecipeDetails(**plan_data["breakfast"])
        lunch = RecipeDetails(**plan_data["lunch"])
        dinner = RecipeDetails(**plan_data["dinner"])
        
        suggested_recipes = []
        if "suggested_recipes" in plan_data and isinstance(plan_data["suggested_recipes"], list):
            for recipe_data in plan_data["suggested_recipes"]:
                if isinstance(recipe_data, dict):  # Ensure recipe_data is a dictionary
                    suggested_recipes.append(RecipeDetails(**recipe_data))
                else:
                    print(f"Skipping invalid recipe_data: {recipe_data}")
             
        
        meal_plan = MealPlan(
            date=meal_date,
            breakfast=breakfast,
            lunch=lunch,
            dinner=dinner,
            suggested_recipes=suggested_recipes
        )
        
        # Save the meal plan
        save_meal_plan(meal_plan)
        
        return meal_plan
    except Exception as e:
        print(f"Error generating meal plan: {e}")
        import traceback
        traceback.print_exc()
        raise ValueError(f"Failed to generate meal plan: {str(e)}")


# Add this endpoint to your FastAPI app
def register_meal_planning_endpoints(app):
    @app.post("/generate_meal_plan/", response_model=MealPlan)
    async def create_meal_plan(request: MealPlanRequest = Body(...)):
        """
        Generate a meal plan based on dietary preferences and inventory
        
        Example curl:
        curl -X POST "http://localhost:8000/generate_meal_plan/" 
             -H "Content-Type: application/json" 
             -d '{
                 "dietary_preferences": {
                     "preference_type": "vegetarian",
                     "avoid_ingredients": ["nuts", "dairy"],
                     "preferred_ingredients": ["vegetables", "legumes"],
                     "calorie_target": 2000
                 },
                 "inventory": [
                     {"item_name": "Rice", "quantity": 500, "unit": "g", "expiry_date": "2025-04-01"},
                     {"item_name": "Tomatoes", "quantity": 5, "unit": "pieces", "expiry_date": "2025-03-20"}
                 ]
             }'
        """
        try:
            meal_plan = await generate_meal_plan(request)
            return meal_plan
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating meal plan: {str(e)}")

    @app.get("/get_previous_meal_plans/", response_model=List[Dict[str, Any]])
    async def get_previous_plans():
        """
        Get previously generated meal plans
        
        Example curl:
        curl -X GET "http://localhost:8000/get_previous_meal_plans/"
        """
        try:
            plans = load_previous_meal_plans()
            return plans
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error retrieving previous meal plans: {str(e)}")
            
# Add the following line to the app's startup event
# register_meal_planning_endpoints(app)