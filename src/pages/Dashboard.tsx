
import React from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import GlassCard from '../components/ui-elements/GlassCard';
import ItemCard, { InventoryItem } from '../components/ui-elements/ItemCard';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar, Lightbulb, Plus, ArrowRight } from 'lucide-react';

// Sample data for demonstration
const expiringItems: InventoryItem[] = [
  {
    id: '4',
    name: 'Chicken Breast',
    category: 'Meat',
    quantity: 2,
    unit: 'lbs',
    purchaseDate: '2023-08-03',
    expiryDate: '2023-08-06',
  },
  {
    id: '5',
    name: 'Spinach',
    category: 'Vegetables',
    quantity: 1,
    unit: 'bunch',
    purchaseDate: '2023-08-02',
    expiryDate: '2023-08-05',
  },
  {
    id: '6',
    name: 'Bread',
    category: 'Bakery',
    quantity: 1,
    unit: 'loaf',
    purchaseDate: '2023-08-01',
    expiryDate: '2023-08-07',
  }
];

const recommendations = [
  "Use spinach within 2 days to avoid waste",
  "Buy milk soon, you're almost out",
  "Consider freezing bread to extend freshness",
  "There are enough ingredients for pasta tonight"
];

const Dashboard = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <h2 className="section-title">Expiring Soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expiringItems.map(item => (
              <ItemCard key={item.id} item={item} />
            ))}
            <div className="flex items-center justify-center">
              <Button variant="outline" className="flex items-center gap-2 w-full h-full min-h-[120px]">
                <Plus className="h-5 w-5" />
                <span>Add New Item</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="section-title">AI Recommendations</h2>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Smart Suggestions</h3>
            </div>
            <ul className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="bg-secondary rounded-lg p-3 text-sm">
                  {recommendation}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium">Shopping List</h2>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-secondary rounded-lg">
              <span>Milk</span>
              <span className="text-sm text-muted-foreground">1 gallon</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-secondary rounded-lg">
              <span>Bananas</span>
              <span className="text-sm text-muted-foreground">6 count</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-secondary rounded-lg">
              <span>Greek Yogurt</span>
              <span className="text-sm text-muted-foreground">2 containers</span>
            </div>
          </div>
          <Button className="w-full mt-4 flex items-center justify-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Go to Shopping List</span>
          </Button>
        </GlassCard>
        
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-medium">Meal Plan</h2>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-secondary rounded-lg">
              <span>Monday</span>
              <span className="text-sm text-muted-foreground">Pasta Primavera</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-secondary rounded-lg">
              <span>Tuesday</span>
              <span className="text-sm text-muted-foreground">Chicken Stir Fry</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-secondary rounded-lg">
              <span>Wednesday</span>
              <span className="text-sm text-muted-foreground">Fish Tacos</span>
            </div>
          </div>
          <Button className="w-full mt-4 flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Go to Meal Planning</span>
          </Button>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;
