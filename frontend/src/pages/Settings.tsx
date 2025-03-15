
import React from 'react';
import GlassCard from '../components/ui-elements/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Home, Bell, Moon, Sun, Store } from 'lucide-react';

const Settings = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-medium text-lg">Alex Johnson</h2>
                <p className="text-sm text-muted-foreground">alex.johnson@example.com</p>
              </div>
            </div>
            
            <nav className="space-y-1">
              <a href="#profile" className="nav-item nav-item-active">
                <User className="h-4 w-4" />
                <span>Profile Settings</span>
              </a>
              <a href="#notifications" className="nav-item">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </a>
              <a href="#appearance" className="nav-item">
                <Sun className="h-4 w-4" />
                <span>Appearance</span>
              </a>
              <a href="#smart-home" className="nav-item">
                <Home className="h-4 w-4" />
                <span>Smart Home Integration</span>
              </a>
              <a href="#stores" className="nav-item">
                <Store className="h-4 w-4" />
                <span>Preferred Stores</span>
              </a>
            </nav>
          </GlassCard>
        </div>
        
        <div className="md:col-span-2">
          <section id="profile" className="animate-slide-in">
            <h2 className="section-title">Profile Settings</h2>
            <GlassCard className="p-6 mb-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <Input type="text" defaultValue="Alex" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <Input type="text" defaultValue="Johnson" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <Input type="email" defaultValue="alex.johnson@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Household Size</label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option>1 person</option>
                    <option selected>2 people</option>
                    <option>3 people</option>
                    <option>4 people</option>
                    <option>5+ people</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dietary Preferences</label>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="vegetarian" className="mr-2" />
                      <label htmlFor="vegetarian" className="text-sm">Vegetarian</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="vegan" className="mr-2" />
                      <label htmlFor="vegan" className="text-sm">Vegan</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="gluten-free" className="mr-2" />
                      <label htmlFor="gluten-free" className="text-sm">Gluten-free</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="dairy-free" className="mr-2" />
                      <label htmlFor="dairy-free" className="text-sm">Dairy-free</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="keto" className="mr-2" />
                      <label htmlFor="keto" className="text-sm">Keto</label>
                    </div>
                  </div>
                </div>
                <Button className="mt-2">Save Changes</Button>
              </div>
            </GlassCard>
          </section>
          
          <section id="appearance" className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
            <h2 className="section-title">Appearance</h2>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-muted-foreground" />
                  <div className="w-12 h-6 bg-secondary rounded-full p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-primary rounded-full transform translate-x-0"></div>
                  </div>
                  <Moon className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Color Theme</h3>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary rounded-full border-2 border-secondary cursor-pointer"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full cursor-pointer"></div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full cursor-pointer"></div>
                  <div className="w-8 h-8 bg-green-500 rounded-full cursor-pointer"></div>
                  <div className="w-8 h-8 bg-amber-500 rounded-full cursor-pointer"></div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">Reset to Default</Button>
            </GlassCard>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
