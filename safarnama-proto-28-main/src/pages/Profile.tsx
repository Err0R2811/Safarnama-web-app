import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin, Camera, Save, Edit, Loader2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { profileService, UserProfile as DBUserProfile } from "../services/profileService";

interface UserProfile {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  age: number;
  phone: string;
  address: string;
  bio: string;
  profilePicture: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: 0,
    phone: "",
    address: "",
    bio: "",
    profilePicture: "",
  });

  // Load profile from database on component mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const dbProfile = await profileService.getProfile();
        
        if (dbProfile) {
          const age = dbProfile.date_of_birth ? profileService.calculateAge(dbProfile.date_of_birth) : 0;
          setProfile({
            firstName: dbProfile.first_name || "",
            lastName: dbProfile.last_name || "",
            dateOfBirth: dbProfile.date_of_birth || "",
            age,
            phone: dbProfile.phone || "",
            address: dbProfile.address || "",
            bio: dbProfile.bio || "",
            profilePicture: dbProfile.profile_picture_url || "",
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.id, toast]);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate age when date of birth changes
      if (field === 'dateOfBirth') {
        updated.age = calculateAge(value);
      }
      
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const profileData = {
        first_name: profile.firstName,
        last_name: profile.lastName,
        date_of_birth: profile.dateOfBirth,
        phone: profile.phone,
        address: profile.address,
        bio: profile.bio,
        profile_picture_url: profile.profilePicture,
      };

      await profileService.updateProfile(profileData);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      const dbProfile = await profileService.getProfile();
      
      if (dbProfile) {
        const age = dbProfile.date_of_birth ? profileService.calculateAge(dbProfile.date_of_birth) : 0;
        setProfile({
          firstName: dbProfile.first_name || "",
          lastName: dbProfile.last_name || "",
          dateOfBirth: dbProfile.date_of_birth || "",
          age,
          phone: dbProfile.phone || "",
          address: dbProfile.address || "",
          bio: dbProfile.bio || "",
          profilePicture: dbProfile.profile_picture_url || "",
        });
      }
    } catch (error) {
      console.error('Error reloading profile:', error);
    }
    setIsEditing(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // For now, create a data URL for immediate preview
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setProfile(prev => ({ ...prev, profilePicture: result }));
        };
        reader.readAsDataURL(file);

        // Uncomment this when Supabase storage is set up
        // const imageUrl = await profileService.uploadProfilePicture(file);
        // setProfile(prev => ({ ...prev, profilePicture: imageUrl }));
        
        toast({
          title: "Image Uploaded",
          description: "Profile picture updated successfully.",
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-accent flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Loading profile...</p>
        </div>
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
              onClick={() => navigate("/dashboard")}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              disabled={saving}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">My Profile</h1>
              <p className="text-primary-foreground/80">Manage your personal information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Profile Header Card */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                      {profile.profilePicture ? (
                        <img 
                          src={profile.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-10 w-10 text-primary" />
                      )}
                    </div>
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full p-0"
                        onClick={() => document.getElementById('profile-picture')?.click()}
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    )}
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">
                      {profile.firstName || profile.lastName 
                        ? `${profile.firstName} ${profile.lastName}`.trim()
                        : 'Your Name'}
                    </h2>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active User
                      </Badge>
                      {profile.age > 0 && (
                        <Badge variant="secondary">
                          {profile.age} years old
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleCancel} variant="outline" disabled={saving}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} className="gap-2" disabled={saving}>
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="gap-2" disabled={saving}>
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Personal Information */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="Enter your first name"
                    value={profile.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Enter your last name"
                    value={profile.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    placeholder="Calculated automatically"
                    value={profile.age > 0 ? profile.age : ''}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your address"
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your travel preferences, etc."
                  value={profile.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and authentication information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{user?.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-accent/20 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Account Created</p>
                  <p className="text-sm text-muted-foreground">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          {profile.firstName && (
            <Card className="bg-gradient-card shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{profile.firstName}</p>
                    <p className="text-sm text-muted-foreground">First Name</p>
                  </div>
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{profile.age || '—'}</p>
                    <p className="text-sm text-muted-foreground">Years Old</p>
                  </div>
                  <div className="text-center p-4 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold text-primary">{profile.phone ? '✓' : '—'}</p>
                    <p className="text-sm text-muted-foreground">Phone Added</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Back to Dashboard */}
          <div className="flex justify-center">
            <Button onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;