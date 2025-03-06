"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Clock, Gift, LineChart, Plus, Sparkles, Target, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import type { Database } from "@/types/supabase"

type Collection = Database["public"]["Tables"]["airdrop_collections"]["Row"]

export default function DashboardPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([])
  const [stageFilter, setStageFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    async function fetchCollections() {
      if (!user) return

      const supabase = createClient()
      const { data, error } = await supabase
        .from("airdrop_collections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching collections:", error)
        return
      }

      setCollections(data || [])
      setFilteredCollections(data || [])
      setIsLoading(false)
    }

    fetchCollections()
  }, [user])

  useEffect(() => {
    if (stageFilter === "all") {
      setFilteredCollections(collections)
    } else {
      setFilteredCollections(collections.filter((collection) => collection.stage === stageFilter))
    }
  }, [stageFilter, collections])

  const stats = {
    total: collections.length,
    active: collections.filter((c) => c.stage === "active").length,
    upcoming: collections.filter((c) => c.stage === "upcoming").length,
    ended: collections.filter((c) => c.stage === "ended").length,
  }

  // Calculate percentage changes (mock data for demonstration)
  const percentChanges = {
    total: 12,
    active: 8,
    upcoming: 15,
    ended: -5,
  }

  // Get stage color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "ended":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back to your airdrop collections</p>
        </div>
        <Button asChild size="sm" className="sm:size-md">
          <Link href="/dashboard/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2 md:p-6 md:pb-2 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Collections</CardTitle>
            <div className="rounded-full p-1.5 bg-background/80 backdrop-blur-sm">
              <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 sm:pt-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.total}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${percentChanges.total >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}
              >
                {percentChanges.total >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <LineChart className="mr-1 h-3 w-3" />
                )}
                {Math.abs(percentChanges.total)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2 md:p-6 md:pb-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
            <CardTitle className="text-xs sm:text-sm font-medium">Active</CardTitle>
            <div className="rounded-full p-1.5 bg-background/80 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 sm:pt-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.active}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${percentChanges.active >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}
              >
                {percentChanges.active >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <LineChart className="mr-1 h-3 w-3" />
                )}
                {Math.abs(percentChanges.active)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2 md:p-6 md:pb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
            <CardTitle className="text-xs sm:text-sm font-medium">Upcoming</CardTitle>
            <div className="rounded-full p-1.5 bg-background/80 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 sm:pt-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.upcoming}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${percentChanges.upcoming >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}
              >
                {percentChanges.upcoming >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <LineChart className="mr-1 h-3 w-3" />
                )}
                {Math.abs(percentChanges.upcoming)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 pb-2 md:p-6 md:pb-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-800/10">
            <CardTitle className="text-xs sm:text-sm font-medium">Completed</CardTitle>
            <div className="rounded-full p-1.5 bg-background/80 backdrop-blur-sm">
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 sm:pt-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.ended}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${percentChanges.ended >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}
              >
                {percentChanges.ended >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <LineChart className="mr-1 h-3 w-3" />
                )}
                {Math.abs(percentChanges.ended)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Collections */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold">Recent Collections</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Your most recently created airdrop collections
            </p>
          </div>
          <div className="flex items-center">
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full h-9 text-xs sm:text-sm">
                <SelectValue placeholder="Filter by stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array(3)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="p-3 md:p-4">
                    <div className="h-4 w-3/4 bg-muted rounded"></div>
                    <div className="h-3 w-1/2 bg-muted rounded mt-2"></div>
                  </CardHeader>
                  <CardContent className="p-3 md:p-4">
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-muted rounded"></div>
                      <div className="h-3 w-5/6 bg-muted rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : filteredCollections.length > 0 ? (
          <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCollections.slice(0, 3).map((collection) => (
              <Card key={collection.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base line-clamp-1">{collection.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{collection.subtitle}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageColor(collection.stage)}`}
                    >
                      {collection.stage}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4">
                    {collection.description || "No description provided"}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">{collection.chain}</span>
                      {collection.cost ? (
                        <span className="text-muted-foreground">${collection.cost}</span>
                      ) : (
                        <span className="text-green-600 font-medium">Free</span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild className="gap-1">
                      <Link href={`/dashboard/collections/${collection.id}`}>
                        View
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Gift className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Collections Found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {stageFilter === "all"
                  ? "Create your first airdrop collection to get started."
                  : `No ${stageFilter} collections found.`}
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/collections/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Collection
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {filteredCollections.length > 3 && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/collections">
                View All Collections
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base sm:text-lg">Collection Distribution</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Breakdown of your collections by stage</CardDescription>
          </CardHeader>
          <CardContent className="px-4 pb-2">
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-medium">Active</span>
                  <span className="text-xs sm:text-sm font-medium">
                    {stats.active} / {stats.total}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-green-500"
                    style={{
                      width: `${(stats.active / (stats.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-medium">Upcoming</span>
                  <span className="text-xs sm:text-sm font-medium">
                    {stats.upcoming} / {stats.total}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{
                      width: `${(stats.upcoming / (stats.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-medium">Completed</span>
                  <span className="text-xs sm:text-sm font-medium">
                    {stats.ended} / {stats.total}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gray-500"
                    style={{
                      width: `${(stats.ended / (stats.total || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 p-4">
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/dashboard/statistics">
                View detailed statistics
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid gap-2">
              <Button variant="outline" asChild className="justify-start text-xs sm:text-sm h-9 sm:h-10">
                <Link href="/dashboard/collections/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Collection
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start text-xs sm:text-sm h-9 sm:h-10">
                <Link href="/dashboard/collections">
                  <Gift className="mr-2 h-4 w-4" />
                  View All Collections
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start text-xs sm:text-sm h-9 sm:h-10">
                <Link href="/dashboard/statistics">
                  <LineChart className="mr-2 h-4 w-4" />
                  View Statistics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

