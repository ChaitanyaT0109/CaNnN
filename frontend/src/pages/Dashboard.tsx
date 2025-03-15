import React, { useState } from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import GlassCard from '../components/ui-elements/GlassCard';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar, Lightbulb, Plus, ArrowRight, Moon, Sun, Trash, Edit, Check, MoreVertical } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO, differenceInDays } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

// Define InventoryItem interface
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
  price?: number;
}

// ItemCard component integrated directly
interface ItemCardProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  onConsume?: (item: InventoryItem) => void;
}

const getExpiryStatus = (expiryDate: string) => {
  const now = new Date();
  const expiry = parseISO(expiryDate);
  const daysLeft = differenceInDays(expiry, now);

  if (daysLeft < 0) return { status: 'expired', color: 'bg-red-100 text-red-800' };
  if (daysLeft <= 2) return { status: 'critical', color: 'bg-red-100 text-red-800' };
  if (daysLeft <= 5) return { status: 'warning', color: 'bg-yellow-100 text-yellow-800' };
  return { status: 'good', color: 'bg-green-100 text-green-800' };
};

const ItemCard: React.FC<ItemCardProps> = ({ item, onEdit, onDelete, onConsume }) => {
  const { status, color } = getExpiryStatus(item.expiryDate);

  const getDaysText = () => {
    const now = new Date();
    const expiry = parseISO(item.expiryDate);
    const daysLeft = differenceInDays(expiry, now);

    if (daysLeft < 0) return `Expired ${Math.abs(daysLeft)} days ago`;
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return 'Expires tomorrow';
    return `Expires in ${daysLeft} days`;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm p-4 border border-border">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{item.name}</h3>
          <p className="text-muted-foreground text-sm">{item.category}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary">
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4 mr-2" /> Edit
              </DropdownMenuItem>
            )}
            {onConsume && (
              <DropdownMenuItem onClick={() => onConsume(item)}>
                <Check className="h-4 w-4 mr-2" /> Log Consumption
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={() => onDelete(item.id)}>
                <Trash className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Quantity</span>
          <span className="text-sm font-medium">{item.quantity} {item.unit}</span>
        </div>
        
        {item.price !== undefined && (
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="text-sm font-medium">₹{item.price}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Purchased</span>
          <span className="text-sm">{formatDate(item.purchaseDate)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Expiry</span>
          <span className="text-sm">{formatDate(item.expiryDate)}</span>
        </div>
      </div>

      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-medium inline-block ${color}`}>
        {getDaysText()}
      </div>
    </div>
  );
};

// Sample data for demonstration
const initialExpiringItems: InventoryItem[] = [
  {
    id: '4',
    name: 'Chicken Breast',
    category: 'Meat',
    quantity: 2,
    unit: 'kg',
    purchaseDate: '2023-08-03',
    expiryDate: '2023-08-06',
    price: 320,
  },
  {
    id: '5',
    name: 'Spinach',
    category: 'Vegetables',
    quantity: 1,
    unit: 'bunch',
    purchaseDate: '2023-08-02',
    expiryDate: '2023-08-05',
    price: 40,
  },
  {
    id: '6',
    name: 'Bread',
    category: 'Bakery',
    quantity: 1,
    unit: 'pack',
    purchaseDate: '2023-08-01',
    expiryDate: '2023-08-07',
    price: 50,
  }
];

const initialShoppingList = [
  { id: '1', name: 'Milk', quantity: 1, unit: 'L', price: 70 },
  { id: '2', name: 'Bananas', quantity: 6, unit: 'count', price: 60 },
  { id: '3', name: 'Greek Yogurt', quantity: 2, unit: 'cups', price: 90 }
];

const initialMealPlan = [
  { id: '1', day: 'Monday', meal: 'Pasta Primavera' },
  { id: '2', day: 'Tuesday', meal: 'Chicken Stir Fry' },
  { id: '3', day: 'Wednesday', meal: 'Fish Tacos' }
];

const recommendations = [
  "Use spinach within 2 days to avoid waste",
  "Buy milk soon, you're almost out",
  "Consider freezing bread to extend freshness",
  "There are enough ingredients for pasta tonight"
];

// Category options for Indian context
const categoryOptions = [
  "Vegetables", "Fruits", "Dairy", "Grains", "Pulses", "Spices", 
  "Meat", "Seafood", "Bakery", "Snacks", "Beverages", "Others"
];

// Unit options for Indian context
const unitOptions = [
  "kg", "g", "L", "ml", "pack", "bunch", "count", "dozen"
];

const Dashboard = () => {
  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>(initialExpiringItems);
  const [shoppingList, setShoppingList] = useState(initialShoppingList);
  const [mealPlan, setMealPlan] = useState(initialMealPlan);
  
  // Dialog states
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [consumeDialogOpen, setConsumeDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  
  // New item form state
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: 'Vegetables',
    quantity: 1,
    unit: 'kg',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    price: 0
  });
  
  // Consumption form state
  const [consumeAmount, setConsumeAmount] = useState(1);
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Add new item handler
  const handleAddItem = () => {
    const id = Date.now().toString();
    const itemToAdd = { id, ...newItem };
    setExpiringItems([...expiringItems, itemToAdd]);
    setAddItemDialogOpen(false);
    setNewItem({
      name: '',
      category: 'Vegetables',
      quantity: 1,
      unit: 'kg',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      price: 0
    });
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to your inventory.`,
    });
  };

  // Edit item handlers
  const openEditDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    setEditItemDialogOpen(true);
  };

  const handleEditItem = () => {
    if (!currentItem) return;
    
    const updatedItems = expiringItems.map(item => 
      item.id === currentItem.id ? currentItem : item
    );
    
    setExpiringItems(updatedItems);
    setEditItemDialogOpen(false);
    setCurrentItem(null);
    
    toast({
      title: "Item Updated",
      description: `${currentItem.name} has been updated.`,
    });
  };

  // Delete item handler
  const handleDeleteItem = (id: string) => {
    const updatedItems = expiringItems.filter(item => item.id !== id);
    setExpiringItems(updatedItems);
    
    toast({
      title: "Item Deleted",
      description: "The item has been removed from your inventory.",
    });
  };

  // Consume item handlers
  const openConsumeDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    setConsumeAmount(1);
    setConsumeDialogOpen(true);
  };

  const handleConsumeItem = () => {
    if (!currentItem) return;
    
    const updatedItems = expiringItems.map(item => {
      if (item.id === currentItem.id) {
        const newQuantity = item.quantity - consumeAmount;
        if (newQuantity <= 0) {
          return null; // Mark for removal
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as InventoryItem[]; // Remove nulls
    
    setExpiringItems(updatedItems);
    setConsumeDialogOpen(false);
    setCurrentItem(null);
    
    toast({
      title: "Consumption Logged",
      description: `Consumed ${consumeAmount} ${currentItem.unit} of ${currentItem.name}.`,
    });
  };

  // Shopping list handlers
  const handleDeleteShoppingItem = (id: string) => {
    const updatedItems = shoppingList.filter(item => item.id !== id);
    setShoppingList(updatedItems);
    
    toast({
      title: "Item Removed",
      description: "The item has been removed from your shopping list.",
    });
  };

  // Theme toggle handler
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Dashboard</h1>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <h2 className="section-title">Expiring Soon</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {expiringItems.map(item => (
              <ItemCard 
                key={item.id} 
                item={item} 
                onEdit={() => openEditDialog(item)}
                onDelete={() => handleDeleteItem(item.id)}
                onConsume={() => openConsumeDialog(item)}
              />
            ))}
            <div className="flex items-center justify-center">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 w-full h-full min-h-[120px]"
                onClick={() => setAddItemDialogOpen(true)}
              >
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
            {shoppingList.map(item => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-secondary rounded-lg">
                <span>{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {item.quantity} {item.unit} · ₹{item.price}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => handleDeleteShoppingItem(item.id)}
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
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
            {mealPlan.map(day => (
              <div key={day.id} className="flex justify-between items-center p-2 bg-secondary rounded-lg">
                <span>{day.day}</span>
                <span className="text-sm text-muted-foreground">{day.meal}</span>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 flex items-center justify-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Go to Meal Planning</span>
          </Button>
        </GlassCard>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select 
                value={newItem.category} 
                onValueChange={(value) => setNewItem({...newItem, category: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">Unit</Label>
              <Select 
                value={newItem.unit} 
                onValueChange={(value) => setNewItem({...newItem, unit: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="1"
                value={newItem.price}
                onChange={(e) => setNewItem({...newItem, price: parseFloat(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchase-date" className="text-right">Purchased</Label>
              <Input
                id="purchase-date"
                type="date"
                value={newItem.purchaseDate}
                onChange={(e) => setNewItem({...newItem, purchaseDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiry-date" className="text-right">Expires</Label>
              <Input
                id="expiry-date"
                type="date"
                value={newItem.expiryDate}
                onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={editItemDialogOpen} onOpenChange={setEditItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          {currentItem && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">Name</Label>
                <Input
                  id="edit-name"
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">Category</Label>
                <Select 
                  value={currentItem.category} 
                  onValueChange={(value) => setCurrentItem({...currentItem, category: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-right">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  step="0.1"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: parseFloat(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-unit" className="text-right">Unit</Label>
                <Select 
                  value={currentItem.unit} 
                  onValueChange={(value) => setCurrentItem({...currentItem, unit: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="1"
                  value={currentItem.price || 0}
                  onChange={(e) => setCurrentItem({...currentItem, price: parseFloat(e.target.value) || 0})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-purchase-date" className="text-right">Purchased</Label>
                <Input
                  id="edit-purchase-date"
                  type="date"
                  value={currentItem.purchaseDate}
                  onChange={(e) => setCurrentItem({...currentItem, purchaseDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-expiry-date" className="text-right">Expires</Label>
                <Input
                  id="edit-expiry-date"
                  type="date"
                  value={currentItem.expiryDate}
                  onChange={(e) => setCurrentItem({...currentItem, expiryDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consume Item Dialog */}
      <Dialog open={consumeDialogOpen} onOpenChange={setConsumeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log Consumption</DialogTitle>
          </DialogHeader>
          {currentItem && (
            <div className="grid gap-4 py-4">
              <p>
                Current quantity: {currentItem.quantity} {currentItem.unit} of {currentItem.name}
              </p>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="consume-amount" className="text-right">Amount</Label>
                <Input
                  id="consume-amount"
                  type="number"
                  min="0.1"
                  max={currentItem.quantity}
                  step="0.1"
                  value={consumeAmount}
                  onChange={(e) => setConsumeAmount(parseFloat(e.target.value) || 0)}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsumeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleConsumeItem}>Log Consumption</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;