import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, MapPin, Clock, IndianRupee, Users, Plane } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Auth } from "../components/Auth";
import heroImage from "@/assets/travel-hero.jpg";

const Welcome = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [consentGiven, setConsentGiven] = useState(false);

  // Show auth component if user is not authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we check your authentication</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const features = [
    {
      icon: MapPin,
      title: "Smart Trip Tracking",
      description: "Automatically detect and log your travels with GPS integration"
    },
    {
      icon: Clock,
      title: "Effortless Logging", 
      description: "Quick entry forms with intelligent suggestions"
    },
    {
      icon: IndianRupee,
      title: "Expense Management",
      description: "Track and categorize all your travel expenses"
    },
    {
      icon: Users,
      title: "Travel Companions",
      description: "Record details about who you're traveling with"
    }
  ];

  const privacyPoints = [
    "Your location data is encrypted and secure",
    "You control what data is shared and with whom", 
    "Delete your data anytime with one tap",
    "Only approved transportation planners can access aggregated data"
  ];

  const handleGetStarted = () => {
    if (consentGiven) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Travel tracking illustration" 
            className="w-full h-full object-cover opacity-5"
          />
          <div className="absolute inset-0 bg-gradient-primary opacity-5"></div>
        </div>
        
        <div className="relative px-6 py-20">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-8 p-4 bg-gradient-card rounded-2xl shadow-floating border border-border">
              <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-button">
                <Plane className="h-7 w-7 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">Safarnama</h1>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Luxury Travel
              <br />
              <span className="bg-gradient-secondary bg-clip-text text-transparent">Made Simple</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience premium travel tracking with sophisticated design. Effortlessly capture journeys, 
              manage expenses, and maintain complete privacy control with our luxury travel companion.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Premium Travel Experience
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sophisticated tools designed for the discerning traveler
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group bg-gradient-card border shadow-card hover:shadow-floating transition-all duration-500 hover:scale-105">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-button group-hover:shadow-floating transition-all duration-300">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-muted-foreground leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Privacy & Consent Section */}
      <div className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-gradient-card border shadow-floating overflow-hidden">
            <div className="absolute inset-0 bg-gradient-primary opacity-[0.02]"></div>
            <CardHeader className="text-center relative z-10 pb-8">
              <div className="inline-flex items-center gap-3 mb-4 p-3 bg-gradient-card rounded-xl shadow-card border border-border">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center shadow-button">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-3xl font-bold">Privacy Excellence</CardTitle>
              </div>
              <CardDescription className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Enterprise-grade security with complete transparency and control over your personal data.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8 relative z-10">
              <div className="grid md:grid-cols-2 gap-6">
                {privacyPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gradient-card rounded-xl border border-border/50">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-primary/30">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-foreground font-medium">{point}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-accent/5 rounded-2xl p-8 border border-accent/20">
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    id="consent" 
                    checked={consentGiven}
                    onCheckedChange={(checked) => setConsentGiven(checked === true)}
                    className="mt-1 w-5 h-5"
                  />
                  <div className="space-y-3">
                    <label htmlFor="consent" className="text-lg font-semibold cursor-pointer text-foreground">
                      I understand and consent to premium data collection
                    </label>
                    <p className="text-muted-foreground leading-relaxed">
                      By accepting, you enable Safarnama to deliver personalized luxury travel experiences. 
                      Your data remains encrypted and under your complete control. Withdraw consent anytime 
                      in your privacy dashboard.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  disabled={!consentGiven}
                  className="w-full sm:w-auto px-12 py-4 text-lg font-semibold shadow-button hover:shadow-floating"
                >
                  Begin Your Journey
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate("/settings")}
                  className="w-full sm:w-auto px-8 py-4 text-lg"
                >
                  Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Welcome;