import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Clock, 
  MapPin, 
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from "lucide-react";

interface AnalyticsData {
  totalJobs: number;
  successfulJobs: number;
  averageEarnings: number;
  totalEarnings: number;
  averageJobTime: number;
  topAreas: Array<{ area: string; jobs: number; earnings: number }>;
  weeklyStats: Array<{ day: string; jobs: number; earnings: number }>;
  successRate: number;
  peakHours: Array<{ hour: number; jobs: number }>;
}

interface AdvancedAnalyticsProps {
  customerId: string;
  customerData: any;
}

export default function AdvancedAnalytics({ customerId, customerData }: AdvancedAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [loading, setLoading] = useState(true);

  // Mock analytics data - in real implementation, fetch from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData: AnalyticsData = {
        totalJobs: customerData?.extensionUsageCount || 0,
        successfulJobs: customerData?.extensionSuccessfulJobs || 0,
        averageEarnings: 12.50,
        totalEarnings: 456.75,
        averageJobTime: 28,
        successRate: customerData?.extensionUsageCount > 0 
          ? Math.round((customerData.extensionSuccessfulJobs / customerData.extensionUsageCount) * 100) 
          : 0,
        topAreas: [
          { area: "Downtown", jobs: 15, earnings: 187.50 },
          { area: "University District", jobs: 12, earnings: 150.00 },
          { area: "Business Center", jobs: 8, earnings: 119.25 }
        ],
        weeklyStats: [
          { day: "Mon", jobs: 3, earnings: 45.50 },
          { day: "Tue", jobs: 5, earnings: 62.25 },
          { day: "Wed", jobs: 4, earnings: 58.00 },
          { day: "Thu", jobs: 6, earnings: 78.75 },
          { day: "Fri", jobs: 8, earnings: 105.50 },
          { day: "Sat", jobs: 12, earnings: 168.25 },
          { day: "Sun", jobs: 7, earnings: 98.50 }
        ],
        peakHours: [
          { hour: 11, jobs: 8 },
          { hour: 12, jobs: 12 },
          { hour: 13, jobs: 10 },
          { hour: 18, jobs: 15 },
          { hour: 19, jobs: 18 },
          { hour: 20, jobs: 14 }
        ]
      };
      setAnalytics(mockData);
      setLoading(false);
    }, 1000);
  }, [customerId, timeRange, customerData]);

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return "text-green-600 bg-green-50";
    if (rate >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getPerformanceInsights = () => {
    const insights = [];
    
    if (analytics.successRate < 50) {
      insights.push({
        type: 'warning',
        title: 'Low Success Rate',
        message: 'Consider adjusting your area settings or minimum order requirements to improve job acceptance.',
        action: 'Optimize Settings'
      });
    }
    
    if (analytics.averageEarnings < 10) {
      insights.push({
        type: 'info',
        title: 'Earnings Potential',
        message: 'Focus on peak hours (6-8 PM) and high-value areas to increase your average earnings.',
        action: 'View Peak Times'
      });
    }
    
    if (analytics.totalJobs > 50 && analytics.successRate > 70) {
      insights.push({
        type: 'success',
        title: 'Excellent Performance!',
        message: 'Your job selection strategy is working well. Keep focusing on your top-performing areas.',
        action: 'View Top Areas'
      });
    }

    return insights;
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map(range => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalJobs}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round(analytics.totalJobs * 0.12)} from last {timeRange}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.successRate}%</div>
            <Badge variant="outline" className={getSuccessRateColor(analytics.successRate)}>
              {analytics.successRate >= 70 ? 'Excellent' : analytics.successRate >= 40 ? 'Good' : 'Needs Work'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{analytics.averageEarnings}</div>
            <p className="text-xs text-muted-foreground">
              Per successful job
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Job Time</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageJobTime}min</div>
            <p className="text-xs text-muted-foreground">
              Including delivery time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      {getPerformanceInsights().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getPerformanceInsights().map((insight, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.message}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {insight.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="areas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="areas" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Top Areas
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Weekly Stats
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Peak Hours
          </TabsTrigger>
        </TabsList>

        <TabsContent value="areas">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topAreas.map((area, index) => (
                  <div key={area.area} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      <div>
                        <h4 className="font-medium">{area.area}</h4>
                        <p className="text-sm text-gray-600">{area.jobs} jobs completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{area.earnings}</p>
                      <p className="text-sm text-gray-600">
                        €{(area.earnings / area.jobs).toFixed(2)} avg
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.weeklyStats.map((day) => (
                  <div key={day.day} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="w-12 text-center font-medium">{day.day}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">{day.jobs} jobs</span>
                        <span className="font-medium">€{day.earnings}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(day.jobs / 12) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {analytics.peakHours.map((hour) => (
                  <div key={hour.hour} className="p-3 border rounded-lg text-center">
                    <div className="text-lg font-bold">
                      {hour.hour}:00 - {hour.hour + 1}:00
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{hour.jobs}</div>
                    <div className="text-sm text-gray-600">jobs completed</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}