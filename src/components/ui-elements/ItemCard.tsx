
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
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
  
  const expiryStatusColor = 
    isExpired ? 'bg-red-100 text-red-800' :
    isExpiringVery ? 'bg-amber-100 text-amber-800' :
    isExpiringSoon ? 'bg-yellow-100 text-yellow-800' :
    'bg-green-100 text-green-800';
  
  const expiryText = 
    isExpired ? `Expired ${Math.abs(daysUntilExpiry)} days ago` :
    daysUntilExpiry === 0 ? 'Expires today' :
    daysUntilExpiry === 1 ? 'Expires tomorrow' :
    `Expires in ${daysUntilExpiry} days`;

  return (
    <div className={cn("item-card", className)}>
      <div className="flex justify-between">
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <div className="flex items-center mt-1">
            <span className="text-sm text-muted-foreground">
              {item.quantity} {item.unit}
            </span>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="text-xs inline-block px-2 py-0.5 rounded-full bg-secondary">
              {item.category}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button 
              onClick={() => onEdit(item.id)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(item.id)}
              className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-3">
        <span className={cn(
          "text-xs px-2 py-1 rounded-full font-medium",
          expiryStatusColor
        )}>
          {expiryText}
        </span>
      </div>
    </div>
  );
};

export default ItemCard;
