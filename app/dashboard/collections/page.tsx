"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  ArrowUpDown,
  Calendar,
  Edit,
  Filter,
  Gift,
  Globe,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Trash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/types/supabase"

type Collection = Database["public"]["Tables"]["airdrop_collections"]["Row"]

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [filteredCollections, setFilteredCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState("grid")
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const fetchCollections = useCallback(async () => {
    if (!user) return

    setIsLoading(true)

    let query = supabase.from("airdrop_collections").select("*").eq("user_id", user.id)

    if (searchQuery) {
      query = query.ilike("name", `%${searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching collections:", error)
      toast({
        title: "Error",
        description: "Failed to fetch collections",
        variant: "destructive",
      })
      return
    }

    // Sort the data
    const sortedData = [...(data || [])]
    if (sortBy === "newest") {
      sortedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortBy === "oldest") {
      sortedData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sortBy === "alphabetical") {
      sortedData.sort((a, b) => a.name.localeCompare(b.name))
    }

    setCollections(sortedData)
    setIsLoading(false)
  }, [supabase, user, searchQuery, sortBy, toast])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  useEffect(() => {
    if (stageFilter === "all") {
      setFilteredCollections(collections)
    } else {
      setFilteredCollections(collections.filter((collection) => collection.stage === stageFilter))
    }
  }, [collections, stageFilter])

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this collection?")

    if (!confirmed) return

    const { error } = await supabase.from("airdrop_collections").delete().eq("id", id)

    if (error) {
      console.error("Error deleting collection:", error)
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      })
      return
    }

    setCollections(collections.filter((collection) => collection.id !== id))
    toast({
      title: "Success",
      description: "Collection deleted successfully",
    })
  }

  // Get stage color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Ended":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Render grid view
  const renderGridView = () => {
    if (isLoading) {
      return (
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6)
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
      )
    }

    if (filteredCollections.length > 0) {
      return (
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCollections.map((collection) => (
            <Card key={collection.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-lg line-clamp-1">{collection.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{collection.subtitle}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageColor(collection.stage)}`}
                    >
                      {collection.stage}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/collections/${collection.id}`} className="cursor-pointer">
                            <Gift className="mr-2 h-4 w-4" />
                            View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/collections/${collection.id}/edit`} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(collection.id)}>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-4">
                  {collection.description || "No description provided"}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs">
                      <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{collection.chain}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/collections/${collection.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Gift className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Collections Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? "Try a different search term" : "Create your first airdrop collection to get started"}
          </p>
          <Button asChild>
            <Link href="/dashboard/collections/new">
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Render list view
  const renderListView = () => {
    if (isLoading) {
      return (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="p-4 animate-pulse">
                    <div className="flex justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 w-1/3 bg-muted rounded"></div>
                        <div className="h-4 w-1/2 bg-muted rounded"></div>
                      </div>
                      <div className="h-8 w-20 bg-muted rounded"></div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    if (filteredCollections.length > 0) {
      return (
        <Card>
          <CardHeader className="p-4 pb-0 hidden md:block">
            <CardTitle className="text-lg">All Collections</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredCollections.map((collection) => (
                <div key={collection.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm sm:text-base">{collection.name}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStageColor(
                            collection.stage,
                          )}`}
                        >
                          {collection.stage}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{collection.subtitle}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <span>{collection.chain}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(collection.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/collections/${collection.id}`}>View</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/collections/${collection.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(collection.id)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Gift className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Collections Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery ? "Try a different search term" : "Create your first airdrop collection to get started"}
          </p>
          <Button asChild>
            <Link href="/dashboard/collections/new">
              <Plus className="mr-2 h-4 w-4" />
              New Collection
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your airdrop collections</p>
        </div>
        <Button asChild size="sm" className="sm:size-md">
          <Link href="/dashboard/collections/new">
            <Plus className="mr-2 h-4 w-4" />
            New Collection
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex gap-2">
                <Select value={stageFilter} onValueChange={setStageFilter}>
                  <SelectTrigger className="h-9 w-[120px] text-xs sm:text-sm gap-1">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Upcoming">Upcoming</SelectItem>
                    <SelectItem value="Ended">Ended</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-[120px] text-xs sm:text-sm gap-1">
                    <ArrowUpDown className="h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={viewMode} onValueChange={setViewMode} className="w-[110px]">
                <TabsList className="grid h-9 w-full grid-cols-2">
                  <TabsTrigger value="grid" className="flex items-center justify-center">
                    <SlidersHorizontal className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="list" className="flex items-center justify-center">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                    >
                      <path
                        d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1.5 7C1.22386 7 1 7.22386 1 7.5C1 7.77614 1.22386 8 1.5 8H13.5C13.7761 8 14 7.77614 14 7.5C14 7.22386 13.7761 7 13.5 7H1.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Display */}
      <Tabs value={viewMode} className="mt-0">
        <TabsContent value="grid" className="mt-0">
          {renderGridView()}
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          {renderListView()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

