import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useThemeContext } from '@/components/ThemeProvider';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  CreditCard, 
  Settings as SettingsIcon, 
  Shield,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

const dietaryOptions = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'keto', label: 'Keto' },
  { id: 'paleo', label: 'Paleo' },
];

export default function Settings() {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
  });
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current month usage
  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: usage } = useQuery({
    queryKey: ['/api/usage', currentMonth],
    retry: false,
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        bio: user.bio || '',
      });
      setDietaryPreferences((user.dietaryPreferences as string[]) || []);
      setEmailNotifications(user.emailNotifications ?? true);
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', '/api/user/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', '/api/user/account');
    },
    onSuccess: () => {
      toast({
        title: "Account Deletion Requested",
        description: "Your account deletion request has been processed.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to process account deletion",
        variant: "destructive",
      });
    },
  });

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handlePreferencesSave = () => {
    updateProfileMutation.mutate({
      dietaryPreferences,
      emailNotifications,
      darkMode: isDarkMode,
    });
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteAccountMutation.mutate();
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file (JPG, PNG, or GIF)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedPhoto(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await fetch('/api/user/upload-photo', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Profile photo updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setSelectedPhoto(null);
      setPhotoPreview(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  const handlePhotoUpload = () => {
    if (selectedPhoto) {
      uploadPhotoMutation.mutate(selectedPhoto);
    }
  };

  const handleDietaryChange = (preference: string) => {
    setDietaryPreferences(prev => 
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  // Calculate usage percentage
  const getUsagePercentage = () => {
    if (!usage || !user) return 0;
    
    const limits = {
      free: 5,
      basic: 50,
      pro: -1 // unlimited
    };
    
    const limit = limits[user.subscriptionTier as keyof typeof limits] || 5;
    if (limit === -1) return 100; // Show full for unlimited
    
    return Math.min((usage.recipeQueries / limit) * 100, 100);
  };

  // Handle unauthorized error at page level
  useEffect(() => {
    if (!user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [user, toast]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage your account preferences and subscription</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <SettingsIcon className="w-4 h-4" />
            <span>Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage 
                    src={photoPreview || user.profileImageUrl} 
                    alt={user.firstName || 'User'} 
                  />
                  <AvatarFallback className="text-xl">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      Change Photo
                    </Button>
                    {selectedPhoto && (
                      <Button
                        onClick={handlePhotoUpload}
                        disabled={uploadPhotoMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {uploadPhotoMutation.isPending ? 'Uploading...' : 'Upload'}
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG or GIF. Max size 5MB.
                  </p>
                  {selectedPhoto && (
                    <p className="text-sm text-green-600">
                      Selected: {selectedPhoto.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Tell us about your cooking preferences..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleProfileSave}
                  disabled={updateProfileMutation.isPending}
                  className="bg-brand-500 hover:bg-brand-600"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          {/* Current Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-brand-50 dark:bg-brand-900 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                    {user.subscriptionTier} Plan
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {user.subscriptionTier === 'free' && '5 recipes per month • Basic search'}
                    {user.subscriptionTier === 'basic' && '50 recipes per month • Advanced search • Recipe sharing'}
                    {user.subscriptionTier === 'pro' && 'Unlimited recipes • AI meal planning • Priority support'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {user.subscriptionTier === 'free' && '$0'}
                    {user.subscriptionTier === 'basic' && '$9'}
                    {user.subscriptionTier === 'pro' && '$19'}
                    <span className="text-sm text-gray-600 dark:text-gray-400">/month</span>
                  </p>
                  {user.subscriptionTier !== 'free' && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Next billing: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {user.subscriptionTier !== 'pro' && (
                <div className="flex justify-between mt-4">
                  <Button variant="outline" className="border-brand-500 text-brand-600 hover:bg-brand-50">
                    Upgrade Plan
                  </Button>
                  {user.subscriptionTier !== 'free' && (
                    <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Recipe Queries</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {usage?.recipeQueries || 0} / {
                      user.subscriptionTier === 'free' ? '5' :
                      user.subscriptionTier === 'basic' ? '50' : 'Unlimited'
                    }
                  </span>
                </div>
                <Progress value={getUsagePercentage()} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-300">Saved Recipes</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {usage?.recipesGenerated || 0} / Unlimited
                  </span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Setting */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Use dark theme for better readability in low light
                  </p>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Receive weekly recipe recommendations
                  </p>
                </div>
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                />
              </div>

              {/* Dietary Preferences */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Dietary Preferences</h4>
                <div className="grid grid-cols-2 gap-3">
                  {dietaryOptions.map((option) => (
                    <label key={option.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={dietaryPreferences.includes(option.id)}
                        onCheckedChange={() => handleDietaryChange(option.id)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handlePreferencesSave}
                  disabled={updateProfileMutation.isPending}
                  className="bg-brand-500 hover:bg-brand-600"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button className="bg-brand-500 hover:bg-brand-600">
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Delete Account */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Danger Zone</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Delete Account</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Once you delete your account, there is no going back. All your recipes and data will be permanently removed.
                </p>
                <Button 
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteAccountMutation.isPending}
                >
                  {deleteAccountMutation.isPending ? 'Processing...' : 'Delete Account'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
