
import React, { useState } from 'react';
import { Search, Filter, Plus, Grid, List } from 'lucide-react';
import ItemCard, { InventoryItem } from '../ui-elements/ItemCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Sample data for demonstration
const sampleInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Milk',
    category: 'Dairy',
    quantity: 1,
    unit: 'gallon',
    purchaseDate: '2023-08-01',
    expiryDate: '2023-08-08',
  },
  {
    id: '2',
    name: 'Eggs',
    category: 'Dairy',
    quantity: 12,
    unit: 'count',
    purchaseDate: '2023-08-02',
    expiryDate: '2023-08-16',
  },
  {
    id: '3',
    name: 'Apples',
    category: 'Fruits',
    quantity: 6,
    unit: 'count',
    purchaseDate: '2023-08-01',
    expiryDate: '2023-08-10',
  },
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
  },
  {
    id: '7',
    name: 'Yogurt',
    category: 'Dairy',
    quantity: 4,
    unit: 'cups',
    purchaseDate: '2023-08-03',
    expiryDate: '2023-08-17',
  },
  {
    id: '8',
    name: 'Tomatoes',
    category: 'Vegetables',
    quantity: 5,
    unit: 'count',
    purchaseDate: '2023-08-02',
    expiryDate: '2023-08-09',
  }
];

const categories = [
  'All Categories',
  'Dairy',
  'Fruits',
  'Vegetables',
  'Meat',
  'Bakery',
  'Pantry',
  'Frozen',
  'Snacks',
  'Beverages'
];

const statuses = [
  'All Status',
  'Fresh',
  'Expiring Soon',
  'Expired',
];

type NewItemFormValues = {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
};

const InventoryList = () => {
  const [inventoryItems, setInventoryItems] = useState(sampleInventoryItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  
  const newItemForm = useForm<NewItemFormValues>({
    defaultValues: {
      name: '',
      category: 'Dairy',
      quantity: 1,
      unit: 'count',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }
  });
  
  const handleAddItem = (data: NewItemFormValues) => {
    const newItem: InventoryItem = {
      id: `${Date.now()}`,
      ...data
    };
    
    setInventoryItems([newItem, ...inventoryItems]);
    setAddItemDialogOpen(false);
    newItemForm.reset();
    toast.success("Item added successfully");
  };
  
  const handleEdit = (id: string, updatedItem: Partial<InventoryItem>) => {
    const updatedItems = inventoryItems.map(item => 
      item.id === id ? { ...item, ...updatedItem } : item
    );
    setInventoryItems(updatedItems);
    toast.success("Item updated successfully");
  };
  
  const handleDelete = (id: string) => {
    const updatedItems = inventoryItems.filter(item => item.id !== id);
    setInventoryItems(updatedItems);
    toast.success("Item deleted successfully");
  };
  
  const handleAddToShoppingList = (id: string) => {
    // Implementation would connect to shopping list functionality
    const item = inventoryItems.find(item => item.id === id);
    if (item) {
      toast.success(`${item.name} added to shopping list`);
    }
  };
  
  const handleLogConsumption = (id: string, amount: number) => {
    const updatedItems = inventoryItems.map(item => {
      if (item.id === id) {
        const updatedQuantity = Math.max(0, item.quantity - amount);
        return {
          ...item,
          quantity: updatedQuantity
        };
      }
      return item;
    });
    
    setInventoryItems(updatedItems);
    toast.success("Consumption logged successfully");
  };
  
  // Filter items based on search term, category, and status
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    
    let matchesStatus = true;
    if (selectedStatus !== 'All Status') {
      const today = new Date();
      const expiryDate = new Date(item.expiryDate);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (selectedStatus === 'Fresh' && daysUntilExpiry > 7) {
        matchesStatus = true;
      } else if (selectedStatus === 'Expiring Soon' && daysUntilExpiry >= 0 && daysUntilExpiry <= 7) {
        matchesStatus = true;
      } else if (selectedStatus === 'Expired' && daysUntilExpiry < 0) {
        matchesStatus = true;
      } else {
        matchesStatus = false;
      }
    }
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search items..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-40">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <select 
              className="w-full pl-9 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 w-full md:w-36"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <div className="flex border rounded-md overflow-hidden">
            <button 
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-background'}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <Grid className="h-5 w-5" />
            </button>
            <button 
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-background'}`}
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          
          <Button className="flex items-center gap-2" onClick={() => setAddItemDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>
      
      <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4"}>
        {filteredItems.map(item => (
          <ItemCard 
            key={item.id} 
            item={item} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddToShoppingList={handleAddToShoppingList}
            onLogConsumption={handleLogConsumption}
          />
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found. Try adjusting your filters or add new items.</p>
        </div>
      )}
      
      {/* Add Item Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={newItemForm.handleSubmit(handleAddItem)} className="space-y-4 py-4">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...newItemForm.register('name')}
                  placeholder="Item name"
                  required
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={(value) => newItemForm.setValue('category', value)}
                defaultValue={newItemForm.getValues('category')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== 'All Categories').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
            
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...newItemForm.register('quantity', { valueAsNumber: true })}
                    min="0"
                    step="0.1"
                    required
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input
                    {...newItemForm.register('unit')}
                    placeholder="e.g., lbs, oz, count"
                    required
                  />
                </FormControl>
              </FormItem>
            </div>
            
            <FormItem>
              <FormLabel>Purchase Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...newItemForm.register('purchaseDate')}
                  required
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...newItemForm.register('expiryDate')}
                  required
                />
              </FormControl>
            </FormItem>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddItemDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryList;
