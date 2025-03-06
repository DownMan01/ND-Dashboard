"use client"

import { useEffect, useState } from "react"
import { Mail, Calendar, Gift, Edit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserProfile {
  email: string
  created_at: string
  collections_count: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return

      const supabase = createClient()
      const { count } = await supabase
        .from("airdrop_collections")
        .select("*", { count: "exact" })
        .eq("user_id", user.id)

      setProfile({
        email: user.email || "",
        created_at: user.created_at,
        collections_count: count || 0,
      })
      setIsLoading(false)
    }

    fetchProfile()
  }, [user])

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Your account information</p>
        </div>
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your personal account details</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-4">
              <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get initials from email
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account information</p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Your personal account details</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit Profile</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl">
                  {getInitials(profile?.email || "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-lg sm:text-xl">{profile?.email}</div>
                <div className="text-sm text-muted-foreground">
                  Member since {new Date(profile?.created_at || "").toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="bg-muted/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="font-medium text-sm">{profile?.email}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Joined</div>
                    <div className="font-medium text-sm">
                      {new Date(profile?.created_at || "").toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30 sm:col-span-2">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Collections</div>
                    <div className="font-medium text-sm">{profile?.collections_count} airdrop collections created</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="p-4 sm:p-6 border-t">
            <Button variant="outline" className="w-full sm:w-auto text-sm">
              Update Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

