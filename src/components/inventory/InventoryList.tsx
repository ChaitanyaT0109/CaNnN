
import React, { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import ItemCard, { InventoryItem } from '../ui-elements/ItemCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  'All',
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

const InventoryList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const handleEdit = (id: string) => {
    console.log('Edit item', id);
    // Implementation for editing would go here
  };
  
  const handleDelete = (id: string) => {
    console.log('Delete item', id);
    // Implementation for deleting would go here
  };
  
  // Filter items based on search term and category
  const filteredItems = sampleInventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-slide-in">
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
          
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map(item => (
          <ItemCard 
            key={item.id} 
            item={item} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found. Try adjusting your filters or add new items.</p>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
