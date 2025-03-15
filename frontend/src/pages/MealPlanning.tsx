import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Plus,
  ChefHat,
  ShoppingCart,
  Check,
  MoreVertical,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface Meal {
  id: string;
  day: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner';
  name: string;
  ingredients: string[];
  missingIngredients: number;
}

interface MealWithQuantity extends Meal {
  quantities: Record<string, { amount: number; unit: string }>;
}

interface RecipeSuggestion {
  id: string;
  name: string;
  ingredients: string[];
  image?: string;
}

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price?: number;
}

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price?: number;
  checked: boolean;
}

const initialWeeklyMeals: MealWithQuantity[] = [
  {
    id: '1',
    day: 'Monday',
    mealType: 'Dinner',
    name: 'Spinach and Chicken Salad',
    ingredients: ['Chicken Breast', 'Spinach', 'Tomatoes', 'Olive Oil'],
    missingIngredients: 1,
    quantities: {
      'Chicken Breast': { amount: 250, unit: 'g' },
      'Spinach': { amount: 100, unit: 'g' },
      'Tomatoes': { amount: 2, unit: 'pcs' },
      'Olive Oil': { amount: 15, unit: 'ml' }
    }
  },
  {
    id: '2',
    day: 'Tuesday',
    mealType: 'Lunch',
    name: 'Rice Bowl with Vegetables',
    ingredients: ['Rice', 'Bell Peppers', 'Zucchini', 'Soy Sauce'],
    missingIngredients: 3,
    quantities: {
      'Rice': { amount: 200, unit: 'g' },
      'Bell Peppers': { amount: 1, unit: 'pcs' },
      'Zucchini': { amount: 1, unit: 'pcs' },
      'Soy Sauce': { amount: 20, unit: 'ml' }
    }
  },
  {
    id: '3',
    day: 'Wednesday',
    mealType: 'Breakfast',
    name: 'Scrambled Eggs with Toast',
    ingredients: ['Eggs', 'Bread', 'Butter', 'Salt', 'Pepper'],
    missingIngredients: 3,
    quantities: {
      'Eggs': { amount: 3, unit: 'pcs' },
      'Bread': { amount: 2, unit: 'pcs' },
      'Butter': { amount: 10, unit: 'g' },
      'Salt': { amount: 2, unit: 'g' },
      'Pepper': { amount: 1, unit: 'g' }
    }
  }
];

const initialRecipeSuggestions: RecipeSuggestion[] = [
  {
    id: '1',
    name: 'Spinach and Egg Breakfast Bowl',
    ingredients: ['Eggs', 'Spinach'],
    image: '/api/placeholder/300/200'
  },
  {
    id: '2',
    name: 'Tomato and Chicken Curry',
    ingredients: ['Chicken Breast', 'Tomatoes'],
    image: '/api/placeholder/300/200'
  },
  {
    id: '3',
    name: 'Apple Cinnamon Oatmeal',
    ingredients: ['Apples'],
    image: '/api/placeholder/300/200'
  }
];

// Mock shopping list (This would be stored in a central state or context in a real app)
const initialShoppingList: ShoppingListItem[] = [
  { id: '1', name: 'Milk', quantity: 500, unit: 'ml', price: 30, checked: false },
  { id: '2', name: 'Onions', quantity: 1, unit: 'kg', price: 40, checked: false }
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

const MealPlanning = () => {
  const [weeklyMeals, setWeeklyMeals] = useState<MealWithQuantity[]>(initialWeeklyMeals);
  const [recipeSuggestions, setRecipeSuggestions] = useState<RecipeSuggestion[]>(initialRecipeSuggestions);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(initialShoppingList);
  const [newMeal, setNewMeal] = useState<{
    day: string;
    mealType: 'Breakfast' | 'Lunch' | 'Dinner';
    name: string;
    ingredients: {name: string; quantity: number; unit: string}[];
  }>({
    day: 'Monday',
    mealType: 'Dinner',
    name: '',
    ingredients: [{name: '', quantity: 0, unit: 'g'}]
  });
  const [addMealDialogOpen, setAddMealDialogOpen] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [viewRecipe, setViewRecipe] = useState<MealWithQuantity | null>(null);
  
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

  // Add a new meal
  const handleAddMeal = () => {
    const quantities: Record<string, { amount: number; unit: string }> = {};
    
    newMeal.ingredients.forEach(ingredient => {
      if (ingredient.name.trim()) {
        quantities[ingredient.name] = {
          amount: ingredient.quantity,
          unit: ingredient.unit
        };
      }
    });

    const ingredientNames = newMeal.ingredients
      .map(ing => ing.name)
      .filter(name => name.trim() !== '');

    const newMealWithId: MealWithQuantity = {
      id: Date.now().toString(),
      day: newMeal.day,
      mealType: newMeal.mealType,
      name: newMeal.name,
      ingredients: ingredientNames,
      missingIngredients: Math.floor(Math.random() * 3), // Mock for demo purposes
      quantities
    };

    if (editingMealId) {
      setWeeklyMeals(prev => prev.map(meal => 
        meal.id === editingMealId ? newMealWithId : meal
      ));
    } else {
      setWeeklyMeals(prev => [...prev, newMealWithId]);
    }

    setAddMealDialogOpen(false);
    setNewMeal({
      day: 'Monday',
      mealType: 'Dinner',
      name: '',
      ingredients: [{name: '', quantity: 0, unit: 'g'}]
    });
    setEditingMealId(null);

    toast({
      title: editingMealId ? "Meal updated" : "Meal added",
      description: `${newMeal.name} has been ${editingMealId ? 'updated' : 'added'} to your meal plan.`
    });
  };

  // Delete a meal
  const handleDeleteMeal = (id: string) => {
    setWeeklyMeals(prev => prev.filter(meal => meal.id !== id));
    toast({
      title: "Meal removed",
      description: "The meal has been removed from your plan."
    });
  };

  // Edit a meal
  const handleEditMeal = (meal: MealWithQuantity) => {
    const ingredients = meal.ingredients.map(ing => ({
      name: ing,
      quantity: meal.quantities[ing]?.amount || 0,
      unit: meal.quantities[ing]?.unit || 'g'
    }));

    setNewMeal({
      day: meal.day,
      mealType: meal.mealType,
      name: meal.name,
      ingredients: ingredients.length ? ingredients : [{name: '', quantity: 0, unit: 'g'}]
    });
    
    setEditingMealId(meal.id);
    setAddMealDialogOpen(true);
  };

  // Add new ingredient field
  const addIngredientField = () => {
    setNewMeal(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, {name: '', quantity: 0, unit: 'g'}]
    }));
  };

  // Update ingredient field
  const updateIngredient = (index: number, field: string, value: string | number) => {
    setNewMeal(prev => {
      const updatedIngredients = [...prev.ingredients];
      updatedIngredients[index] = {
        ...updatedIngredients[index],
        [field]: value
      };
      return { ...prev, ingredients: updatedIngredients };
    });
  };

  // Remove ingredient field
  const removeIngredientField = (index: number) => {
    setNewMeal(prev => {
      const updatedIngredients = [...prev.ingredients];
      updatedIngredients.splice(index, 1);
      return { ...prev, ingredients: updatedIngredients.length ? updatedIngredients : [{name: '', quantity: 0, unit: 'g'}] };
    });
  };

  // Add meal ingredients to shopping list
  const addToShoppingList = (meal: MealWithQuantity) => {
    const newItems = meal.ingredients
      .filter(ing => {
        // Check if item is already in shopping list
        return !shoppingList.some(item => item.name.toLowerCase() === ing.toLowerCase());
      })
      .map(ing => ({
        id: Date.now() + ing,
        name: ing,
        quantity: meal.quantities[ing]?.amount || 1,
        unit: meal.quantities[ing]?.unit || 'pcs',
        price: undefined,
        checked: false
      }));

    if (newItems.length) {
      setShoppingList(prev => [...prev, ...newItems]);
      toast({
        title: "Added to shopping list",
        description: `${newItems.length} items from ${meal.name} added to your shopping list.`
      });
    } else {
      toast({
        title: "Nothing new to add",
        description: "All ingredients are already in your shopping list."
      });
    }
  };

  // Add a recipe suggestion to meal plan
  const addSuggestionToMealPlan = (recipe: RecipeSuggestion) => {
    setNewMeal({
      day: 'Monday',
      mealType: 'Dinner',
      name: recipe.name,
      ingredients: recipe.ingredients.map(ing => ({name: ing, quantity: 100, unit: 'g'}))
    });
    setAddMealDialogOpen(true);
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
                <Dialog open={addMealDialogOpen} onOpenChange={setAddMealDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Meal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>{editingMealId ? 'Edit Meal' : 'Add New Meal'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="day">Day</Label>
                          <Select 
                            value={newMeal.day} 
                            onValueChange={(value) => setNewMeal({...newMeal, day: value})}
                          >
                            <SelectTrigger id="day">
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              {daysOfWeek.map(day => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="mealType">Meal Type</Label>
                          <Select 
                            value={newMeal.mealType} 
                            onValueChange={(value: 'Breakfast' | 'Lunch' | 'Dinner') => 
                              setNewMeal({...newMeal, mealType: value})
                            }
                          >
                            <SelectTrigger id="mealType">
                              <SelectValue placeholder="Select meal type" />
                            </SelectTrigger>
                            <SelectContent>
                              {mealTypes.map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="mealName">Meal Name</Label>
                        <Input 
                          id="mealName" 
                          value={newMeal.name} 
                          onChange={(e) => setNewMeal({...newMeal, name: e.target.value})} 
                          placeholder="Enter meal name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                          <Label>Ingredients</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addIngredientField}
                          >
                            <Plus className="h-4 w-4 mr-1" /> Add Ingredient
                          </Button>
                        </div>
                        {newMeal.ingredients.map((ingredient, index) => (
                          <div key={index} className="grid grid-cols-5 gap-2 items-center">
                            <div className="col-span-2">
                              <Input 
                                value={ingredient.name} 
                                onChange={(e) => updateIngredient(index, 'name', e.target.value)} 
                                placeholder="Ingredient name"
                              />
                            </div>
                            <div>
                              <Input 
                                type="number" 
                                value={ingredient.quantity} 
                                onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))} 
                                placeholder="Qty"
                              />
                            </div>
                            <div>
                              <Select 
                                value={ingredient.unit} 
                                onValueChange={(value) => updateIngredient(index, 'unit', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="g">g</SelectItem>
                                  <SelectItem value="kg">kg</SelectItem>
                                  <SelectItem value="ml">ml</SelectItem>
                                  <SelectItem value="l">l</SelectItem>
                                  <SelectItem value="pcs">pcs</SelectItem>
                                  <SelectItem value="tsp">tsp</SelectItem>
                                  <SelectItem value="tbsp">tbsp</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-center">
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeIngredientField(index)}
                                disabled={newMeal.ingredients.length <= 1}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => {
                        setAddMealDialogOpen(false);
                        setEditingMealId(null);
                        setNewMeal({
                          day: 'Monday',
                          mealType: 'Dinner',
                          name: '',
                          ingredients: [{name: '', quantity: 0, unit: 'g'}]
                        });
                      }}>
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        onClick={handleAddMeal} 
                        disabled={!newMeal.name || newMeal.ingredients.every(ing => !ing.name.trim())}
                      >
                        {editingMealId ? 'Update Meal' : 'Add Meal'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="divide-y">
                {weeklyMeals.map(meal => (
                  <div key={meal.id} className="p-4">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-bold">{meal.day}</h3>
                        <p className="text-sm text-muted-foreground">{meal.mealType}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditMeal(meal)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const duplicatedMeal = {
                              ...meal,
                              id: Date.now().toString(),
                              day: daysOfWeek[(daysOfWeek.indexOf(meal.day) + 1) % 7]
                            };
                            setWeeklyMeals(prev => [...prev, duplicatedMeal]);
                            toast({
                              title: "Meal duplicated",
                              description: `${meal.name} has been duplicated for ${duplicatedMeal.day}.`
                            });
                          }}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteMeal(meal.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                          {meal.quantities[ingredient] && 
                            `(${meal.quantities[ingredient].amount}${meal.quantities[ingredient].unit})`}
                        </span>
                      ))}
                    </div>
                    
                    {meal.missingIngredients > 0 && (
                      <p className="text-sm text-amber-600 mb-3">
                        {meal.missingIngredients} ingredient(s) missing
                      </p>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setViewRecipe(meal)}>
                            <ChefHat className="h-4 w-4 mr-1" />
                            View Recipe
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{meal.name} Recipe</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <h3 className="font-semibold mb-2">Ingredients:</h3>
                            <ul className="list-disc pl-5 mb-4">
                              {meal.ingredients.map((ingredient, idx) => (
                                <li key={idx}>
                                  {ingredient} - {meal.quantities[ingredient]?.amount || 0} 
                                  {meal.quantities[ingredient]?.unit || 'g'}
                                </li>
                              ))}
                            </ul>
                            <h3 className="font-semibold mb-2">Steps:</h3>
                            <ol className="list-decimal pl-5">
                              <li className="mb-2">This is a placeholder for recipe steps.</li>
                              <li className="mb-2">In a real application, this would contain actual recipe instructions.</li>
                              <li className="mb-2">The steps would be fetched from a database or API.</li>
                            </ol>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => addToShoppingList(meal)}>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add to Shopping List
                      </Button>
                    </div>
                  </div>
                ))}
                {weeklyMeals.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No meals planned yet. Click 'Add Meal' to get started.</p>
                  </div>
                )}
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
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="flex-1">
                            <ChefHat className="h-4 w-4 mr-1" />
                            View Recipe
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{recipe.name} Recipe</DialogTitle>
                          </DialogHeader>
                          <div className="mt-4">
                            <h3 className="font-semibold mb-2">Ingredients:</h3>
                            <ul className="list-disc pl-5 mb-4">
                              {recipe.ingredients.map((ingredient, idx) => (
                                <li key={idx}>{ingredient}</li>
                              ))}
                            </ul>
                            <h3 className="font-semibold mb-2">Steps:</h3>
                            <ol className="list-decimal pl-5">
                              <li className="mb-2">This is a placeholder for recipe steps.</li>
                              <li className="mb-2">In a real application, this would contain actual recipe instructions.</li>
                              <li className="mb-2">The steps would be fetched from a database or API.</li>
                            </ol>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 text-primary"
                        onClick={() => addSuggestionToMealPlan(recipe)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Plan
                      </Button>
                    </div>
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