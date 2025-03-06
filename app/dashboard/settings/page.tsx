"use client"

import { useEffect, useState } from "react"
import { Bell, Mail, Moon, Sun, Shield, Smartphone, Globe, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "@/context/theme-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [mobileNotifications, setMobileNotifications] = useState(false)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [publicProfile, setPublicProfile] = useState(true)
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("notifications")

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSettingChange = (setting: string, value: boolean) => {
    switch (setting) {
      case "email":
        setEmailNotifications(value)
        break
      case "push":
        setPushNotifications(value)
        break
      case "mobile":
        setMobileNotifications(value)
        break
      case "2fa":
        setTwoFactorAuth(value)
        break
      case "public":
        setPublicProfile(value)
        break
      case "dark":
        setTheme(value ? "dark" : "light")
        break
    }

    toast({
      title: "Settings updated",
      description: "Your preferences have been saved.",
    })
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Mobile tabs for settings categories */}
      <div className="sm:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="notifications" className="text-xs">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="text-xs">
              Appearance
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs">
              Security
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Notifications Card */}
        <Card className={activeTab !== "notifications" && activeTab !== "all" ? "sm:block hidden" : ""}>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Notifications</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-sm">
                  Email Notifications
                </Label>
                <div className="text-xs text-muted-foreground">
                  Receive notifications about your collections via email
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("email", checked)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications" className="text-sm">
                  Push Notifications
                </Label>
                <div className="text-xs text-muted-foreground">
                  Receive notifications about your collections in the browser
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("push", checked)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="mobile-notifications" className="text-sm">
                  Mobile Notifications
                </Label>
                <div className="text-xs text-muted-foreground">Receive notifications on your mobile device</div>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <Switch
                  id="mobile-notifications"
                  checked={mobileNotifications}
                  onCheckedChange={(checked) => handleSettingChange("mobile", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Card */}
        <Card className={activeTab !== "appearance" && activeTab !== "all" ? "sm:block hidden" : ""}>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Appearance</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Customize your interface preferences</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="text-sm">
                  Dark Mode
                </Label>
                <div className="text-xs text-muted-foreground">Switch between light and dark mode</div>
              </div>
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => handleSettingChange("dark", checked)}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public-profile" className="text-sm">
                  Public Profile
                </Label>
                <div className="text-xs text-muted-foreground">Make your profile visible to others</div>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <Switch
                  id="public-profile"
                  checked={publicProfile}
                  onCheckedChange={(checked) => handleSettingChange("public", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className={activeTab !== "security" && activeTab !== "all" ? "sm:block hidden" : ""}>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Security</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Manage your account security settings</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor-auth" className="text-sm">
                  Two-Factor Authentication
                </Label>
                <div className="text-xs text-muted-foreground">Add an extra layer of security to your account</div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <Switch
                  id="two-factor-auth"
                  checked={twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange("2fa", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save button for mobile */}
      <div className="fixed bottom-20 right-4 sm:hidden z-10">
        <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
          <Save className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

