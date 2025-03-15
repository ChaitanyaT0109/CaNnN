
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  BarChart,
  PieChart,
  Zap,
  ArrowLeft,
  ArrowRight,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Weekly spending data
const weeklySpendingData = [
  { name: 'Week 1', value: 72 },
  { name: 'Week 2', value: 65 },
  { name: 'Week 3', value: 79 },
  { name: 'Week 4', value: 67 },
  { name: 'Week 5', value: 55 },
  { name: 'Week 6', value: 60 },
  { name: 'This Week', value: 68 },
];

// Monthly spending data
const monthlySpendingData = [
  { name: 'Jan', value: 280 },
  { name: 'Feb', value: 250 },
  { name: 'Mar', value: 300 },
  { name: 'Apr', value: 267 },
  { name: 'May', value: 290 },
  { name: 'Jun', value: 260 },
];

// Category spending data
const categorySpendData = [
  { name: 'Meat', value: 29, color: '#FF4D4F' },
  { name: 'Vegetables', value: 17, color: '#52C41A' },
  { name: 'Dairy', value: 21, color: '#1890FF' },
  { name: 'Fruits', value: 11, color: '#FFA940' },
  { name: 'Bakery', value: 7, color: '#722ED1' },
  { name: 'Other', value: 14, color: '#BFBFBF' },
];

// Waste tracking data by month
const wasteTrackingData = [
  {
    month: "March",
    category: "Vegetables",
    wastePct: 18,
    changeVsPrev: -3,
    trend: "down",
  },
  {
    month: "March",
    category: "Fruits",
    wastePct: 12,
    changeVsPrev: -5,
    trend: "down",
  },
  {
    month: "March",
    category: "Dairy",
    wastePct: 8,
    changeVsPrev: 2,
    trend: "up",
  },
  {
    month: "March",
    category: "Meat",
    wastePct: 5,
    changeVsPrev: -2,
    trend: "down",
  },
  {
    month: "February",
    category: "Vegetables",
    wastePct: 21,
    changeVsPrev: -1,
    trend: "down",
  },
  {
    month: "February", 
    category: "Fruits",
    wastePct: 17,
    changeVsPrev: -2,
    trend: "down",
  },
  {
    month: "February",
    category: "Dairy",
    wastePct: 6,
    changeVsPrev: -3,
    trend: "down",
  },
  {
    month: "February",
    category: "Meat",
    wastePct: 7,
    changeVsPrev: 1,
    trend: "up",
  },
];

const Insights = () => {
  const [timeFrame, setTimeFrame] = useState<'weekly' | 'monthly'>('weekly');
  const [currentMonth, setCurrentMonth] = useState<string>("March");
  
  const currentWasteData = wasteTrackingData.filter(item => item.month === currentMonth);
  
  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth === "March" ? "February" : "March");
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(currentMonth === "February" ? "March" : "February");
  };
  
  const calculateOverallChange = () => {
    const currentMonthData = wasteTrackingData.filter(item => item.month === currentMonth);
    const totalChanges = currentMonthData.reduce((acc, curr) => acc + curr.changeVsPrev, 0);
    const avgChange = totalChanges / currentMonthData.length;
    return avgChange;
  };
  
  const overallWasteChange = calculateOverallChange();

  return (
    <div className="page-container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Consumption Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Understand your shopping habits and reduce waste
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-semibold">Monthly Spend</h2>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your total spending on groceries for this month</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">$267.50</p>
              <p className="text-sm text-muted-foreground">This Month</p>
              <div className="flex items-center justify-center mt-2 text-green-500">
                <TrendingDown className="h-4 w-4 mr-1" />
                <span className="text-sm">5% vs Last Month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Food Waste Reduction</h2>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Percentage of purchased food that was consumed vs wasted</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-green-500">82%</p>
              <p className="text-sm text-muted-foreground">Food Utilized</p>
              <div className="flex items-center justify-center mt-2 text-green-500">
                <TrendingUp className="h-4 w-4 mr-1" />
                <span className="text-sm">12% vs Last Month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Zap className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold">AI Optimization</h2>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Estimated savings from AI-powered suggestions</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-500">$43.20</p>
              <p className="text-sm text-muted-foreground">Estimated Savings</p>
              <p className="text-xs text-muted-foreground mt-2">
                Based on AI-recommended shopping list and meal planning
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-primary mr-2" />
                <h2 className="text-lg font-semibold">Spending Trend</h2>
              </div>
              <div className="flex">
                <Button 
                  variant={timeFrame === 'weekly' ? 'default' : 'outline'} 
                  className="text-xs h-8 px-3 rounded-r-none"
                  onClick={() => setTimeFrame('weekly')}
                >
                  Weekly
                </Button>
                <Button 
                  variant={timeFrame === 'monthly' ? 'default' : 'outline'} 
                  className="text-xs h-8 px-3 rounded-l-none"
                  onClick={() => setTimeFrame('monthly')}
                >
                  Monthly
                </Button>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeFrame === 'weekly' ? weeklySpendingData : monthlySpendingData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    padding={{ left: 10, right: 10 }}
                  />
                  <YAxis 
                    domain={[0, 'dataMax + 20']} 
                    axisLine={false} 
                    tickLine={false} 
                    tickCount={5}
                    width={40}
                  />
                  <RechartsTooltip
                    formatter={(value) => [`$${value}`, 'Spending']}
                    labelFormatter={(label) => `${label}`}
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#10B981", strokeWidth: 0 }}
                    name="Spending ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <PieChart className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-semibold">Spending by Category</h2>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categorySpendData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categorySpendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => [`${value}%`, 'of Budget']}
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    payload={
                      categorySpendData.map(item => ({
                        value: item.name,
                        type: 'square',
                        color: item.color,
                      }))
                    }
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="transition-all hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Food Waste Tracking</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={handlePrevMonth}
                disabled={currentMonth === "February"}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{currentMonth}</span>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-8 w-8"
                onClick={handleNextMonth}
                disabled={currentMonth === "March"}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6">
            Your food waste has {overallWasteChange < 0 ? "decreased" : "increased"} by {Math.abs(overallWasteChange)}% compared to last month. Here's a breakdown:
          </p>
          
          <div className="space-y-6">
            {currentWasteData.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{item.category}</span>
                  <span className={`${item.trend === 'down' ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                    {item.trend === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
                    {Math.abs(item.changeVsPrev)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${item.wastePct}%` }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.wastePct}% of {item.category.toLowerCase()} were wasted</p>
              </div>
            ))}
          </div>
          
          <Tabs defaultValue="tips" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tips">Waste Reduction Tips</TabsTrigger>
              <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="tips" className="mt-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 mt-0.5">•</span>
                  <span>Store leafy greens with a paper towel to absorb excess moisture</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 mt-0.5">•</span>
                  <span>Freeze overripe fruits for smoothies instead of discarding</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 mt-0.5">•</span>
                  <span>Plan meals around items that will expire soon</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-green-100 text-green-800 p-1 rounded mr-2 mt-0.5">•</span>
                  <span>Use proper storage containers to extend food freshness</span>
                </li>
              </ul>
            </TabsContent>
            <TabsContent value="analysis" className="mt-4">
              <p className="text-sm mb-2">Your biggest improvement has been in reducing fruit waste. Continue to:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 p-1 rounded mr-2 mt-0.5">→</span>
                  <span>Buy smaller quantities more frequently rather than bulk purchasing</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 p-1 rounded mr-2 mt-0.5">→</span>
                  <span>Focus on improving dairy storage and consumption tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 p-1 rounded mr-2 mt-0.5">→</span>
                  <span>Consider meal prepping to ensure all groceries are used</span>
                </li>
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Insights;
