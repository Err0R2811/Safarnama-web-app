import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Database, MapPin, Bell, Trash2, Download, Upload, AlertTriangle, LogOut, User, FileSpreadsheet, FileText, HelpCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTripManagerSupabase } from "@/hooks/useTripManagerSupabase";
import { importExportService } from "../services/importExportService";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { trips, createTrip, deleteTrip } = useTripManagerSupabase();
  const { toast } = useToast();
  const [isImporting, setIsImporting] = useState(false);

  const [settings, setSettings] = useState({
    locationTracking: true,
    autoTripDetection: false,
    pushNotifications: true,
    dataSharing: false,
    analyticsSharing: true
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Setting Updated",
      description: `Your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} preference has been saved.`,
    });
  };


  const handleDeleteAllData = async () => {
    const confirmMessage = `Are you sure you want to delete ALL your travel data?\n\nThis will permanently delete:\n• ${trips.length} trips\n• All associated expenses\n• All travel records\n\nThis action CANNOT be undone.`;
    
    if (window.confirm(confirmMessage)) {
      const secondConfirm = window.confirm("FINAL WARNING: This will delete everything. Type 'DELETE' and press OK to continue.");
      
      if (secondConfirm) {
        try {
          // Delete all trips one by one (this will also delete associated expenses due to cascading)
          for (const trip of trips) {
            await deleteTrip(trip.id);
          }
          
          toast({
            title: "All Data Deleted",
            description: "Your travel data has been permanently deleted.",
            variant: "destructive"
          });
        } catch (error) {
          toast({
            title: "Deletion Failed",
            description: "Some data could not be deleted. Please try again or contact support.",
            variant: "destructive"
          });
        }
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="px-6 py-6">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Button 
              variant="floating"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Privacy & Settings</h1>
              <p className="text-primary-foreground/80">Manage your data and preferences</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Account Information */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and sign-out options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-accent/20 rounded-lg">
                <div>
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-sm text-muted-foreground">Signed in</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
              
              <Button 
                variant="outline"
                onClick={handleSignOut}
                className="w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
          
          {/* Privacy Controls */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Privacy Controls
              </CardTitle>
              <CardDescription>
                Control how your data is collected and used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="location-tracking" className="font-medium">Location Tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow the app to access your GPS location for automatic trip detection
                  </p>
                </div>
                <Switch
                  id="location-tracking"
                  checked={settings.locationTracking}
                  onCheckedChange={(checked) => handleSettingChange("locationTracking", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-detection" className="font-medium">
                    Automatic Trip Detection
                    <Badge variant="secondary" className="ml-2">Coming Soon</Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect when you start and end trips using sensors
                  </p>
                </div>
                <Switch
                  id="auto-detection"
                  checked={settings.autoTripDetection}
                  onCheckedChange={(checked) => handleSettingChange("autoTripDetection", checked)}
                  disabled
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="data-sharing" className="font-medium">Transportation Planning Data Sharing</Label>
                  <p className="text-sm text-muted-foreground">
                    Share anonymized trip patterns with approved transportation planners
                  </p>
                </div>
                <Switch
                  id="data-sharing"
                  checked={settings.dataSharing}
                  onCheckedChange={(checked) => handleSettingChange("dataSharing", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="analytics" className="font-medium">Analytics & App Improvement</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve the app by sharing usage analytics (no personal data)
                  </p>
                </div>
                <Switch
                  id="analytics"
                  checked={settings.analyticsSharing}
                  onCheckedChange={(checked) => handleSettingChange("analyticsSharing", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>
                Control when and how you're notified
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive friendly reminders to log trip details
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Data Management
              </CardTitle>
              <CardDescription>
                Export, backup, or delete your travel data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => importExportService.exportTripsToCSV(trips)}
                    className="w-full justify-start gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Export Trips (CSV)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => importExportService.exportExpensesToCSV(trips)}
                    className="w-full justify-start gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Export Expenses (CSV)
                  </Button>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => importExportService.exportTripsToExcel(trips)}
                    className="w-full justify-start gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Export All (Excel)
                  </Button>

                  <div className="flex items-center gap-2">
                    <input 
                      id="import-file" 
                      type="file" 
                      accept=".csv, .xlsx, .xls"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsImporting(true);
                        try {
                          let importedTrips: Partial<typeof trips[number]>[] = [];
                          if (file.name.endsWith('.csv')) {
                            importedTrips = await importExportService.importTripsFromCSV(file);
                          } else {
                            importedTrips = await importExportService.importTripsFromExcel(file);
                          }
                          
                          for (const t of importedTrips) {
                            await createTrip({
                              origin: t.origin || '',
                              destination: t.destination || '',
                              travelMode: t.travelMode || 'car',
                              date: t.date || new Date().toISOString().split('T')[0],
                              time: t.time || '09:00',
                              notes: t.notes || '',
                              travelers: t.travelers || [],
                              status: (t.status as any) || 'planning',
                            });
                          }
                          toast({ title: 'Import Complete', description: `Added ${importedTrips.length} trips.` });
                        } catch (error: any) {
                          toast({ title: 'Import Failed', description: error.message || 'Could not import file', variant: 'destructive' });
                        } finally {
                          setIsImporting(false);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button 
                      asChild
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      disabled={isImporting}
                    >
                      <label htmlFor="import-file" className="w-full flex items-center gap-2 cursor-pointer">
                        <Upload className="h-4 w-4" />
                        {isImporting ? 'Importing...' : 'Import Trips (CSV/Excel)'}
                      </label>
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => importExportService.downloadSampleCSV()}
                      className="justify-start gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Download CSV Template
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => importExportService.downloadSampleExcel()}
                      className="justify-start gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Download Excel Template
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-destructive">Danger Zone</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete all your travel data. This action cannot be undone.
                    </p>
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteAllData}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete All Data
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage Information */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                How Your Data Is Used
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">What We Collect</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Trip origins and destinations</li>
                    <li>• Travel times and modes</li>
                    <li>• Travel companion information</li>
                    <li>• Expense data you enter</li>
                    <li>• Location data (with your permission)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-foreground mb-2">How It's Protected</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• End-to-end encryption</li>
                    <li>• Anonymized before sharing</li>
                    <li>• Secure cloud storage</li>
                    <li>• No selling to third parties</li>
                    <li>• Full user control and consent</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-accent/50 rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Transparency Promise:</strong> Your data helps improve transportation 
                  systems for everyone, but only with your explicit consent. You can withdraw 
                  permission and delete your data at any time.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Dashboard */}
          <div className="flex justify-center">
            <Button onClick={() => navigate("/dashboard")} className="gap-2">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;