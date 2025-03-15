
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Grid, List as ListIcon } from 'lucide-react';
import ItemCard, { InventoryItem } from '../components/ui-elements/ItemCard';

// Sample data for demonstration
const sampleInventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Milk',
    category: 'Dairy',
    quantity: 1,
    unit: 'gallon',
    purchaseDate: '2023-03-12',
    expiryDate: '2023-03-20',
  },
  {
    id: '2',
    name: 'Eggs',
    category: 'Dairy',
    quantity: 12,
    unit: 'count',
    purchaseDate: '2023-03-13',
    expiryDate: '2023-03-25',
  },
  {
    id: '3',
    name: 'Spinach',
    category: 'Produce',
    quantity: 1,
    unit: 'bunch',
    purchaseDate: '2023-03-11',
    expiryDate: '2023-03-17',
  },
  {
    id: '4',
    name: 'Chicken Breast',
    category: 'Meat & Seafood',
    quantity: 2,
    unit: 'lbs',
    purchaseDate: '2023-03-08',
    expiryDate: '2023-03-14',
  },
  {
    id: '5',
    name: 'Bread',
    category: 'Bakery',
    quantity: 1,
    unit: 'loaf',
    purchaseDate: '2023-03-13',
    expiryDate: '2023-03-18',
  },
  {
    id: '6',
    name: 'Rice',
    category: 'Pantry',
    quantity: 5,
    unit: 'lbs',
    purchaseDate: '2023-02-13',
    expiryDate: '2023-09-11',
  },
  {
    id: '7',
    name: 'Frozen Pizza',
    category: 'Frozen',
    quantity: 2,
    unit: 'count',
    purchaseDate: '2023-03-05',
    expiryDate: '2023-06-05',
  },
  {
    id: '8',
    name: 'Orange Juice',
    category: 'Beverages',
    quantity: 1,
    unit: 'gallon',
    purchaseDate: '2023-03-10',
    expiryDate: '2023-03-24',
  },
  {
    id: '9',
    name: 'Potato Chips',
    category: 'Snacks',
    quantity: 1,
    unit: 'bag',
    purchaseDate: '2023-03-09',
    expiryDate: '2023-05-09',
  },
];

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

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter items based on search term, category, and status
  const filteredItems = sampleInventoryItems.filter(item => {
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
    <div className="page-container max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage your groceries and track their expiration dates
          </p>
        </div>
        <Button size="lg" className="gap-2">
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
      
      <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
        {filteredItems.map(item => (
          <ItemCard 
            key={item.id} 
            item={item}
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

export default Inventory;
