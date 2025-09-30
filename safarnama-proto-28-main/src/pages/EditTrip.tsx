import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Users, Plus, X, Car, Plane, Train, Bus, MapPinCheck, Navigation, Loader2, Save, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useTripManagerSupabase } from "@/hooks/useTripManagerSupabase";

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { location, isLoading: locationLoading, getCurrentLocation } = useGeolocation();
  const { getTripById, updateTrip } = useTripManagerSupabase();
  
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    travelMode: "",
    date: "",
    time: "",
    notes: "",
    status: "planning" as const
  });
  
  const [travelers, setTravelers] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const trip = getTripById(id || "");

  // Load trip data when component mounts
  useEffect(() => {
    if (trip) {
      setFormData({
        origin: trip.origin,
        destination: trip.destination,
        travelMode: trip.travelMode,
        date: trip.date,
        time: trip.time,
        notes: trip.notes || "",
        status: trip.status
      });
      
      // Set travelers, ensuring at least one empty field
      if (trip.travelers && trip.travelers.length > 0) {
        setTravelers(trip.travelers);
      } else {
        setTravelers([""]);
      }
      
      setIsLoading(false);
    } else if (id) {
      // Trip not found
      setIsLoading(false);
    }
  }, [trip, id]);

  const travelModes = [
    { value: "car", label: "Car", icon: Car },
    { value: "plane", label: "Airplane", icon: Plane },
    { value: "train", label: "Train", icon: Train },
    { value: "bus", label: "Bus", icon: Bus },
    { value: "walking", label: "Walking", icon: MapPin },
    { value: "other", label: "Other", icon: MapPinCheck }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTraveler = () => {
    setTravelers(prev => [...prev, ""]);
  };

  const removeTraveler = (index: number) => {
    setTravelers(prev => prev.filter((_, i) => i !== index));
  };

  const updateTraveler = (index: number, value: string) => {
    setTravelers(prev => prev.map((traveler, i) => i === index ? value : traveler));
  };

  const updateCurrentLocation = () => {
    if (location?.address) {
      setFormData(prev => ({ ...prev, origin: location.address || "" }));
      toast({
        title: "Location Updated",
        description: "Origin updated with your current location.",
      });
    } else {
      getCurrentLocation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trip) return;
    
    // Basic validation
    if (!formData.origin || !formData.destination || !formData.travelMode || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Filter out empty travelers
    const validTravelers = travelers.filter(t => t.trim() !== "");
    
    setIsSaving(true);
    try {
      await updateTrip(trip.id, {
        ...formData,
        travelers: validTravelers,
      });
      
      toast({
        title: "Trip Updated",
        description: "Your trip has been updated successfully.",
      });
      
      navigate(`/trip/${trip.id}`);
    } catch (error) {
      console.error("Failed to update trip:", error);
      toast({
        title: "Error",
        description: "Failed to update trip. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    return { date, time };
  };

  const useCurrentTime = () => {
    const { date, time } = getCurrentDateTime();
    setFormData(prev => ({ ...prev, date, time }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading trip details...</p>
        </div>
      </div>
    );
  }

  // Trip not found
  if (!trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center">
        <Card className="bg-gradient-card shadow-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold mb-2">Trip Not Found</h2>
            <p className="text-muted-foreground mb-4">The trip you're trying to edit doesn't exist.</p>
            <Button onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="px-6 py-6">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button 
              variant="floating"
              size="icon"
              onClick={() => navigate(`/trip/${trip.id}`)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              disabled={isSaving}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold">Edit Trip</h1>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {trip.tripNumber}
                </Badge>
              </div>
              <p className="text-primary-foreground/80">
                Update your travel information
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Status Info */}
            <Card className="bg-gradient-card shadow-card border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Edit className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Editing: {trip.tripNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {trip.origin} → {trip.destination}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={trip.status === 'planning' ? 'outline' : trip.status === 'in_progress' ? 'default' : 'secondary'}
                    className={
                      trip.status === 'planning' ? 'text-muted-foreground' : 
                      trip.status === 'in_progress' ? 'bg-warning text-warning-foreground' : 
                      'bg-success text-success-foreground'
                    }
                  >
                    {trip.status === 'planning' && 'Planning'}
                    {trip.status === 'in_progress' && 'In Progress'}
                    {trip.status === 'completed' && 'Completed'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Trip Details Card */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Trip Details
                </CardTitle>
                <CardDescription>
                  Update your travel information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="origin">Origin *</Label>
                      <Button 
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={updateCurrentLocation}
                        disabled={locationLoading}
                        className="text-xs h-6 gap-1"
                      >
                        {locationLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Navigation className="h-3 w-3" />
                        )}
                        Update Location
                      </Button>
                    </div>
                    <Input
                      id="origin"
                      placeholder="Where are you starting from?"
                      value={formData.origin}
                      onChange={(e) => handleInputChange("origin", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination *</Label>
                    <Input
                      id="destination"
                      placeholder="Where are you going?"
                      value={formData.destination}
                      onChange={(e) => handleInputChange("destination", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travelMode">Travel Mode *</Label>
                  <Select value={formData.travelMode} onValueChange={(value) => handleInputChange("travelMode", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select how you're traveling" />
                    </SelectTrigger>
                    <SelectContent>
                      {travelModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          <div className="flex items-center gap-2">
                            <mode.icon className="h-4 w-4" />
                            {mode.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="time">Time *</Label>
                      <Button 
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={useCurrentTime}
                        className="text-xs h-6"
                      >
                        Use Now
                      </Button>
                    </div>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange("time", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional details about your trip..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Travelers Card */}
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Travel Companions
                </CardTitle>
                <CardDescription>
                  Who's traveling with you? (Leave empty if traveling alone)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {travelers.map((traveler, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      placeholder={`Traveler ${index + 1} name`}
                      value={traveler}
                      onChange={(e) => updateTraveler(index, e.target.value)}
                      className="flex-1"
                    />
                    {travelers.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTraveler(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTraveler}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Traveler
                </Button>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="w-full sm:w-auto"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="w-full sm:w-auto gap-2"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Update Trip
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTrip;