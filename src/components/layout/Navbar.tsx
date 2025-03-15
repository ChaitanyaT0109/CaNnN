
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, ShoppingCart, Calendar, Clock, BarChart, Settings } from 'lucide-react';

const Navbar = () => {
  const navItems = [
    { path: '/', name: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    { path: '/inventory', name: 'Inventory', icon: <Package className="w-5 h-5" /> },
    { path: '/shopping-list', name: 'Shopping List', icon: <ShoppingCart className="w-5 h-5" /> },
    { path: '/meal-planning', name: 'Meal Planning', icon: <Calendar className="w-5 h-5" /> },
    { path: '/expiry-tracking', name: 'Expiry Tracking', icon: <Clock className="w-5 h-5" /> },
    { path: '/insights', name: 'Insights', icon: <BarChart className="w-5 h-5" /> },
    { path: '/settings', name: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border shadow-sm overflow-y-auto">
      <div className="p-6">
        <h1 className="text-xl font-display font-bold tracking-tight">PantryPal</h1>
      </div>
      <nav className="mt-2 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => 
              `nav-item ${isActive ? 'nav-item-active' : ''}`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-6 mt-auto">
        <div className="glass-card rounded-lg p-4">
          <p className="text-sm font-medium mb-1">Quick Tips</p>
          <p className="text-sm text-muted-foreground">Use barcode scanning to quickly add items to your inventory.</p>
        </div>
      </div>
    </aside>
  );
};

export default Navbar;
