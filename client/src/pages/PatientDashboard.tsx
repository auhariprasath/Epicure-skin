import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Cloud, Sun, Droplets, Wind, Upload, MessageSquare, Calendar, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getWeatherAndUV } from '@/api/weather';
import { getPredictionHistory } from '@/api/predictions';
import { useToast } from '@/hooks/useToast';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  uvLevel: string;
  condition: string;
  recommendation: string;
  location: string;
}

interface Prediction {
  _id: string;
  disease: string;
  confidence: number;
  timestamp: string;
  imageUrl: string;
}

export function PatientDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [weatherData, predictionsData] = await Promise.all([
          getWeatherAndUV({ city: 'New York' }),
          getPredictionHistory()
        ]);
        setWeather(weatherData as WeatherData);
        setPredictions((predictionsData as { predictions: Prediction[] }).predictions);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load data',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const getUVColor = (level: string) => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Very High':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Extreme':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-muted-foreground">Monitor your skin health and connect with dermatologists</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button
          onClick={() => navigate('/prediction')}
          className="h-24 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          <Upload className="h-6 w-6" />
          <span>New Prediction</span>
        </Button>
        <Button
          onClick={() => navigate('/profile')}
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
        >
          <FileText className="h-6 w-6" />
          <span>Profile</span>
        </Button>
        <Button
          onClick={() => navigate('/reports')}
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
        >
          <FileText className="h-6 w-6" />
          <span>My Reports</span>
        </Button>
        <Button
          onClick={() => navigate('/appointments')}
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
        >
          <Calendar className="h-6 w-6" />
          <span>Appointments</span>
        </Button>
        <Button
          onClick={() => navigate('/messages')}
          variant="outline"
          className="h-24 flex flex-col items-center justify-center gap-2"
        >
          <MessageSquare className="h-6 w-6" />
          <span>Messages</span>
        </Button>
      </div>

      {/* Weather & UV Widget */}
      {weather && (
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Weather & UV Index
            </CardTitle>
            <CardDescription>{weather.location}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <Sun className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Temperature</p>
                  <p className="text-2xl font-bold">{weather.temperature}°F</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Droplets className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="text-2xl font-bold">{weather.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wind className="h-8 w-8 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                  <p className="text-2xl font-bold">{weather.windSpeed} mph</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">UV Index</p>
                  <p className="text-2xl font-bold">{weather.uvIndex}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${getUVColor(weather.uvLevel)}`}>
              <p className="font-semibold mb-2">UV Level: {weather.uvLevel}</p>
              <p className="text-sm">{weather.recommendation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Predictions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Predictions</h2>
          <Button
            onClick={() => navigate('/prediction')}
            variant="outline"
            size="sm"
          >
            View All
          </Button>
        </div>

        {predictions.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No predictions yet. Start by uploading a skin image for analysis.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((prediction) => (
              <Card
                key={prediction._id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/prediction-results/${prediction._id}`)}
              >
                <CardContent className="pt-6">
                  <img
                    src={prediction.imageUrl}
                    alt={prediction.disease}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold text-lg mb-2">{prediction.disease}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">
                      {prediction.confidence}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(prediction.timestamp).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardHeader>
            <CardTitle>Connect with Doctors</CardTitle>
            <CardDescription>Get professional medical advice</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Share your predictions with board-certified dermatologists and get personalized recommendations.
            </p>
            <Button
              onClick={() => navigate('/doctors')}
              variant="outline"
              className="w-full"
            >
              Find Doctors
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}