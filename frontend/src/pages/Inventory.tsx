import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Grid, List as ListIcon, MoreVertical, Edit, Trash, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { toast } from '@/components/ui/toast'; // Assuming you have a toast component

// Define the InventoryItem type
export interface InventoryItem {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate?: string;
  expiryDate?: string;
  boughtDate?: string; // For backend compatibility
}

// API endpoints
const API_URL = 'http://localhost:5000/api/v1';

// Categories and units
const categories = [
  'All Categories',
  'Dairy',
  'Produce',
  'Meat & Seafood',
  'Bakery',
  'Pantry',
  'Frozen',
  'Beverages',
  'Snacks',
];

const statuses = [
  'All Status',
  'Fresh',
  'Expiring Soon',
  'Expired',
];

const units = [
  'kg',
  'g',
  'litre',
  'ml',
  'count',
  'pack',
  'bunch',
  'loaf',
];

const ItemCard = ({ item, onEdit, onDelete, onLogConsumption }: { 
  item: InventoryItem, 
  onEdit: (item: InventoryItem) => void,
  onDelete: (id: string) => void,
  onLogConsumption: (id: string) => void
}) => {
  const today = new Date();
  const expiryDate = new Date(item.expiryDate || item.boughtDate || '');
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let statusClass = 'text-green-600';
  let statusText = 'Fresh';

  if (daysUntilExpiry < 0) {
    statusClass = 'text-red-600';
    statusText = 'Expired';
  } else if (daysUntilExpiry <= 7) {
    statusClass = 'text-amber-500';
    statusText = 'Expiring Soon';
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <span className="inline-block px-2 py-1 text-xs rounded-full bg-primary/10 text-primary-foreground mt-1">
            {item.category}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLogConsumption(item._id || item.id || '')}>
              <Check className="h-4 w-4 mr-2" />
              Log Consumption
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(item._id || item.id || '')}
              className="text-red-600"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between text-sm">
          <span>Quantity:</span>
          <span>{item.quantity} {item.unit}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span>Expires:</span>
          <span className={statusClass}>{statusText} {daysUntilExpiry < 0 ? `(${Math.abs(daysUntilExpiry)} days ago)` : daysUntilExpiry === 0 ? '(today)' : `(in ${daysUntilExpiry} days)`}</span>
        </div>
      </div>
    </div>
  );
};

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add/Edit Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConsumptionDialogOpen, setIsConsumptionDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'Dairy',
    quantity: 1,
    unit: 'kg',
    purchaseDate: format(new Date(), 'yyyy-MM-dd'),
    expiryDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  });
  const [consumptionQuantity, setConsumptionQuantity] = useState(1);

  // Fetch inventory items from API
  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/foods`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Map backend data to our frontend format if needed
      const mappedData = data.map((item: any) => ({
        _id: item._id,
        id: item._id, // Keep both for compatibility
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        purchaseDate: item.boughtDate,
        expiryDate: item.expiryDate,
        boughtDate: item.boughtDate,
      }));
      
      setInventoryItems(mappedData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch inventory items');
      console.error('Error fetching inventory items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load inventory items on component mount
  useEffect(() => {
    fetchInventoryItems();
  }, []);

  // Filter items based on search term, category, and status
  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All Categories' || item.category === selectedCategory;
    
    let matchesStatus = true;
    if (selectedStatus !== 'All Status') {
      const today = new Date();
      const expiryDate = new Date(item.expiryDate || item.boughtDate || '');
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

  // Handler for opening add dialog
  const handleAddItem = () => {
    setNewItem({
      name: '',
      category: 'Dairy',
      quantity: 1,
      unit: 'kg',
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      expiryDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    });
    setIsAddDialogOpen(true);
  };

  // Handler for saving new item
  const handleSaveNewItem = async () => {
    if (newItem.name && newItem.category && newItem.quantity && newItem.unit && newItem.purchaseDate && newItem.expiryDate) {
      try {
        const itemToAdd = {
          name: newItem.name,
          category: newItem.category,
          quantity: Number(newItem.quantity),
          unit: newItem.unit,
          boughtDate: newItem.purchaseDate, // Map to backend field
          expiryDate: newItem.expiryDate,
        };
        
        const response = await fetch(`${API_URL}/foods`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemToAdd),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Refresh the inventory list
        await fetchInventoryItems();
        setIsAddDialogOpen(false);
        // toast.success('Item added successfully');
        console.log('Item added successfully');
      } catch (err) {
        // toast.error('Failed to add item');
        console.error('Error adding item:', err);
      }
    }
  };

  // Handler for editing item
  const handleEditItem = (item: InventoryItem) => {
    setCurrentItem(item);
    setNewItem({ 
      ...item,
      purchaseDate: item.purchaseDate || item.boughtDate,
    });
    setIsEditDialogOpen(true);
  };

  // Handler for saving edited item
  const handleSaveEditedItem = async () => {
    if (currentItem && newItem.name && newItem.category && newItem.quantity && newItem.unit) {
      try {
        const itemToUpdate = {
          name: newItem.name,
          category: newItem.category,
          quantity: Number(newItem.quantity),
          unit: newItem.unit,
          boughtDate: newItem.purchaseDate || newItem.boughtDate,
          expiryDate: newItem.expiryDate,
        };
        
        const id = currentItem._id || currentItem.id;
        
        const response = await fetch(`${API_URL}/foods/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(itemToUpdate),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Refresh the inventory list
        await fetchInventoryItems();
        setIsEditDialogOpen(false);
        // toast.success('Item updated successfully');
        console.log('Item updated successfully');
      } catch (err) {
        // toast.error('Failed to update item');
        console.error('Error updating item:', err);
      }
    }
  };

  // Handler for deleting item
  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/foods/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Refresh the inventory list
      await fetchInventoryItems();
      // toast.success('Item deleted successfully');
      console.log('Item deleted successfully');
    } catch (err) {
      // toast.error('Failed to delete item');
      console.error('Error deleting item:', err);
    }
  };
  
  // Handler for logging consumption
  const handleLogConsumption = (id: string) => {
    const item = inventoryItems.find(item => (item._id === id || item.id === id));
    if (item) {
      setCurrentItem(item);
      setConsumptionQuantity(1);
      setIsConsumptionDialogOpen(true);
    }
  };
  
  // Handler for saving consumption
  const handleSaveConsumption = async () => {
    if (currentItem) {
      try {
        const id = currentItem._id || currentItem.id;
        
        if (consumptionQuantity >= currentItem.quantity) {
          // If consuming all or more, delete the item
          await handleDeleteItem(id || '');
        } else {
          // Otherwise update the quantity
          const updatedItem = {
            ...currentItem,
            quantity: currentItem.quantity - consumptionQuantity,
          };
          
          const response = await fetch(`${API_URL}/foods/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedItem),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          // Refresh the inventory list
          await fetchInventoryItems();
        }
        
        setIsConsumptionDialogOpen(false);
        // toast.success('Consumption logged successfully');
        console.log('Consumption logged successfully');
      } catch (err) {
        // toast.error('Failed to log consumption');
        console.error('Error logging consumption:', err);
      }
    }
  };

  return (
    <div className="page-container max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your groceries and track their expiration dates
          </p>
        </div>
        <Button size="lg" className="gap-2" onClick={handleAddItem}>
          <Plus className="h-5 w-5" />
          Add Item
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search items..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
            >
              <Grid className="h-5 w-5" />
            </button>
            <button 
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-background'}`}
              onClick={() => setViewMode('list')}
            >
              <ListIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading inventory items...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchInventoryItems}>
            Retry
          </Button>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
          {filteredItems.map(item => (
            <ItemCard 
              key={item._id || item.id} 
              item={item}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onLogConsumption={handleLogConsumption}
            />
          ))}
        </div>
      )}
      
      {!loading && !error && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found. Try adjusting your filters or add new items.</p>
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newItem.name || ''}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <select
                id="category"
                value={newItem.category || 'Dairy'}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {categories.filter(c => c !== 'All Categories').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.1"
                value={newItem.quantity || ''}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                className="col-span-1"
              />
              <select
                id="unit"
                value={newItem.unit || 'kg'}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="col-span-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purchaseDate" className="text-right">
                Purchase Date
              </Label>
              <Input
                id="purchaseDate"
                type="date"
                value={newItem.purchaseDate || ''}
                onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiryDate" className="text-right">
                Expiry Date
              </Label>
              <Input
                id="expiryDate"
                type="date"
                value={newItem.expiryDate || ''}
                onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={newItem.name || ''}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <select
                id="edit-category"
                value={newItem.category || 'Dairy'}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {categories.filter(c => c !== 'All Categories').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                step="0.1"
                value={newItem.quantity || ''}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                className="col-span-1"
              />
              <select
                id="edit-unit"
                value={newItem.unit || 'kg'}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="col-span-2 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-purchaseDate" className="text-right">
                Purchase Date
              </Label>
              <Input
                id="edit-purchaseDate"
                type="date"
                value={newItem.purchaseDate || ''}
                onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-expiryDate" className="text-right">
                Expiry Date
              </Label>
              <Input
                id="edit-expiryDate"
                type="date"
                value={newItem.expiryDate || ''}
                onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedItem}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consumption Dialog */}
      <Dialog open={isConsumptionDialogOpen} onOpenChange={setIsConsumptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Consumption</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p>How much {currentItem?.name} did you consume?</p>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="consumption-quantity" className="text-right">
                Quantity
              </Label>
              <Input
                id="consumption-quantity"
                type="number"
                min="0.1"
                max={currentItem?.quantity}
                step="0.1"
                value={consumptionQuantity}
                onChange={(e) => setConsumptionQuantity(parseFloat(e.target.value))}
                className="col-span-1"
              />
              <span className="col-span-2">{currentItem?.unit} (Max: {currentItem?.quantity} {currentItem?.unit})</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConsumptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConsumption}>Log Consumption</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;