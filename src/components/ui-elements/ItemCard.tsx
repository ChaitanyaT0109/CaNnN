
import React from 'react';
import { Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ItemCard = ({ item, className, onEdit, onDelete }: ItemCardProps) => {
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

  return (
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
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                getStatusColor()
              )}>
                {getStatusLabel()}
              </span>
            </div>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
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
  );
};

export default ItemCard;
