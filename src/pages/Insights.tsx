
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  BarChart,
  PieChart,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

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

// Category spending data
const categorySpendData = [
  { name: 'Meat', value: 29, color: '#FF4D4F' },
  { name: 'Vegetables', value: 17, color: '#52C41A' },
  { name: 'Dairy', value: 21, color: '#1890FF' },
  { name: 'Fruits', value: 11, color: '#FFA940' },
  { name: 'Bakery', value: 7, color: '#722ED1' },
  { name: 'Other', value: 14, color: '#BFBFBF' },
];

const Insights = () => {
  return (
    <div className="page-container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Consumption Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Understand your shopping habits and reduce waste
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-semibold">Monthly Spend</h2>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Food Waste Reduction</h2>
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Zap className="h-5 w-5 text-blue-500 mr-2" />
              <h2 className="text-lg font-semibold">AI Optimization</h2>
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <BarChart className="h-5 w-5 text-primary mr-2" />
              <h2 className="text-lg font-semibold">Weekly Spending Trend</h2>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklySpendingData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis 
                    domain={[0, 'dataMax + 20']} 
                    axisLine={false} 
                    tickLine={false} 
                    tickCount={5}
                  />
                  <Tooltip />
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

        <Card>
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
                  <Tooltip formatter={(value) => `${value}%`} />
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

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center mb-4">
            <TrendingDown className="h-5 w-5 text-green-500 mr-2" />
            <h2 className="text-lg font-semibold">Food Waste Tracking</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Your food waste has decreased by 12% compared to last month. Here's a breakdown:
          </p>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Vegetables</span>
                <span className="text-green-500 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  3%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '18%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">18% of vegetables were wasted</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Fruits</span>
                <span className="text-green-500 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  5%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '12%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">12% of fruits were wasted</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Dairy</span>
                <span className="text-red-500 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  2%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '8%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">8% of dairy products were wasted</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">Meat</span>
                <span className="text-green-500 flex items-center">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  2%
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '5%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">5% of meat was wasted</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Insights;
