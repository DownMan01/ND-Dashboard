"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ActivityIcon, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import type { Database } from "@/types/supabase"

type Collection = Database["public"]["Tables"]["airdrop_collections"]["Row"]

export default function ActivityPage() {
  const [collections, setCollections] = useState<Collection[]>([])
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
      setIsLoading(false)
    }

    fetchCollections()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity</h1>
        <p className="text-muted-foreground">Your recent airdrop collection activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-1/4 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ))}
            </div>
          ) : collections.length > 0 ? (
            <div className="space-y-8">
              {collections.map((collection) => (
                <div key={collection.id} className="flex items-start gap-4">
                  <div className="mt-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <ActivityIcon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">Collection Created</p>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(collection.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Created new airdrop collection: {collection.name}</p>
                    <div className="flex items-center pt-2">
                      <Link
                        href={`/dashboard/collections/${collection.id}`}
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View Collection
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      collection.stage === "active"
                        ? "bg-green-100 text-green-700"
                        : collection.stage === "upcoming"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {collection.stage}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ActivityIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
              <p className="text-muted-foreground">Create your first airdrop collection to start tracking activity.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

