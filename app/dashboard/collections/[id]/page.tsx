"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  Edit,
  ExternalLink,
  Gift,
  Globe,
  Trash,
  Users,
  Plus,
  Share2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/types/supabase"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Collection = Database["public"]["Tables"]["airdrop_collections"]["Row"]

export default function CollectionDetailPage({ params }: { params: { id: string } }) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchCollection() {
      if (!user) return

      const { data, error } = await supabase
        .from("airdrop_collections")
        .select("*")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

      if (error) {
        console.error("Error fetching collection:", error)
        toast({
          title: "Error",
          description: "Failed to fetch collection",
          variant: "destructive",
        })
        return
      }

      setCollection(data)
      setIsLoading(false)
    }

    fetchCollection()
  }, [params.id, user, toast, supabase])

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this collection?")

    if (!confirmed) return

    setIsDeleting(true)

    const { error } = await supabase.from("airdrop_collections").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting collection:", error)
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      })
      setIsDeleting(false)
      return
    }

    toast({
      title: "Success",
      description: "Collection deleted successfully",
    })

    router.push("/dashboard/collections")
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/dashboard/collections">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-6 w-36 bg-muted rounded-md animate-pulse"></div>
        </div>
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            <div className="h-48 sm:h-64 bg-muted rounded-xl animate-pulse"></div>
            <div className="h-32 sm:h-40 bg-muted rounded-xl animate-pulse"></div>
          </div>
          <div className="space-y-4 sm:space-y-6">
            <div className="h-48 sm:h-64 bg-muted rounded-xl animate-pulse"></div>
            <div className="h-32 sm:h-40 bg-muted rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/dashboard/collections">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Collection Not Found</h1>
        </div>
        <div className="bg-gradient-to-r from-muted/50 to-muted rounded-xl p-6 sm:p-12 text-center">
          <Gift className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground/60" />
          <h3 className="text-lg sm:text-xl font-semibold mb-2">The requested collection could not be found</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            The collection may have been deleted or you may not have permission to view it.
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard/collections">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Collections
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const stageColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    upcoming: "bg-blue-100 text-blue-800 border-blue-200",
    ended: "bg-gray-100 text-gray-800 border-gray-200",
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb and Actions - Mobile optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href="/dashboard/collections">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="hidden sm:flex items-center text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/dashboard/collections" className="hover:text-foreground transition-colors">
              Collections
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground font-medium truncate max-w-[150px]">{collection.name}</span>
          </div>
          <h1 className="text-lg font-bold sm:hidden truncate">{collection.name}</h1>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/collections/${collection.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {/* Main Content Column */}
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          {/* Hero Section - Mobile optimized */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border">
            {collection.image_url ? (
              <div className="absolute inset-0 opacity-10">
                <img src={collection.image_url || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
              </div>
            ) : null}
            <div className="relative p-4 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
                <div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${stageColors[collection.stage]}`}
                  >
                    {collection.stage.charAt(0).toUpperCase() + collection.stage.slice(1)}
                  </span>
                  <h1 className="text-xl sm:text-3xl font-bold mt-2">{collection.name}</h1>
                  <p className="text-sm sm:text-lg text-muted-foreground mt-1">{collection.subtitle}</p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10">
                      <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{collection.chain}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10">
                      <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{collection.cost ? `$${collection.cost}` : "Free"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description - Mobile optimized */}
          {collection.description && (
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">About</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{collection.description}</p>
              </CardContent>
            </Card>
          )}

          {/* How To Participate - Mobile optimized */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">How To Participate</h2>
              <div className="space-y-6 sm:space-y-8">
                {Array.isArray(collection.how_to_steps) && collection.how_to_steps.length > 0 ? (
                  collection.how_to_steps.map((step: any, index: number) => (
                    <div key={step.step} className="flex gap-3 sm:gap-5">
                      <div className="relative flex-none">
                        {/* Step number circle */}
                        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium text-base sm:text-lg">
                          {step.step}
                        </div>
                        {/* Connector line */}
                        {index < collection.how_to_steps.length - 1 && (
                          <div className="absolute left-1/2 top-8 sm:top-10 bottom-0 -translate-x-1/2 w-0.5 h-[calc(100%+0.5rem)] sm:h-[calc(100%+1rem)] bg-muted-foreground/20" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="rounded-lg border bg-card p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                          <h3 className="font-semibold text-sm sm:text-base">{step.title || "No title provided"}</h3>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center py-8 sm:py-12 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">No steps have been added yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column - Mobile optimized */}
        <div className="space-y-4 sm:space-y-6">
          {/* Collection Info */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Collection Info</h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(collection.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Status</p>
                    <p className="text-sm font-medium capitalize">{collection.stage}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Backers</p>
                    <p className="text-sm font-medium">{collection.backers.length} backers</p>
                  </div>
                </div>
              </div>

              {collection.backers.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-xs sm:text-sm font-medium mb-2">Backed by</h3>
                  <div className="flex flex-wrap gap-2">
                    {collection.backers.map((backer) => (
                      <span
                        key={backer}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs sm:text-sm"
                      >
                        {backer}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requirements - Mobile optimized */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Requirements</h2>
              <div className="space-y-2 sm:space-y-3">
                {Array.isArray(collection.requirements) && collection.requirements.length > 0 ? (
                  collection.requirements.map((req: any) => (
                    <div
                      key={req.id}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="text-xs sm:text-sm font-medium">{req.id}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{req.title || "No title provided"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-20 sm:h-24 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">No requirements specified</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Mobile optimized */}
          <Card className="hidden sm:block">
            <CardContent className="p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Quick Actions</h2>
              <div className="space-y-2 sm:space-y-3">
                <Button className="w-full justify-start text-sm" asChild>
                  <Link href={`/dashboard/collections/${collection.id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Collection
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public Page
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start text-sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {isDeleting ? "Deleting..." : "Delete Collection"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile floating action button */}
      <div className="fixed bottom-20 right-4 sm:hidden z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
              <Plus className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/collections/${collection.id}/edit`} className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Edit Collection
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="mr-2 h-4 w-4" />
              Share Collection
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete Collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

