
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Plus,
  ChefHat,
  ShoppingCart,
  Check
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface Meal {
  id: string;
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  name: string;
  ingredients: string[];
  missingIngredients: number;
}

interface RecipeSuggestion {
  id: string;
  name: string;
  ingredients: string[];
  image?: string;
}

const weeklyMeals: Meal[] = [
  {
    id: '1',
    day: 'Monday',
    mealType: 'Dinner',
    name: 'Spinach and Chicken Salad',
    ingredients: ['Chicken Breast', 'Spinach', 'Tomatoes', 'Olive Oil'],
    missingIngredients: 1
  },
  {
    id: '2',
    day: 'Tuesday',
    mealType: 'Lunch',
    name: 'Rice Bowl with Vegetables',
    ingredients: ['Rice', 'Bell Peppers', 'Zucchini', 'Soy Sauce'],
    missingIngredients: 3
  },
  {
    id: '3',
    day: 'Wednesday',
    mealType: 'Breakfast',
    name: 'Scrambled Eggs with Toast',
    ingredients: ['Eggs', 'Bread', 'Butter', 'Salt', 'Pepper'],
    missingIngredients: 3
  }
];

const recipeSuggestions: RecipeSuggestion[] = [
  {
    id: '1',
    name: 'Spinach and Egg Breakfast Bowl',
    ingredients: ['Eggs', 'Spinach'],
    image: 'https://placehold.co/300x200'
  },
  {
    id: '2',
    name: 'Tomato and Chicken Pasta',
    ingredients: ['Chicken Breast', 'Tomatoes'],
    image: 'https://placehold.co/300x200'
  },
  {
    id: '3',
    name: 'Apple Cinnamon Oatmeal',
    ingredients: ['Apples'],
    image: 'https://placehold.co/300x200'
  }
];

const MealPlanning = () => {
  const [dietaryPreferences, setDietaryPreferences] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false
  });

  const handlePreferenceChange = (preference: keyof typeof dietaryPreferences) => {
    setDietaryPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
  };

  return (
    <div className="page-container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Meal Planning</h1>
        <p className="text-muted-foreground mt-1">
          Plan your meals and get recommendations based on your inventory
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Weekly Meal Plan</h2>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Meal
                </Button>
              </div>
              
              <div className="divide-y">
                {weeklyMeals.map(meal => (
                  <div key={meal.id} className="p-4">
                    <div className="mb-2">
                      <h3 className="font-bold">{meal.day}</h3>
                      <p className="text-sm text-muted-foreground">{meal.mealType}</p>
                    </div>
                    
                    <div className="mb-3">
                      <h4 className="font-semibold text-lg">{meal.name}</h4>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {meal.ingredients.map((ingredient, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                    
                    {meal.missingIngredients > 0 && (
                      <p className="text-sm text-amber-600 mb-3">
                        {meal.missingIngredients} ingredient(s) missing
                      </p>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <ChefHat className="h-4 w-4 mr-1" />
                        View Recipe
                      </Button>
                      <Button variant="outline" size="sm">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Shopping List
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Recipe Suggestions</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your inventory, here are some recipes you can make:
                </p>
              </div>
              
              <div className="divide-y">
                {recipeSuggestions.map(recipe => (
                  <div key={recipe.id} className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{recipe.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Uses: {recipe.ingredients.join(', ')}
                    </p>
                    <Button variant="outline" size="sm" className="w-full text-primary">
                      View Recipe
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-4">Dietary Preferences</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="vegetarian" 
                    checked={dietaryPreferences.vegetarian}
                    onCheckedChange={() => handlePreferenceChange('vegetarian')}
                  />
                  <label
                    htmlFor="vegetarian"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Vegetarian
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="vegan" 
                    checked={dietaryPreferences.vegan}
                    onCheckedChange={() => handlePreferenceChange('vegan')}
                  />
                  <label
                    htmlFor="vegan"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Vegan
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="glutenFree" 
                    checked={dietaryPreferences.glutenFree}
                    onCheckedChange={() => handlePreferenceChange('glutenFree')}
                  />
                  <label
                    htmlFor="glutenFree"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Gluten-Free
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MealPlanning;
