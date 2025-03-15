
import React from 'react';
import { Button } from '@/components/ui/button';
import GlassCard from '../components/ui-elements/GlassCard';
import { Magic, Plus, Minus, Store, Tag, Download } from 'lucide-react';

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  store: string;
}

const sampleShoppingList: ShoppingItem[] = [
  {
    id: '1',
    name: 'Milk',
    category: 'Dairy',
    quantity: 1,
    unit: 'gallon',
    estimatedPrice: 3.99,
    store: 'Safeway',
  },
  {
    id: '2',
    name: 'Bananas',
    category: 'Fruits',
    quantity: 6,
    unit: 'count',
    estimatedPrice: 2.50,
    store: 'Trader Joe\'s',
  },
  {
    id: '3',
    name: 'Greek Yogurt',
    category: 'Dairy',
    quantity: 2,
    unit: 'containers',
    estimatedPrice: 5.98,
    store: 'Safeway',
  },
  {
    id: '4',
    name: 'Chicken Breast',
    category: 'Meat',
    quantity: 2,
    unit: 'lbs',
    estimatedPrice: 9.99,
    store: 'Costco',
  },
  {
    id: '5',
    name: 'Brown Rice',
    category: 'Grains',
    quantity: 1,
    unit: 'bag',
    estimatedPrice: 3.49,
    store: 'Trader Joe\'s',
  },
];

const ShoppingList = () => {
  // Calculate total price
  const totalPrice = sampleShoppingList.reduce(
    (sum, item) => sum + item.estimatedPrice,
    0
  );

  // Group items by store
  const itemsByStore = sampleShoppingList.reduce((acc, item) => {
    if (!acc[item.store]) {
      acc[item.store] = [];
    }
    acc[item.store].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  return (
    <div className="page-container">
      <h1 className="page-title">Shopping List</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3 animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button className="flex items-center gap-2">
                <Magic className="h-4 w-4" />
                <span>Generate Smart List</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </Button>
            </div>
            <Button variant="ghost" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
          
          <GlassCard>
            <h2 className="text-lg font-medium mb-4">Your Shopping List</h2>
            
            {Object.entries(itemsByStore).map(([store, items]) => (
              <div key={store} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Store className="h-4 w-4 text-primary" />
                  <h3 className="font-medium">{store}</h3>
                </div>
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-1">
                          <button className="p-1 rounded-full bg-background text-muted-foreground hover:text-foreground">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                          <button className="p-1 rounded-full bg-background text-muted-foreground hover:text-foreground">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-muted-foreground">{item.unit}</span>
                            <span className="mx-1 text-muted-foreground">•</span>
                            <span className="text-xs inline-block px-1.5 py-0.5 rounded-full bg-primary/10 text-primary-foreground">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-sm font-medium">${item.estimatedPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
        
        <div className="w-full md:w-1/3 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">Budget & Costs</h2>
            </div>
            
            <div className="bg-secondary p-4 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Estimated Total</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Items Count</span>
                <span className="font-medium">{sampleShoppingList.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stores</span>
                <span className="font-medium">{Object.keys(itemsByStore).length}</span>
              </div>
            </div>
            
            <h3 className="font-medium mb-2">Price Comparison</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center p-2 bg-secondary rounded-lg">
                <span className="text-sm">Milk (gallon)</span>
                <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">Safeway: $3.99</div>
                  <div className="text-xs text-muted-foreground">Target: $4.29</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-secondary rounded-lg">
                <span className="text-sm">Bananas (lb)</span>
                <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">Trader Joe's: $0.19/each</div>
                  <div className="text-xs text-muted-foreground">Safeway: $0.25/each</div>
                </div>
              </div>
            </div>
            
            <Button className="w-full">Complete Shopping</Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
