
import React, { useState } from 'react';
import GlassCard from '../components/ui-elements/GlassCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Utensils, 
  Plus, 
  Clock, 
  Save,
  ChefHat,
  ArrowRight,
  BookText,
  Sparkles
} from 'lucide-react';

interface MealPlan {
  day: string;
  date: string;
  meals: {
    type: 'breakfast' | 'lunch' | 'dinner';
    name: string;
    time?: string;
    ingredients?: string[];
    completed?: boolean;
  }[];
}

const weeklyPlan: MealPlan[] = [
  {
    day: 'Monday',
    date: 'Aug 7',
    meals: [
      { type: 'breakfast', name: 'Oatmeal with Berries', time: '8:00 AM', completed: true },
      { type: 'lunch', name: 'Chicken Salad Wrap', time: '12:30 PM', completed: true },
      { type: 'dinner', name: 'Pasta Primavera', time: '7:00 PM', completed: false },
    ],
  },
  {
    day: 'Tuesday',
    date: 'Aug 8',
    meals: [
      { type: 'breakfast', name: 'Yogurt with Granola', time: '8:00 AM', completed: true },
      { type: 'lunch', name: 'Turkey Sandwich', time: '12:30 PM', completed: true },
      { type: 'dinner', name: 'Chicken Stir Fry', time: '7:00 PM', completed: false },
    ],
  },
  {
    day: 'Wednesday',
    date: 'Aug 9',
    meals: [
      { type: 'breakfast', name: 'Smoothie Bowl', time: '8:00 AM', completed: false },
      { type: 'lunch', name: 'Quinoa Salad', time: '12:30 PM', completed: false },
      { type: 'dinner', name: 'Fish Tacos', time: '7:00 PM', completed: false },
    ],
  },
  {
    day: 'Thursday',
    date: 'Aug 10',
    meals: [
      { type: 'breakfast', name: 'Avocado Toast', time: '8:00 AM', completed: false },
      { type: 'lunch', name: 'Vegetable Soup', time: '12:30 PM', completed: false },
      { type: 'dinner', name: 'Grilled Salmon', time: '7:00 PM', completed: false },
    ],
  },
  {
    day: 'Friday',
    date: 'Aug 11',
    meals: [
      { type: 'breakfast', name: 'Cereal with Milk', time: '8:00 AM', completed: false },
      { type: 'lunch', name: 'Cobb Salad', time: '12:30 PM', completed: false },
      { type: 'dinner', name: 'Pizza Night', time: '7:00 PM', completed: false },
    ],
  },
  {
    day: 'Saturday',
    date: 'Aug 12',
    meals: [
      { type: 'breakfast', name: 'Pancakes', time: '9:00 AM', completed: false },
      { type: 'lunch', name: 'Grilled Cheese', time: '1:00 PM', completed: false },
      { type: 'dinner', name: 'Beef Stew', time: '7:00 PM', completed: false },
    ],
  },
  {
    day: 'Sunday',
    date: 'Aug 13',
    meals: [
      { type: 'breakfast', name: 'Eggs Benedict', time: '9:00 AM', completed: false },
      { type: 'lunch', name: 'Roast Chicken', time: '1:00 PM', completed: false },
      { type: 'dinner', name: 'Spaghetti Carbonara', time: '7:00 PM', completed: false },
    ],
  },
];

const recipeRecommendations = [
  {
    name: 'Chicken Stir Fry',
    ingredients: ['Chicken breast', 'Bell peppers', 'Broccoli', 'Soy sauce', 'Ginger'],
    cookTime: '25 mins',
    dietaryTags: ['High Protein', 'Low Carb'],
    image: 'https://placehold.co/300x200',
    nutrition: {
      calories: 380,
      protein: 32,
      carbs: 15,
    }
  },
  {
    name: 'Vegetable Frittata',
    ingredients: ['Eggs', 'Bell peppers', 'Spinach', 'Onions', 'Cheese'],
    cookTime: '20 mins',
    dietaryTags: ['Vegetarian', 'Gluten-Free'],
    image: 'https://placehold.co/300x200',
    nutrition: {
      calories: 290,
      protein: 18,
      carbs: 8,
    }
  },
  {
    name: 'Quinoa Bowl',
    ingredients: ['Quinoa', 'Avocado', 'Cherry tomatoes', 'Cucumber', 'Olive oil'],
    cookTime: '15 mins',
    dietaryTags: ['Vegan', 'Gluten-Free'],
    image: 'https://placehold.co/300x200',
    nutrition: {
      calories: 420,
      protein: 12,
      carbs: 48,
    }
  },
];

const MealPlanning = () => {
  const [selectedDate, setSelectedDate] = useState<string>(weeklyPlan[0].date);

  const weekProgress = {
    plannedMeals: 21,
    completedMeals: 4,
    percentage: (4 / 21) * 100,
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Meal Planning</h1>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">Week of August 7 - 13</h2>
          </div>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Generate Meal Plan</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            <span>Save Plan</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-8 animate-slide-in">
        {weeklyPlan.map((day) => (
          <GlassCard key={day.day} className="p-4">
            <div className="text-center mb-4">
              <h3 className="font-medium">{day.day}</h3>
              <p className="text-xs text-muted-foreground">{day.date}</p>
            </div>
            <div className="space-y-3">
              {day.meals.map((meal) => (
                <div key={meal.type} className="p-2 bg-secondary rounded-lg">
                  <p className="text-xs font-medium uppercase text-muted-foreground mb-1">
                    {meal.type} {meal.time && `• ${meal.time}`}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{meal.name}</p>
                    <div className={`w-2 h-2 rounded-full ${meal.completed ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  </div>
                </div>
              ))}
              <button className="w-full p-2 text-sm text-center text-primary hover:bg-secondary rounded-lg transition-colors">
                + Add Meal
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="mb-8">
        <GlassCard className="p-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">Weekly Progress</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {weekProgress.completedMeals} of {weekProgress.plannedMeals} meals completed
            </span>
          </div>
          <Progress value={weekProgress.percentage} className="h-2 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Calories</span>
                <span className="text-sm text-muted-foreground">1,850 / 2,000</span>
              </div>
              <Progress value={92.5} className="h-1.5 mt-2" />
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Protein</span>
                <span className="text-sm text-muted-foreground">82g / 100g</span>
              </div>
              <Progress value={82} className="h-1.5 mt-2" />
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Carbs</span>
                <span className="text-sm text-muted-foreground">210g / 250g</span>
              </div>
              <Progress value={84} className="h-1.5 mt-2" />
            </div>
          </div>
        </GlassCard>
      </div>

      <h2 className="section-title">Recipe Recommendations</h2>
      <p className="text-muted-foreground mb-4">Based on your current inventory and preferences</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-slide-in" style={{ animationDelay: '0.2s' }}>
        {recipeRecommendations.map((recipe, index) => (
          <GlassCard key={index} className="p-4">
            <div className="relative rounded-lg overflow-hidden mb-4 aspect-[3/2]">
              <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1">
                {recipe.dietaryTags.map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-background/80 backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <h3 className="font-medium text-lg mb-2 flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-primary" />
              {recipe.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{recipe.cookTime}</span>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Calories</span>
                <span className="font-medium">{recipe.nutrition.calories} kcal</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Protein</span>
                <span className="font-medium">{recipe.nutrition.protein}g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Carbs</span>
                <span className="font-medium">{recipe.nutrition.carbs}g</span>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs font-medium uppercase text-muted-foreground mb-2">Ingredients</p>
              <ul className="text-sm space-y-1">
                {recipe.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="flex-1 flex items-center justify-center gap-1">
                <BookText className="h-3 w-3" />
                <span>View Recipe</span>
              </Button>
              <Button size="sm" className="flex-1 flex items-center justify-center gap-1">
                <Plus className="h-3 w-3" />
                <span>Add to Plan</span>
              </Button>
            </div>
          </GlassCard>
        ))}
        
        <GlassCard className="flex items-center justify-center p-4">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            <span>Browse More Recipes</span>
          </Button>
        </GlassCard>
      </div>
    </div>
  );
};

export default MealPlanning;
