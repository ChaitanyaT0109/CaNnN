
import React, { useState } from 'react';
import { Edit, Trash2, MoreHorizontal, ClipboardList, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useForm } from 'react-hook-form';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
  imageUrl?: string;
}

interface ItemCardProps {
  item: InventoryItem;
  className?: string;
  onEdit?: (id: string, updatedItem: Partial<InventoryItem>) => void;
  onDelete?: (id: string) => void;
  onAddToShoppingList?: (id: string) => void;
  onLogConsumption?: (id: string, amount: number) => void;
}

const ItemCard = ({ 
  item, 
  className, 
  onEdit, 
  onDelete,
  onAddToShoppingList,
  onLogConsumption 
}: ItemCardProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [consumptionDialogOpen, setConsumptionDialogOpen] = useState(false);
  const [consumptionAmount, setConsumptionAmount] = useState(1);
  
  // Calculate days until expiry
  const today = new Date();
  const expiryDate = new Date(item.expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Determine expiry status
  const isExpired = daysUntilExpiry < 0;
  const isExpiringVery = daysUntilExpiry >= 0 && daysUntilExpiry <= 3;
  const isExpiringSoon = daysUntilExpiry > 3 && daysUntilExpiry <= 7;
  
  // Get status label and color
  const getStatusLabel = () => {
    if (isExpired) return 'Expired';
    if (isExpiringVery) return 'Expiring Very Soon';
    if (isExpiringSoon) return 'Expiring Soon';
    return 'Fresh';
  };

  const getStatusColor = () => {
    if (isExpired) return 'bg-red-100 text-red-800';
    if (isExpiringVery) return 'bg-amber-100 text-amber-800';
    if (isExpiringSoon) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Get status dot color
  const getStatusDotColor = () => {
    if (isExpired) return 'bg-red-500';
    if (isExpiringVery || isExpiringSoon) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get card border color based on category
  const getCategoryColor = () => {
    switch (item.category.toLowerCase()) {
      case 'dairy':
        return 'border-blue-200';
      case 'meat & seafood':
      case 'meat':
        return 'border-pink-200';
      case 'produce':
      case 'vegetables':
        return 'border-green-200';
      case 'bakery':
        return 'border-yellow-200';
      case 'pantry':
        return 'border-orange-200';
      case 'frozen':
        return 'border-teal-200';
      case 'beverages':
        return 'border-purple-200';
      case 'snacks':
        return 'border-red-200';
      default:
        return 'border-gray-200';
    }
  };

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (updatedData: Partial<InventoryItem>) => {
    if (onEdit) {
      onEdit(item.id, updatedData);
    }
    setEditDialogOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(item.id);
    }
  };

  const handleLogConsumption = () => {
    setConsumptionDialogOpen(true);
  };

  const handleConsumptionSubmit = () => {
    if (onLogConsumption) {
      onLogConsumption(item.id, consumptionAmount);
    }
    setConsumptionDialogOpen(false);
  };

  const handleAddToShoppingList = () => {
    if (onAddToShoppingList) {
      onAddToShoppingList(item.id);
    }
  };

  // Form for editing item
  const editForm = useForm({
    defaultValues: {
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      purchaseDate: item.purchaseDate,
      expiryDate: item.expiryDate,
    }
  });

  return (
    <>
      <div className={cn(
        "rounded-lg border-2 p-4 bg-white shadow-sm", 
        getCategoryColor(),
        className
      )}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{item.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{item.category}</p>
            
            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Quantity</span>
                <span className="text-sm">{item.quantity} {item.unit}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Status</span>
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-2 h-2 rounded-full", getStatusDotColor())}></div>
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    getStatusColor()
                  )}>
                    {getStatusLabel()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-gray-400 hover:text-gray-600 p-1">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogConsumption}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Log Consumption
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddToShoppingList}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Shopping List
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-500 hover:text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="border-t mt-4 pt-4 text-sm text-gray-500 grid grid-cols-2 gap-2">
          <div>
            <p className="font-medium">Purchased:</p>
            <p>{new Date(item.purchaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <div>
            <p className="font-medium">Expires:</p>
            <p>{new Date(item.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update this grocery item's details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 py-4">
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  {...editForm.register('name')} 
                  placeholder="Item name" 
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select 
                  {...editForm.register('category')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="Dairy">Dairy</option>
                  <option value="Meat">Meat</option>
                  <option value="Produce">Produce</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Pantry">Pantry</option>
                  <option value="Frozen">Frozen</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Snacks">Snacks</option>
                </select>
              </FormControl>
            </FormItem>
            
            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...editForm.register('quantity', { valueAsNumber: true })} 
                    min="0" 
                    step="0.1" 
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input 
                    {...editForm.register('unit')} 
                    placeholder="e.g., lbs, oz, count" 
                  />
                </FormControl>
              </FormItem>
            </div>
            
            <FormItem>
              <FormLabel>Purchase Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...editForm.register('purchaseDate')} 
                />
              </FormControl>
            </FormItem>
            
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...editForm.register('expiryDate')} 
                />
              </FormControl>
            </FormItem>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Log Consumption Dialog */}
      <Dialog open={consumptionDialogOpen} onOpenChange={setConsumptionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log Consumption</DialogTitle>
            <DialogDescription>
              Record how much of this item you've used.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="text-lg font-medium">{item.name}</h3>
            <p className="text-sm text-muted-foreground">Current Amount: {item.quantity} {item.unit}</p>
            
            <div className="mt-6 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Amount Used</span>
              </div>
              <div className="flex gap-4">
                <Input 
                  type="number" 
                  value={consumptionAmount} 
                  onChange={(e) => setConsumptionAmount(parseFloat(e.target.value))}
                  min="0" 
                  max={item.quantity} 
                  step="0.1" 
                  className="w-full" 
                />
                <div className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm flex items-center">
                  {item.unit}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Remaining: {Math.max(0, item.quantity - consumptionAmount)} {item.unit}
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsumptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConsumptionSubmit}>
              Log Consumption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ItemCard;
