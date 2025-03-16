import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import GlassCard from '../components/ui-elements/GlassCard';
import { Sparkles, Plus, Minus, Store, Tag, Download, Edit, Trash2, X, Check, Moon, Sun, LightbulbIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface ShoppingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  store: string;
}

// Initial sample shopping list with Indian units and currency
const initialShoppingList: ShoppingItem[] = [
  {
    id: '1',
    name: 'Milk',
    category: 'Dairy',
    quantity: 1,
    unit: 'litre',
    estimatedPrice: 60,
    store: 'Big Bazaar',
  },
  {
    id: '2',
    name: 'Bananas',
    category: 'Fruits',
    quantity: 6,
    unit: 'count',
    estimatedPrice: 40,
    store: 'Local Market',
  },
  {
    id: '3',
    name: 'Curd',
    category: 'Dairy',
    quantity: 0.5,
    unit: 'kg',
    estimatedPrice: 50,
    store: 'Big Bazaar',
  },
  {
    id: '4',
    name: 'Chicken Breast',
    category: 'Meat',
    quantity: 1,
    unit: 'kg',
    estimatedPrice: 300,
    store: 'D-Mart',
  },
  {
    id: '5',
    name: 'Basmati Rice',
    category: 'Grains',
    quantity: 1,
    unit: 'kg',
    estimatedPrice: 80,
    store: 'Local Market',
  },
];

// Smart recommendations based on inventory and purchase patterns
const smartRecommendations = [
  {
    id: 'rec1',
    item: 'Buy milk soon, you\'re almost out',
    reason: 'Low inventory',
    priority: 'high',
  },
  {
    id: 'rec2',
    item: 'Tomatoes are in season at Local Market',
    reason: 'Seasonal item',
    priority: 'medium',
  },
  {
    id: 'rec3',
    item: 'Add vegetable oil to your list',
    reason: 'Frequently bought with your items',
    priority: 'medium',
  },
  {
    id: 'rec4',
    item: 'Onions are 20% off at D-Mart this week',
    reason: 'Price alert',
    priority: 'high',
  }
];

// Categories relevant to Indian groceries
const categories = [
  'Dairy', 'Fruits', 'Vegetables', 'Grains', 'Pulses', 'Spices', 
  'Snacks', 'Beverages', 'Meat', 'Bakery', 'Frozen Foods', 'Household'
];

// Common Indian grocery stores
const stores = [
  'Big Bazaar', 'D-Mart', 'Reliance Fresh', 'Local Market', 'More', 'Spencer\'s', 'Easy Day'
];

// Common units in Indian system
const units = [
  'kg', 'gm', 'litre', 'ml', 'count', 'packet', 'dozen', 'box'
];

const ShoppingList = () => {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(initialShoppingList);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Omit<ShoppingItem, 'id'>>({
    name: '',
    category: 'Fruits',
    quantity: 1,
    unit: 'kg',
    estimatedPrice: 0,
    store: 'Big Bazaar',
  });
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Calculate total price
  const totalPrice = shoppingList.reduce(
    (sum, item) => sum + item.estimatedPrice,
    0
  );

  // Group items by store
  const itemsByStore = shoppingList.reduce((acc, item) => {
    if (!acc[item.store]) {
      acc[item.store] = [];
    }
    acc[item.store].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  // Effect to toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Generate a new ID for items
  const generateId = () => {
    return Date.now().toString();
  };

  // Handle adding a new item
  const handleAddItem = () => {
    const item: ShoppingItem = {
      ...newItem,
      id: generateId(),
    };
    setShoppingList([...shoppingList, item]);
    setNewItem({
      name: '',
      category: 'Fruits',
      quantity: 1,
      unit: 'kg',
      estimatedPrice: 0,
      store: 'Big Bazaar',
    });
    setIsAddDialogOpen(false);
    toast({
      title: "Item Added",
      description: `${item.name} has been added to your shopping list.`
    });
  };

  // Handle editing an item
  const handleEditItem = () => {
    if (editingItem) {
      setShoppingList(shoppingList.map(item => 
        item.id === editingItem.id ? editingItem : item
      ));
      setIsEditDialogOpen(false);
      setEditingItem(null);
      toast({
        title: "Item Updated",
        description: `${editingItem.name} has been updated.`
      });
    }
  };

  // Handle deleting an item
  const handleDeleteItem = (id: string) => {
    const itemToDelete = shoppingList.find(item => item.id === id);
    setShoppingList(shoppingList.filter(item => item.id !== id));
    toast({
      title: "Item Deleted",
      description: `${itemToDelete?.name} has been removed from your shopping list.`
    });
  };

  // Handle incrementing or decrementing quantity
  const handleQuantityChange = (id: string, increment: boolean) => {
    setShoppingList(shoppingList.map(item => {
      if (item.id === id) {
        const newQuantity = increment 
          ? item.quantity + (item.unit === 'kg' || item.unit === 'litre' ? 0.25 : 1) 
          : Math.max(item.quantity - (item.unit === 'kg' || item.unit === 'litre' ? 0.25 : 1), 0);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  // Generate a smart shopping list based on common Indian groceries
  const generateSmartList = () => {
    const smartItems: ShoppingItem[] = [
      {
        id: generateId(),
        name: 'Onions',
        category: 'Vegetables',
        quantity: 1,
        unit: 'kg',
        estimatedPrice: 40,
        store: 'Local Market',
      },
      {
        id: generateId(),
        name: 'Tomatoes',
        category: 'Vegetables',
        quantity: 0.5,
        unit: 'kg',
        estimatedPrice: 30,
        store: 'Local Market',
      },
      {
        id: generateId(),
        name: 'Toor Dal',
        category: 'Pulses',
        quantity: 0.5,
        unit: 'kg',
        estimatedPrice: 70,
        store: 'D-Mart',
      },
      {
        id: generateId(),
        name: 'Wheat Flour (Atta)',
        category: 'Grains',
        quantity: 5,
        unit: 'kg',
        estimatedPrice: 180,
        store: 'D-Mart',
      }
    ];
    
    // Add these smart items to the existing list
    setShoppingList([...shoppingList, ...smartItems]);
    toast({
      title: "Smart List Generated",
      description: "Common Indian grocery items have been added to your list."
    });
  };

  // Function to add recommended item to shopping list
  const addRecommendedItem = (recommendation: string, store: string = 'Big Bazaar') => {
    // Simple parsing function to extract item name
    const itemName = recommendation.includes('Buy') 
      ? recommendation.split('Buy ')[1].split(',')[0]
      : recommendation.includes('Add') 
        ? recommendation.split('Add ')[1].split(' to')[0]
        : recommendation.split(' are')[0];
    
    // Determine category based on item name (simplified)
    let category = 'Vegetables';
    if (itemName.toLowerCase().includes('milk') || itemName.toLowerCase().includes('curd')) {
      category = 'Dairy';
    } else if (itemName.toLowerCase().includes('oil')) {
      category = 'Household';
    }
    
    // Create new item
    const newRecommendedItem: ShoppingItem = {
      id: generateId(),
      name: itemName,
      category: category,
      quantity: 1,
      unit: category === 'Dairy' ? 'litre' : 'kg',
      estimatedPrice: 50, // Default price
      store: store,
    };
    
    setShoppingList([...shoppingList, newRecommendedItem]);
    toast({
      title: "Recommendation Added",
      description: `${itemName} has been added to your shopping list.`
    });
  };

  // Export shopping list as CSV
  const exportList = () => {
    const headers = "Name,Category,Quantity,Unit,Price (₹),Store\n";
    const csvContent = headers + shoppingList
      .map(item => `${item.name},${item.category},${item.quantity},${item.unit},${item.estimatedPrice},${item.store}`)
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shopping_list.csv';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "List Exported",
      description: "Your shopping list has been exported as CSV."
    });
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center mb-4">
        <h1 className="page-title">Shopping List</h1>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
          className="ml-auto"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3 animate-slide-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button 
                className="flex items-center gap-2"
                onClick={generateSmartList}
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate Smart List</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </Button>
            </div>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={exportList}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          </div>
          
          <GlassCard>
            <h2 className="text-lg font-medium mb-4">Your Shopping List</h2>
            
            {Object.keys(itemsByStore).length > 0 ? (
              Object.entries(itemsByStore).map(([store, items]) => (
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
                            <button 
                              className="p-1 rounded-full bg-background text-muted-foreground hover:text-foreground"
                              onClick={() => handleQuantityChange(item.id, false)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-medium w-12 text-center">
                              {item.unit === 'kg' || item.unit === 'litre' 
                                ? item.quantity.toFixed(2) 
                                : item.quantity}
                            </span>
                            <button 
                              className="p-1 rounded-full bg-background text-muted-foreground hover:text-foreground"
                              onClick={() => handleQuantityChange(item.id, true)}
                            >
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
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">₹{item.estimatedPrice.toFixed(2)}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingItem(item);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <p className="text-muted-foreground mb-4">Your shopping list is empty</p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add First Item</span>
                </Button>
              </div>
            )}
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
                <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Items Count</span>
                <span className="font-medium">{shoppingList.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stores</span>
                <span className="font-medium">{Object.keys(itemsByStore).length}</span>
              </div>
            </div>
            
            <h3 className="font-medium mb-2">Price Comparison</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center p-2 bg-secondary rounded-lg">
                <span className="text-sm">Milk (litre)</span>
                <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">Big Bazaar: ₹60.00</div>
                  <div className="text-xs text-muted-foreground">More: ₹65.00</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-secondary rounded-lg">
                <span className="text-sm">Bananas (count)</span>
                <div className="text-right">
                  <div className="text-xs text-green-600 font-medium">Local Market: ₹6.50/each</div>
                  <div className="text-xs text-muted-foreground">Big Bazaar: ₹7.00/each</div>
                </div>
              </div>
            </div>
            
            {/* New Smart List Section */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-medium">Smart Suggestions</h2>
              </div>
              
              <div className="space-y-2">
                {smartRecommendations.map((rec) => (
                  <div 
                    key={rec.id} 
                    className={`p-3 rounded-lg flex items-center justify-between ${
                      rec.priority === 'high' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-secondary'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {rec.priority === 'high' && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                        <p className="text-sm font-medium">{rec.item}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8"
                      onClick={() => addRecommendedItem(rec.item)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      <span className="text-xs">Add</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <Button className="w-full mt-6">Complete Shopping</Button>
          </GlassCard>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="e.g., Tomatoes"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="store">Store</Label>
                <Select
                  value={newItem.store}
                  onValueChange={(value) => setNewItem({ ...newItem, store: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store} value={store}>
                        {store}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step={newItem.unit === 'kg' || newItem.unit === 'litre' ? "0.25" : "1"}
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={newItem.unit}
                  onValueChange={(value) => setNewItem({ ...newItem, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.5"
                  value={newItem.estimatedPrice}
                  onChange={(e) => setNewItem({ ...newItem, estimatedPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={!newItem.name}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Item Name</Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Tomatoes"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingItem.category}
                    onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-store">Store</Label>
                  <Select
                    value={editingItem.store}
                    onValueChange={(value) => setEditingItem({ ...editingItem, store: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store} value={store}>
                          {store}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min="0"
                    step={editingItem.unit === 'kg' || editingItem.unit === 'litre' ? "0.25" : "1"}
                    value={editingItem.quantity}
                    onChange={(e) => setEditingItem({ ...editingItem, quantity: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Select
                    value={editingItem.unit}
                    onValueChange={(value) => setEditingItem({ ...editingItem, unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.5"
                    value={editingItem.estimatedPrice}
                    onChange={(e) => setEditingItem({ ...editingItem, estimatedPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>
              Update Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingList;