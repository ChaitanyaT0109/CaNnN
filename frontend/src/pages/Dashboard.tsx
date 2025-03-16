import React, { useState, useEffect } from 'react';
import DashboardStats from '../components/dashboard/DashboardStats';
import GlassCard from '../components/ui-elements/GlassCard';
import { Button } from '@/components/ui/button';
import { Lightbulb, Plus, ArrowRight, Moon, Sun, Trash, Edit, Check, MoreVertical } from 'lucide-react';
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

// Define InventoryItem interface to match your MongoDB schema
export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  boughtDate: string;
  expiryDate: string;
  price?: number;
}

// Updated DashboardStats interface to use real data
interface DashboardMetrics {
  runningLowCount: number;
  expiringSoonCount: number;
  weeklySpend: number;
  wasteScore: number;
  previousWeekSpend: number;
  previousWasteScore: number;
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
              <DropdownMenuItem onClick={() => onDelete(item._id)}>
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
          <span className="text-sm">{formatDate(item.boughtDate)}</span>
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
  // State for inventory data
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [expiringItems, setExpiringItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    runningLowCount: 0,
    expiringSoonCount: 0,
    weeklySpend: 0,
    wasteScore: 0,
    previousWeekSpend: 0,
    previousWasteScore: 0
  });
  
  const [recommendations, setRecommendations] = useState<string[]>([]);
  
  // Dialog states
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [consumeDialogOpen, setConsumeDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  
  // New item form state
  const [newItem, setNewItem] = useState<Omit<InventoryItem, '_id'>>({
    name: '',
    category: 'Vegetables',
    quantity: 1,
    unit: 'kg',
    boughtDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    price: 0
  });
  
  // Consumption form state
  const [consumeAmount, setConsumeAmount] = useState(1);
  
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Fetch inventory data from API
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/v1/foods');
        if (!response.ok) {
          throw new Error('Failed to fetch inventory data');
        }
        const data = await response.json();
        
        setInventory(data);
        
        // Process data for dashboard metrics
        processInventoryData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching inventory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Process inventory data to calculate dashboard metrics and expiring items
  const processInventoryData = (data: InventoryItem[]) => {
    const now = new Date();
    
    // Filter items expiring soon (within 7 days)
    const expiring = data.filter(item => {
      const expiryDate = parseISO(item.expiryDate);
      const daysLeft = differenceInDays(expiryDate, now);
      return daysLeft >= 0 && daysLeft <= 7; // Not expired yet but close to expiry
    });
    
    // Sort by days left until expiry
    expiring.sort((a, b) => {
      const daysA = differenceInDays(parseISO(a.expiryDate), now);
      const daysB = differenceInDays(parseISO(b.expiryDate), now);
      return daysA - daysB;
    });
    
    setExpiringItems(expiring);
    
    // Count items running low (arbitrary threshold - could be customized per item in real app)
    const runningLow = data.filter(item => item.quantity <= 1).length;
    
    // Calculate weekly spend (mock calculation - would be more sophisticated in real app)
    const weeklySpend = data.reduce((total, item) => {
      const boughtDate = parseISO(item.boughtDate);
      const daysSincePurchase = differenceInDays(now, boughtDate);
      // Include only items bought in the last 7 days
      if (daysSincePurchase <= 7) {
        return total + (item.price || 0);
      }
      return total;
    }, 0);
    
    // Mock data for previous week's spend and waste score
    const prevWeekSpend = weeklySpend * 1.12; // Assume 12% higher last week
    
    // Calculate waste score based on expired items
    const expiredItems = data.filter(item => {
      const expiryDate = parseISO(item.expiryDate);
      return differenceInDays(expiryDate, now) < 0;
    }).length;
    
    // Mock waste score calculation (0-10 scale, lower is better)
    const wasteScore = 10 - Math.min(10, Math.max(0, 10 - expiredItems));
    const prevWasteScore = wasteScore * 0.95; // Slightly worse last week
    
    // Update dashboard metrics
    setDashboardMetrics({
      runningLowCount: runningLow,
      expiringSoonCount: expiring.length,
      weeklySpend,
      wasteScore,
      previousWeekSpend: prevWeekSpend,
      previousWasteScore: prevWasteScore
    });
    
    // Generate AI recommendations based on inventory
    generateRecommendations(data, expiring);
  };
  
  // Generate recommendations based on inventory data
  const generateRecommendations = (inventory: InventoryItem[], expiringItems: InventoryItem[]) => {
    const recommendations: string[] = [];
    
    // Add recommendations for items expiring soon
    expiringItems.forEach(item => {
      const daysLeft = differenceInDays(parseISO(item.expiryDate), new Date());
      if (daysLeft <= 2) {
        recommendations.push(`Use ${item.name.toLowerCase()} within ${daysLeft} days to avoid waste`);
      }
    });
    
    // Add recommendations for low items
    inventory.forEach(item => {
      if (item.quantity <= 1 && item.category === 'Dairy') {
        recommendations.push(`Buy ${item.name.toLowerCase()} soon, you're almost out`);
      }
    });
    
    // Add general recommendations
    if (inventory.some(item => item.category === 'Bakery')) {
      recommendations.push(`Consider freezing bread to extend freshness`);
    }
    
    // Check if there are ingredients for common meals
    if (inventory.some(item => item.category === 'Grains') && 
        inventory.some(item => item.category === 'Vegetables')) {
      recommendations.push(`There are enough ingredients for pasta tonight`);
    }
    
    // Take only up to 4 recommendations
    setRecommendations(recommendations.slice(0, 4));
  };

  // Add new item handler
  const handleAddItem = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/v1/foods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          quantity: newItem.quantity,
          unit: newItem.unit,
          boughtDate: newItem.boughtDate,
          expiryDate: newItem.expiryDate,
          price: newItem.price
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item');
      }
      
      const addedItem = await response.json();
      
      // Update local state
      setInventory([...inventory, addedItem]);
      
      // Recalculate expiring items and metrics
      processInventoryData([...inventory, addedItem]);
      
      // Reset form and close dialog
      setAddItemDialogOpen(false);
      setNewItem({
        name: '',
        category: 'Vegetables',
        quantity: 1,
        unit: 'kg',
        boughtDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        price: 0
      });
      
      toast({
        title: "Item Added",
        description: `${newItem.name} has been added to your inventory.`,
      });
    } catch (err) {
      console.error('Error adding item:', err);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Edit item handlers
  const openEditDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    setEditItemDialogOpen(true);
  };

  const handleEditItem = async () => {
    if (!currentItem) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/v1/foods/${currentItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: currentItem.name,
          category: currentItem.category,
          quantity: currentItem.quantity,
          unit: currentItem.unit,
          boughtDate: currentItem.boughtDate,
          expiryDate: currentItem.expiryDate,
          price: currentItem.price
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item');
      }
      
      const updatedItem = await response.json();
      
      // Update local state
      const updatedInventory = inventory.map(item => 
        item._id === currentItem._id ? updatedItem : item
      );
      
      setInventory(updatedInventory);
      
      // Recalculate expiring items and metrics
      processInventoryData(updatedInventory);
      
      // Close dialog and reset current item
      setEditItemDialogOpen(false);
      setCurrentItem(null);
      
      toast({
        title: "Item Updated",
        description: `${currentItem.name} has been updated.`,
      });
    } catch (err) {
      console.error('Error updating item:', err);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete item handler
  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/foods/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      
      // Update local state
      const updatedInventory = inventory.filter(item => item._id !== id);
      setInventory(updatedInventory);
      
      // Recalculate expiring items and metrics
      processInventoryData(updatedInventory);
      
      toast({
        title: "Item Deleted",
        description: "The item has been removed from your inventory.",
      });
    } catch (err) {
      console.error('Error deleting item:', err);
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Consume item handlers
  const openConsumeDialog = (item: InventoryItem) => {
    setCurrentItem(item);
    setConsumeAmount(1);
    setConsumeDialogOpen(true);
  };

  const handleConsumeItem = async () => {
    if (!currentItem) return;
    
    try {
      const newQuantity = currentItem.quantity - consumeAmount;
      
      if (newQuantity <= 0) {
        // If quantity becomes zero or negative, delete the item
        await handleDeleteItem(currentItem._id);
      } else {
        // Otherwise update the quantity
        const response = await fetch(`http://localhost:5000/api/v1/foods/${currentItem._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...currentItem,
            quantity: newQuantity
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to update item quantity');
        }
        
        const updatedItem = await response.json();
        
        // Update local state
        const updatedInventory = inventory.map(item => 
          item._id === currentItem._id ? updatedItem : item
        );
        
        setInventory(updatedInventory);
        
        // Recalculate expiring items and metrics
        processInventoryData(updatedInventory);
      }
      
      // Close dialog and reset current item
      setConsumeDialogOpen(false);
      setCurrentItem(null);
      
      toast({
        title: "Consumption Logged",
        description: `Consumed ${consumeAmount} ${currentItem.unit} of ${currentItem.name}.`,
      });
    } catch (err) {
      console.error('Error consuming item:', err);
      toast({
        title: "Error",
        description: "Failed to log consumption. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Theme toggle handler
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className="page-container flex items-center justify-center h-96">
        <p>Loading inventory data...</p>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="page-container">
        <h1 className="page-title">Dashboard</h1>
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mt-4">
          <p>Error loading inventory: {error}</p>
          <Button className="mt-2" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="flex justify-between items-center">
        <h1 className="page-title">Dashboard</h1>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Dashboard Stats - Pass real data */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <GlassCard>
          <h3 className="text-sm text-muted-foreground">Items Running Low</h3>
          <p className="text-3xl font-bold mt-2">{dashboardMetrics.runningLowCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Items below threshold</p>
        </GlassCard>
        
        <GlassCard>
          <h3 className="text-sm text-muted-foreground">Expiring Soon</h3>
          <p className="text-3xl font-bold mt-2">{dashboardMetrics.expiringSoonCount}</p>
          <p className="text-xs text-muted-foreground mt-1">Items expiring this week</p>
        </GlassCard>
        
        <GlassCard>
          <h3 className="text-sm text-muted-foreground">Weekly Grocery Spend</h3>
          <p className="text-3xl font-bold mt-2">₹{dashboardMetrics.weeklySpend.toFixed(2)}</p>
          <p className="text-xs text-red-500 mt-1">
            ↓ {Math.abs(((dashboardMetrics.weeklySpend - dashboardMetrics.previousWeekSpend) / dashboardMetrics.previousWeekSpend) * 100).toFixed(0)}% vs last week
          </p>
        </GlassCard>
        
        <GlassCard>
          <h3 className="text-sm text-muted-foreground">Food Waste Score</h3>
          <p className="text-3xl font-bold mt-2">{dashboardMetrics.wasteScore.toFixed(1)}/10</p>
          <p className="text-xs text-green-500 mt-1">
            Better than last week
          </p>
        </GlassCard>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <h2 className="section-title">Expiring Soon</h2>
          {expiringItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {expiringItems.map(item => (
                <ItemCard 
                  key={item._id} 
                  item={item} 
                  onEdit={() => openEditDialog(item)}
                  onDelete={() => handleDeleteItem(item._id)}
                  onConsume={() => openConsumeDialog(item)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-secondary p-6 rounded-lg text-center">
              <p>No items expiring soon</p>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="section-title">AI Recommendations</h2>
          <GlassCard className="h-full">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Smart Suggestions</h3>
            </div>
            {recommendations.length > 0 ? (
              <ul className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <li key={index} className="bg-secondary rounded-lg p-3 text-sm">
                    {recommendation}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add more items to your inventory to get personalized recommendations.
              </p>
            )}
          </GlassCard>
        </div>
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
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                className="col-span-3"
                min="0"
                step="0.1"
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
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={newItem.price || ''}
                onChange={(e) => setNewItem({...newItem, price: Number(e.target.value)})}
                className="col-span-3"
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="boughtDate" className="text-right">Bought Date</Label>
              <Input
                id="boughtDate"
                type="date"
                value={newItem.boughtDate}
                onChange={(e) => setNewItem({...newItem, boughtDate: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDate" className="text-right">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={newItem.expiryDate}
                onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddItem} disabled={!newItem.name || !newItem.expiryDate}>Add Item</Button>
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
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantity" className="text-right">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  value={currentItem.quantity}
                  onChange={(e) => setCurrentItem({...currentItem, quantity: Number(e.target.value)})}
                  className="col-span-3"
                  min="0"
                  step="0.1"
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
                    {unitOptions.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">Price (₹)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={currentItem.price || ''}
                  onChange={(e) => setCurrentItem({...currentItem, price: Number(e.target.value)})}
                  className="col-span-3"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-boughtDate" className="text-right">Bought Date</Label>
                <Input
                  id="edit-boughtDate"
                  type="date"
                  value={currentItem.boughtDate.split('T')[0]}
                  onChange={(e) => setCurrentItem({...currentItem, boughtDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-expiryDate" className="text-right">Expiry Date</Label>
                <Input
                  id="edit-expiryDate"
                  type="date"
                  value={currentItem.expiryDate.split('T')[0]}
                  onChange={(e) => setCurrentItem({...currentItem, expiryDate: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItemDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditItem} disabled={!currentItem?.name || !currentItem?.expiryDate}>
              Save Changes
            </Button>
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
              <p className="text-center">
                {currentItem.name} - Current quantity: {currentItem.quantity} {currentItem.unit}
              </p>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="consume-amount" className="text-right">Amount Used</Label>
                <Input
                  id="consume-amount"
                  type="number"
                  value={consumeAmount}
                  onChange={(e) => setConsumeAmount(Number(e.target.value))}
                  className="col-span-3"
                  min="0.1"
                  max={currentItem.quantity}
                  step="0.1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsumeDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConsumeItem} 
              disabled={!currentItem || consumeAmount <= 0 || consumeAmount > currentItem.quantity}
            >
              Log Consumption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;