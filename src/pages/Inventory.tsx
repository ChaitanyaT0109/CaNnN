
import React from 'react';
import InventoryList from '../components/inventory/InventoryList';

const Inventory = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Inventory Management</h1>
      <p className="text-muted-foreground mb-6">
        Track, manage, and optimize your groceries and pantry items.
      </p>
      <InventoryList />
    </div>
  );
};

export default Inventory;
