import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Clock, IndianRupee, Calendar, Car, Plane, Train, UserCheck, Play, CheckCircle2, Trash2 } from "lucide-react";
import { useTripManagerSupabase } from "@/hooks/useTripManagerSupabase";

const Dashboard = () => {
  const navigate = useNavigate();
  const { trips, startTrip, completeTrip, deleteTrip, getStats, isLoading } = useTripManagerSupabase();

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

  const { totalTrips, totalExpenses, activeTrips, completedTrips } = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground shadow-floating">
        <div className="px-6 py-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Travel Dashboard</h1>
              <p className="text-primary-foreground/90 text-lg">Welcome back! Here's your luxury travel summary.</p>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="floating"
                size="lg"
                onClick={() => navigate("/add-trip")}
                className="gap-3 bg-white hover:bg-white/90 text-primary border-white shadow-button hover:shadow-floating transition-all duration-300 hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                New Trip
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group bg-gradient-card shadow-card hover:shadow-floating transition-all duration-300 hover:scale-105 border">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground font-medium mb-2">Total Journeys</p>
                    <p className="text-4xl font-bold text-foreground">{totalTrips}</p>
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-button group-hover:shadow-floating transition-all duration-300">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-card shadow-card hover:shadow-floating transition-all duration-300 hover:scale-105 border">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground font-medium mb-2">Investment</p>
                    <p className="text-4xl font-bold text-foreground">₹{totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-button group-hover:shadow-floating transition-all duration-300">
                    <IndianRupee className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-gradient-card shadow-card hover:shadow-floating transition-all duration-300 hover:scale-105 border">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground font-medium mb-2">Active Adventures</p>
                    <p className="text-4xl font-bold text-foreground">{activeTrips}</p>
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-button group-hover:shadow-floating transition-all duration-300">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trips */}
          <Card className="bg-gradient-card shadow-card border">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold mb-2">Recent Adventures</CardTitle>
                  <CardDescription className="text-lg">Your luxury travel portfolio</CardDescription>
                </div>
                <Button 
                  variant="secondary" 
                  onClick={() => navigate("/add-trip")} 
                  className="gap-2 shadow-button hover:shadow-floating transition-all duration-300 hover:scale-105 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                >
                  <Plus className="h-4 w-4" />
                  Plan Trip
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trips.map((trip) => {
                  const TravelIcon = getTravelModeIcon(trip.travelMode);
                  return (
                    <div 
                      key={trip.id}
                      className="group flex items-center justify-between p-6 rounded-2xl border border-border bg-gradient-card hover:shadow-card transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                      onClick={() => navigate(`/trip/${trip.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                          <TravelIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{trip.tripNumber}</h3>
                            <Badge variant="secondary" className={getTravelModeColor(trip.travelMode)}>
                              {trip.travelMode}
                            </Badge>
                            {trip.status === 'in_progress' && (
                              <Badge variant="default" className="bg-warning text-warning-foreground">
                                In Progress
                              </Badge>
                            )}
                            {trip.status === 'planning' && (
                              <Badge variant="outline" className="text-muted-foreground">
                                Planning
                              </Badge>
                            )}
                            {trip.status === 'completed' && (
                              <Badge variant="default" className="bg-success text-success-foreground">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {trip.origin} → {trip.destination}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {trip.date}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {trip.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              {trip.travelers.length} traveler{trip.travelers.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-semibold text-foreground">₹{trip.totalExpenses.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Total expenses</p>
                        </div>
                        <div className="flex gap-1">
                          {trip.status === 'planning' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                startTrip(trip.id);
                              }}
                              className="gap-1 hover:bg-primary/10"
                            >
                              <Play className="h-3 w-3" />
                              Start
                            </Button>
                          )}
                          {trip.status === 'in_progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                completeTrip(trip.id);
                              }}
                              className="gap-1 hover:bg-primary/10"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete trip ${trip.tripNumber}? This action cannot be undone.`)) {
                                deleteTrip(trip.id);
                              }
                            }}
                            className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;