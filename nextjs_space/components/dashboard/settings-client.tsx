
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, User, Bell, Lock, Palette, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface SettingsClientProps {
  user: any;
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { toast } = useToast();
  const router = useRouter();

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user.name || "",
    company: user.company || "",
    phone: user.phone || "",
    industry: user.industry || "",
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully",
        });
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to change password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    placeholder="John Doe"
                    disabled={profileLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Contact support to change your email
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) =>
                      setProfileData({ ...profileData, company: e.target.value })
                    }
                    placeholder="Acme Inc."
                    disabled={profileLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                    disabled={profileLoading}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={profileData.industry}
                  onChange={(e) =>
                    setProfileData({ ...profileData, industry: e.target.value })
                  }
                  placeholder="Digital Marketing"
                  disabled={profileLoading}
                />
              </div>
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your password and security settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  disabled={passwordLoading}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    disabled={passwordLoading}
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    disabled={passwordLoading}
                    minLength={8}
                    required
                  />
                </div>
              </div>
              <Button type="submit" variant="outline" disabled={passwordLoading}>
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings (UI Only - Backend will be added later) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between opacity-60">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Receive updates about your projects and campaigns
                </p>
              </div>
              <input type="checkbox" disabled defaultChecked />
            </div>
            <div className="flex items-center justify-between opacity-60">
              <div>
                <h4 className="font-medium">Marketing Emails</h4>
                <p className="text-sm text-muted-foreground">
                  Get tips, guides, and product updates
                </p>
              </div>
              <input type="checkbox" disabled />
            </div>
            <div className="flex items-center justify-between opacity-60">
              <div>
                <h4 className="font-medium">Weekly Reports</h4>
                <p className="text-sm text-muted-foreground">
                  Receive weekly performance reports
                </p>
              </div>
              <input type="checkbox" disabled defaultChecked />
            </div>
            <p className="text-xs text-muted-foreground">
              Email notification preferences will be available soon
            </p>
          </CardContent>
        </Card>

        {/* Preferences (UI Only - Backend will be added later) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your dashboard experience (Coming Soon)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 opacity-60">
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                disabled
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>UTC (GMT+0:00)</option>
                <option>Eastern Time (GMT-5:00)</option>
                <option>Pacific Time (GMT-8:00)</option>
                <option>Central European (GMT+1:00)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                disabled
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground">
              Timezone and language preferences will be available soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
