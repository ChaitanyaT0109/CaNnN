
import React from 'react';
import { Button } from '@/components/ui/button';
import GlassCard from '../components/ui-elements/GlassCard';
import StatCard from '../components/ui-elements/StatCard';
import { Progress } from '@/components/ui/progress';
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Utensils,
  ShoppingCart,
  Trash2,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data for charts and statistics
const weeklySpendData = [
  { name: 'Mon', amount: 32 },
  { name: 'Tue', amount: 18 },
  { name: 'Wed', amount: 0 },
  { name: 'Thu', amount: 45 },
  { name: 'Fri', amount: 25 },
  { name: 'Sat', amount: 62 },
  { name: 'Sun', amount: 10 },
];

const categorySpendData = [
  { name: 'Dairy', amount: 85 },
  { name: 'Produce', amount: 124 },
  { name: 'Meat', amount: 156 },
  { name: 'Grains', amount: 63 },
  { name: 'Snacks', amount: 47 },
  { name: 'Drinks', amount: 38 },
];

const foodWasteStats = [
  { category: 'Vegetables', percent: 18, trend: -3 },
  { category: 'Fruits', percent: 12, trend: -5 },
  { category: 'Dairy', percent: 8, trend: 2 },
  { category: 'Meat', percent: 5, trend: -2 },
];

const Insights = () => {
  return (
    <div className="page-container">
      <h1 className="page-title">Consumption Insights</h1>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-lg font-medium">August 2023</div>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-in">
        <StatCard
          title="Total Spend"
          value="$312.45"
          icon={DollarSign}
          trend={{ value: 8.5, isPositive: false }}
          description="This month"
        />
        <StatCard
          title="Items Purchased"
          value="145"
          icon={ShoppingCart}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Meals Prepared"
          value="38"
          icon={Utensils}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Food Waste"
          value="14%"
          icon={Trash2}
          trend={{ value: 3, isPositive: true }}
          description="3% less than last month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GlassCard className="p-6 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Weekly Spending</h2>
            <div className="text-sm font-medium text-primary">$192.45</div>
          </div>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                amount: { theme: { light: "#3b82f6" } },
              }}
            >
              <BarChart data={weeklySpendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip
                  content={
                    <ChartTooltipContent />
                  }
                />
                <Bar dataKey="amount" name="Amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </GlassCard>

        <GlassCard className="p-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Spending by Category</h2>
            <div className="text-sm font-medium text-primary">This Month</div>
          </div>
          <div className="h-[300px]">
            <ChartContainer
              config={{
                amount: { theme: { light: "#8b5cf6" } },
              }}
            >
              <BarChart data={categorySpendData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <ChartTooltip
                  content={
                    <ChartTooltipContent />
                  }
                />
                <Bar dataKey="amount" name="Amount" fill="var(--color-amount)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
        </GlassCard>
      </div>

      <h2 className="section-title mb-4">Food Waste Analysis</h2>
      <GlassCard className="p-6 mb-8 animate-slide-in" style={{ animationDelay: '0.3s' }}>
        <p className="text-muted-foreground mb-6">
          Based on your tracking, here's how much of each food category you're wasting:
        </p>
        <div className="space-y-6">
          {foodWasteStats.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.category}</span>
                  <span className="text-xs text-muted-foreground">({item.percent}% wasted)</span>
                </div>
                <div className="flex items-center">
                  {item.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                  )}
                  <span className={`text-xs ${item.trend > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {Math.abs(item.trend)}%
                  </span>
                </div>
              </div>
              <Progress value={100 - item.percent} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {item.trend > 0
                  ? `Waste has increased by ${item.trend}% compared to last month`
                  : `Waste has decreased by ${Math.abs(item.trend)}% compared to last month`}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 animate-slide-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">Cost Efficiency</h2>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Bulk Purchases</span>
                <span className="text-green-500 font-medium">-$24.50</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Buying rice, pasta, and beans in bulk saved you $24.50 this month.
              </p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Seasonal Produce</span>
                <span className="text-green-500 font-medium">-$18.75</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Purchasing seasonal fruits and vegetables reduced your spending by $18.75.
              </p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Store Comparison</span>
                <span className="text-green-500 font-medium">-$32.10</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Shopping at recommended stores for specific items saved you $32.10.
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 animate-slide-in" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">AI Recommendations</h2>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-secondary rounded-lg">
              <p className="font-medium mb-1">Reduce Fruit Purchases</p>
              <p className="text-sm text-muted-foreground">
                You're consistently wasting bananas. Try buying fewer or freezing them for smoothies.
              </p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <p className="font-medium mb-1">Shop at Trader Joe's for Produce</p>
              <p className="text-sm text-muted-foreground">
                Data shows you save 15% on average when buying produce at Trader Joe's vs. Safeway.
              </p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <p className="font-medium mb-1">Meal Prep on Sundays</p>
              <p className="text-sm text-muted-foreground">
                Your data shows lower food waste during weeks when you prepare meals on Sundays.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Insights;
