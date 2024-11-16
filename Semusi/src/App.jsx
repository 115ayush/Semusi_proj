import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Thermometer, Battery, Wind, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

// Custom Card Component
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-lg font-semibold text-gray-800">{children}</h3>
);

// Custom Alert Component
const Alert = ({ children }) => (
  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-center space-x-2 text-red-700">
    <AlertTriangle className="h-5 w-5" />
    <div>{children}</div>
  </div>
);

const App = () => {
  const [temperatureData, setTemperatureData] = useState([
    { time: '00:00', localTemp: 22, batteryTemp: 25 },
    { time: '03:00', localTemp: 21, batteryTemp: 24 },
    { time: '06:00', localTemp: 20, batteryTemp: 23 },
    { time: '09:00', localTemp: 23, batteryTemp: 28 },
    { time: '12:00', localTemp: 26, batteryTemp: 32 },
    { time: '15:00', localTemp: 28, batteryTemp: 35 },
    { time: '18:00', localTemp: 25, batteryTemp: 30 },
    { time: '21:00', localTemp: 23, batteryTemp: 27 }
  ]);

  const [timeRange, setTimeRange] = useState('24h');
  const [alerts, setAlerts] = useState([]);
  
  const calculateAmbientTemp = (localTemp, batteryTemp) => {
    return ((localTemp * 2 + batteryTemp) / 3).toFixed(1);
  };

  const calculateStats = (data, key) => {
    const values = data.map(item => item[key]);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
    };
  };

  const getTrend = (data, key) => {
    const last = data[data.length - 1][key];
    const prev = data[data.length - 2][key];
    return {
      direction: last > prev ? 'up' : 'down',
      change: Math.abs(last - prev).toFixed(1)
    };
  };

  useEffect(() => {
    // Check for temperature thresholds
    const latestData = temperatureData[temperatureData.length - 1];
    const newAlerts = [];

    if (latestData.batteryTemp > 30) {
      newAlerts.push({
        id: Date.now(),
        message: 'Battery temperature exceeding normal range'
      });
    }

    if (Math.abs(latestData.batteryTemp - latestData.localTemp) > 10) {
      newAlerts.push({
        id: Date.now() + 1,
        message: 'Large temperature differential detected'
      });
    }

    setAlerts(newAlerts);
  }, [temperatureData]);

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <Card className="relative overflow-hidden">
      <div className="pb-2">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`text-2xl font-bold ${color}`}>{value}°C</span>
            {trend && (
              <span className={`flex items-center text-sm ${trend.direction === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                {trend.direction === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                {trend.change}°C
              </span>
            )}
          </div>
        </div>
        <Icon className={`${color} opacity-80`} size={24} />
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Temperature Analysis Dashboard</h1>
            <p className="text-sm text-gray-500">
              {format(new Date(), 'EEEE, MMMM do yyyy')}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1 rounded-md ${timeRange === '24h' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              24h
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-md ${timeRange === '7d' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
            >
              7d
            </button>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map(alert => (
              <Alert key={alert.id}>{alert.message}</Alert>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Temperature Trends</CardTitle>
          </CardHeader>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={temperatureData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                <XAxis 
                  dataKey="time"
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis
                  label={{ 
                    value: 'Temperature (°C)',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 12 }
                  }}
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const localTemp = payload[0].value;
                      const batteryTemp = payload[1].value;
                      const ambientTemp = calculateAmbientTemp(localTemp, batteryTemp);
                      
                      return (
                        <div className="bg-white p-2 border border-gray-200 rounded-lg shadow-sm">
                          <p className="font-semibold">{label}</p>
                          <p className="text-blue-500">Local: {localTemp}°C</p>
                          <p className="text-red-500">Battery: {batteryTemp}°C</p>
                          <p className="text-emerald-500">Ambient: {ambientTemp}°C</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="localTemp"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Local Temperature"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="batteryTemp"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Battery Temperature"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Local Temperature"
            value={calculateStats(temperatureData, 'localTemp').avg}
            icon={Thermometer}
            trend={getTrend(temperatureData, 'localTemp')}
            color="text-blue-500"
          />
          <StatCard
            title="Battery Temperature"
            value={calculateStats(temperatureData, 'batteryTemp').avg}
            icon={Battery}
            trend={getTrend(temperatureData, 'batteryTemp')}
            color="text-red-500"
          />
          <StatCard
            title="Ambient Temperature"
            value={calculateAmbientTemp(
              temperatureData[temperatureData.length - 1].localTemp,
              temperatureData[temperatureData.length - 1].batteryTemp
            )}
            icon={Wind}
            color="text-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Temperature Statistics</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Local Temperature</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Min</p>
                    <p className="text-lg font-semibold text-blue-500">
                      {calculateStats(temperatureData, 'localTemp').min}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Max</p>
                    <p className="text-lg font-semibold text-blue-500">
                      {calculateStats(temperatureData, 'localTemp').max}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg</p>
                    <p className="text-lg font-semibold text-blue-500">
                      {calculateStats(temperatureData, 'localTemp').avg}°C
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Battery Temperature</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Min</p>
                    <p className="text-lg font-semibold text-red-500">
                      {calculateStats(temperatureData, 'batteryTemp').min}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Max</p>
                    <p className="text-lg font-semibold text-red-500">
                      {calculateStats(temperatureData, 'batteryTemp').max}°C
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Avg</p>
                    <p className="text-lg font-semibold text-red-500">
                      {calculateStats(temperatureData, 'batteryTemp').avg}°C
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Battery Temperature Status</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  temperatureData[temperatureData.length - 1].batteryTemp > 30
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {temperatureData[temperatureData.length - 1].batteryTemp > 30 ? 'Warning' : 'Normal'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Temperature Differential</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  Math.abs(
                    temperatureData[temperatureData.length - 1].batteryTemp -
                    temperatureData[temperatureData.length - 1].localTemp
                  ) > 10
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {Math.abs(
                    temperatureData[temperatureData.length - 1].batteryTemp -
                    temperatureData[temperatureData.length - 1].localTemp
                  ).toFixed(1)}°C
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default App;