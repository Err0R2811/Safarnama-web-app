import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MapPin, Clock, Users, IndianRupee, Calendar, Car, Plane, Train, Edit, Play, CheckCircle2 } from "lucide-react";
import { useTripManagerSupabase } from "@/hooks/useTripManagerSupabase";
import ExpenseTracker from "@/components/ExpenseTracker";
const TripDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTripById, startTrip, completeTrip } = useTripManagerSupabase();

  const trip = getTripById(id || "");

  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Trip Not Found</h2>
            <p className="text-muted-foreground mb-4">The trip you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTravelModeIcon = (mode: string) => {
    switch (mode) {
      case 'car': return Car;
      case 'plane': return Plane;
      case 'train': return Train;
      default: return MapPin;
    }
  };

  const getTravelModeColor = (mode: string) => {
    switch (mode) {
      case 'car': return 'bg-blue-100 text-blue-800';
      case 'plane': return 'bg-purple-100 text-purple-800';
      case 'train': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TravelIcon = getTravelModeIcon(trip.travelMode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="px-6 py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="floating"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <TravelIcon className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">{trip.tripNumber}</h1>
                  <p className="text-primary-foreground/80">
                    {trip.origin} → {trip.destination}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {trip.status === 'planning' && (
                <Button 
                  onClick={() => startTrip(trip.id)}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  Start Trip
                </Button>
              )}
              {trip.status === 'in_progress' && (
                <Button 
                  onClick={() => completeTrip(trip.id)}
                  variant="outline"
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Trip
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate(`/edit-trip/${trip.id}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Trip
              </Button>
              <Button onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Trip Overview</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Trip Overview Card */}
              <Card className="bg-gradient-card shadow-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{trip.tripNumber}</CardTitle>
                      <CardDescription>Trip Details & Information</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getTravelModeColor(trip.travelMode)}>
                        {trip.travelMode}
                      </Badge>
                      {trip.status === 'planning' && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Planning
                        </Badge>
                      )}
                      {trip.status === 'in_progress' && (
                        <Badge variant="default" className="bg-warning text-warning-foreground">
                          In Progress
                        </Badge>
                      )}
                      {trip.status === 'completed' && (
                        <Badge variant="default" className="bg-success text-success-foreground">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Route</p>
                          <p className="font-medium">{trip.origin} → {trip.destination}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date & Time</p>
                          <p className="font-medium">{trip.date} at {trip.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Travelers</p>
                          <p className="font-medium">
                            {trip.travelers.length > 0 
                              ? trip.travelers.join(", ") 
                              : "Solo travel"
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <IndianRupee className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Expenses</p>
                          <p className="font-medium text-2xl">₹{trip.totalExpenses.toFixed(2)}</p>
                        </div>
                      </div>

                      {trip.notes && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Notes</p>
                          <p className="text-sm bg-muted/50 p-3 rounded-lg">{trip.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses">
              <ExpenseTracker tripId={trip.id} expenses={trip.expenses} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;