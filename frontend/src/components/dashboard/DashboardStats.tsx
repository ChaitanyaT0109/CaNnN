
import React from 'react';
import StatCard from '../ui-elements/StatCard';
import { Package, Clock, DollarSign, Lightbulb } from 'lucide-react';

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Items Running Low" 
        value="5"
        description="Items below threshold"
        icon={Package}
      />
      <StatCard 
        title="Expiring Soon" 
        value="8"
        description="Items expiring this week"
        icon={Clock}
      />
      <StatCard 
        title="Weekly Grocery Spend" 
        value="$86.52"
        trend={{ value: 12, isPositive: false }}
        icon={DollarSign}
      />
      <StatCard 
        title="Food Waste Score" 
        value="8.5/10"
        description="Better than last week"
        trend={{ value: 5, isPositive: true }}
        icon={Lightbulb}
      />
    </div>
  );
};

export default DashboardStats;
