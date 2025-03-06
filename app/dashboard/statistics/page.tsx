"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  Globe,
  LineChartIcon,
  TrendingUp,
  Users,
  ArrowUpRight,
  Info,
  FileText,
  FileJson,
  SlidersHorizontal,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/types/supabase"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Collection = Database["public"]["Tables"]["airdrop_collections"]["Row"]

export default function StatisticsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("all")
  const [chartType, setChartType] = useState("bar")
  const { user } = useAuth()
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    async function fetchCollections() {
      if (!user) return

      const supabase = createClient()
      const { data, error } = await supabase.from("airdrop_collections").select("*").eq("user_id", user.id)

      if (error) {
        console.error("Error fetching collections:", error)
        return
      }

      setCollections(data || [])
      setIsLoading(false)
    }

    fetchCollections()
  }, [user])

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  // Calculate statistics
  const stats = {
    totalCollections: collections.length,
    activeCollections: collections.filter((c) => c.stage === "active").length,
    upcomingCollections: collections.filter((c) => c.stage === "upcoming").length,
    completedCollections: collections.filter((c) => c.stage === "ended").length,
    totalValue: collections.reduce((sum, c) => sum + (c.cost || 0), 0),
    uniqueChains: [...new Set(collections.map((c) => c.chain))].length,
    chainDistribution: [...new Set(collections.map((c) => c.chain))].map((chain) => ({
      name: chain,
      count: collections.filter((c) => c.chain === chain).length,
    })),
    stageDistribution: [
      { name: "Active", value: collections.filter((c) => c.stage === "active").length, color: "#22c55e" },
      { name: "Upcoming", value: collections.filter((c) => c.stage === "upcoming").length, color: "#3b82f6" },
      { name: "Ended", value: collections.filter((c) => c.stage === "ended").length, color: "#6b7280" },
    ],
  }

  // Generate monthly data based on actual collections
  const getMonthlyData = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()

    // Initialize with zeros
    const monthlyData = monthNames.map((month) => ({
      month,
      collections: 0,
      active: 0,
      upcoming: 0,
      ended: 0,
    }))

    // Fill with actual data
    collections.forEach((collection) => {
      const date = new Date(collection.created_at)
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth()
        monthlyData[monthIndex].collections++

        if (collection.stage === "active") {
          monthlyData[monthIndex].active++
        } else if (collection.stage === "upcoming") {
          monthlyData[monthIndex].upcoming++
        } else if (collection.stage === "ended") {
          monthlyData[monthIndex].ended++
        }
      }
    })

    // For mobile, filter to show fewer data points
    return isMobile ? monthlyData.filter((_, i) => i % 2 === 0 || i === monthlyData.length - 1) : monthlyData
  }

  const monthlyData = getMonthlyData()

  // Calculate growth percentages (comparing to previous month)
  const calculateGrowth = () => {
    const currentMonth = new Date().getMonth()
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1

    const currentTotal = monthlyData[currentMonth].collections
    const previousTotal = monthlyData[previousMonth].collections

    const currentActive = monthlyData[currentMonth].active
    const previousActive = monthlyData[previousMonth].active

    const currentUpcoming = monthlyData[currentMonth].upcoming
    const previousUpcoming = monthlyData[previousMonth].upcoming

    const currentEnded = monthlyData[currentMonth].ended
    const previousEnded = monthlyData[previousMonth].ended

    return {
      total: previousTotal === 0 ? 100 : Math.round(((currentTotal - previousTotal) / previousTotal) * 100),
      active: previousActive === 0 ? 100 : Math.round(((currentActive - previousActive) / previousActive) * 100),
      upcoming:
        previousUpcoming === 0 ? 100 : Math.round(((currentUpcoming - previousUpcoming) / previousUpcoming) * 100),
      ended: previousEnded === 0 ? 100 : Math.round(((currentEnded - previousEnded) / previousEnded) * 100),
    }
  }

  const growthPercentages = calculateGrowth()

  // Render bar chart - Mobile optimized
  const renderBarChart = () => {
    const maxValue = Math.max(...monthlyData.map((d) => d.collections), 1)

    // For mobile, show fewer bars to avoid overcrowding
    const displayData =
      window.innerWidth < 640 ? monthlyData.filter((_, i) => i % 2 === 0 || i === monthlyData.length - 1) : monthlyData

    return (
      <div className="h-full w-full">
        <div className="flex h-full items-end gap-1 md:gap-2 pb-6 pt-6">
          {displayData.map((month, i) => (
            <div key={i} className="relative flex h-full w-full flex-col items-center justify-end group">
              {/* Enhanced tooltip - simplified for mobile */}
              <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-card border shadow-lg rounded-md p-2 text-[8px] md:text-xs z-10 w-28 md:w-40 pointer-events-none">
                <div className="font-medium text-center mb-1">{month.month}</div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{month.collections}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="text-green-500">{month.active}</span>
                </div>
                <div className="flex justify-between">
                  <span>Upcoming:</span>
                  <span className="text-blue-500">{month.upcoming}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ended:</span>
                  <span className="text-gray-500">{month.ended}</span>
                </div>
              </div>

              {/* Modern bar with gradient and animation */}
              <div
                className="w-full rounded-t-md transition-all duration-500 ease-in-out group-hover:scale-105 relative overflow-hidden"
                style={{
                  height: `${(month.collections / maxValue) * 100}%`,
                  background: "linear-gradient(to top, hsl(var(--primary)/0.7), hsl(var(--primary)))",
                }}
              >
                {/* Stacked sections */}
                {month.active > 0 && (
                  <div
                    className="absolute bottom-0 w-full transition-all duration-300 ease-in-out"
                    style={{
                      height: `${(month.active / month.collections) * 100}%`,
                      background: "linear-gradient(to top, rgba(34, 197, 94, 0.7), rgba(34, 197, 94, 0.9))",
                    }}
                  />
                )}

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />

                {/* Value indicator - simplified for mobile */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] md:text-xs font-medium">
                  {month.collections}
                </div>
              </div>

              <span className="absolute -bottom-6 text-[8px] md:text-xs text-muted-foreground font-medium">
                {month.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render line chart - Mobile optimized
  const renderLineChart = () => {
    const maxValue = Math.max(...monthlyData.map((d) => d.collections), 1)

    // For mobile, use fewer data points
    const displayData =
      window.innerWidth < 640 ? monthlyData.filter((_, i) => i % 2 === 0 || i === monthlyData.length - 1) : monthlyData

    const points = displayData.map((d, i) => [
      i * (100 / (displayData.length - 1 || 1)),
      100 - (d.collections / maxValue) * 100,
    ])

    // Create a smoother curve using bezier curves
    let smoothPathData = ""
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        smoothPathData += `M ${points[i][0]},${points[i][1]} `
      } else {
        const cp1x = points[i - 1][0] + (points[i][0] - points[i - 1][0]) / 3
        const cp1y = points[i - 1][1]
        const cp2x = points[i][0] - (points[i][0] - points[i - 1][0]) / 3
        const cp2y = points[i][1]
        smoothPathData += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i][0]},${points[i][1]} `
      }
    }

    return (
      <div className="h-full w-full relative">
        {/* Grid lines with better styling */}
        <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 grid-rows-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="col-span-full border-t border-muted/20" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="row-span-4 border-l border-muted/20" />
          ))}
        </div>

        {/* Line chart with enhanced styling */}
        <div className="absolute inset-0 px-2 md:px-4 py-6">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Gradient definition */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="1" />
                <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Area under the line with gradient */}
            <path
              d={`${smoothPathData} L 100,100 L 0,100 Z`}
              fill="url(#lineGradient)"
              strokeWidth="0"
              className="transition-all duration-500 ease-in-out"
            />

            {/* Smooth line with animation and glow effect */}
            <path
              d={smoothPathData}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="transition-all duration-500 ease-in-out"
              vectorEffect="non-scaling-stroke"
            />

            {/* Enhanced data points - simplified for mobile */}
            {points.map((point, i) => {
              const month = displayData[i]
              return (
                <g key={i} className="group">
                  {/* Outer glow circle */}
                  <circle
                    cx={point[0]}
                    cy={point[1]}
                    r="3"
                    fill="hsl(var(--primary)/0.2)"
                    className="transition-all duration-300 group-hover:r-5"
                  />

                  {/* Inner circle */}
                  <circle
                    cx={point[0]}
                    cy={point[1]}
                    r="2"
                    fill="hsl(var(--primary))"
                    className="transition-all duration-300 group-hover:r-3"
                  />

                  {/* Data tooltip - simplified for mobile */}
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <rect
                      x={point[0] - 25}
                      y={point[1] - 40}
                      width="50"
                      height="30"
                      rx="4"
                      fill="hsl(var(--card))"
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                    />
                    <text
                      x={point[0]}
                      y={point[1] - 28}
                      textAnchor="middle"
                      fontSize="8"
                      fill="currentColor"
                      fontWeight="bold"
                    >
                      {month.month}
                    </text>
                    <text x={point[0]} y={point[1] - 18} textAnchor="middle" fontSize="7" fill="currentColor">
                      Total: {month.collections}
                    </text>
                    <text x={point[0]} y={point[1] - 10} textAnchor="middle" fontSize="6" fill="rgb(34, 197, 94)">
                      Active: {month.active}
                    </text>
                  </g>
                </g>
              )
            })}
          </svg>

          {/* X-axis labels - simplified for mobile */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 md:px-4">
            {displayData.map((month, i) => (
              <span key={i} className="text-[8px] md:text-xs text-muted-foreground font-medium">
                {month.month}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render pie chart - Mobile optimized
  const renderPieChart = () => {
    const total = stats.stageDistribution.reduce((sum, item) => sum + item.value, 0) || 1
    let currentAngle = 0

    return (
      <div className="relative h-[180px] md:h-[200px] w-full flex items-center justify-center">
        <div className="relative h-32 w-32 md:h-40 md:w-40">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {/* Background circle */}
            <circle cx="50" cy="50" r="40" fill="hsl(var(--muted)/0.3)" />

            {/* Pie segments */}
            {stats.stageDistribution.map((item, index) => {
              if (item.value === 0) return null

              const percentage = (item.value / total) * 100
              const angle = (percentage / 100) * 360
              const largeArcFlag = angle > 180 ? 1 : 0

              // Calculate start and end points
              const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180)
              const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180)

              const endAngle = currentAngle + angle
              const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
              const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)

              // Create path
              const path = `
                M 50 50
                L ${startX} ${startY}
                A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}
                Z
              `

              currentAngle += angle

              return (
                <path
                  key={index}
                  d={path}
                  fill={item.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  data-name={item.name}
                  data-value={item.value}
                >
                  <title>
                    {item.name}: {item.value} ({percentage.toFixed(1)}%)
                  </title>
                </path>
              )
            })}

            {/* Center circle for donut effect */}
            <circle cx="50" cy="50" r="25" fill="hsl(var(--background))" />

            {/* Center text */}
            <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="currentColor">
              {total} Total
            </text>
          </svg>
        </div>

        {/* Legend - simplified for mobile */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 md:gap-4">
          {stats.stageDistribution.map((item, index) => (
            <div key={index} className="flex items-center gap-1 md:gap-2">
              <div className="h-2 w-2 md:h-3 md:w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-[10px] md:text-sm">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleDownload = (format: "csv" | "json") => {
    try {
      // Prepare the data
      let content: string
      let fileName: string
      let mimeType: string

      if (format === "csv") {
        // Create CSV content
        const headers = ["Month", "Total Collections", "Active", "Upcoming", "Ended"]
        const rows = monthlyData.map((month) =>
          [month.month, month.collections, month.active, month.upcoming, month.ended].join(","),
        )
        content = [headers.join(","), ...rows].join("\n")
        fileName = "notedrop-statistics.csv"
        mimeType = "text/csv"
      } else {
        // Create JSON content
        const data = {
          summary: {
            totalCollections: stats.totalCollections,
            activeCollections: stats.activeCollections,
            upcomingCollections: stats.upcomingCollections,
            completedCollections: stats.completedCollections,
            totalValue: stats.totalValue,
            uniqueChains: stats.uniqueChains,
          },
          monthlyData,
          chainDistribution: stats.chainDistribution,
          stageDistribution: stats.stageDistribution,
        }
        content = JSON.stringify(data, null, 2)
        fileName = "notedrop-statistics.json"
        mimeType = "application/json"
      }

      // Create a blob and download link
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Show success toast
      toast({
        title: "Download successful",
        description: `Statistics exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error("Error downloading statistics:", error)
      toast({
        title: "Download failed",
        description: "There was an error exporting your statistics",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section - Mobile Optimized */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Statistics</h1>
          <p className="text-sm text-muted-foreground mt-1">Analytics and insights for your collections</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange} className="flex-1 sm:flex-none">
            <SelectTrigger className="w-full sm:w-[160px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 sm:flex-none gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleDownload("csv")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDownload("json")}>
                <FileJson className="mr-2 h-4 w-4" />
                <span>Export as JSON</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Overview Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="text-xs md:text-sm font-medium">Total Collections</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-full p-1 md:p-1.5 bg-background/80 backdrop-blur-sm">
                    <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total number of collections across all stages</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="p-3 md:pt-4">
            <div className="text-xl md:text-2xl font-bold">{stats.totalCollections}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${growthPercentages.total >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}
              >
                {growthPercentages.total >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <LineChartIcon className="mr-1 h-3 w-3" />
                )}
                {Math.abs(growthPercentages.total)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
            <CardTitle className="text-xs md:text-sm font-medium">Active</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-full p-1 md:p-1.5 bg-background/80 backdrop-blur-sm">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Collections currently in the active stage</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="p-3 md:pt-4">
            <div className="text-xl md:text-2xl font-bold">{stats.activeCollections}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${growthPercentages.active >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}
              >
                {growthPercentages.active >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <LineChartIcon className="mr-1 h-3 w-3" />
                )}
                {Math.abs(growthPercentages.active)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
            <CardTitle className="text-xs md:text-sm font-medium">Chains</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-full p-1 md:p-1.5 bg-background/80 backdrop-blur-sm">
                    <Globe className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Number of different blockchain networks used</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="p-3 md:pt-4">
            <div className="text-xl md:text-2xl font-bold">{stats.uniqueChains}</div>
            <p className="text-xs text-muted-foreground mt-1">Networks</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
            <CardTitle className="text-xs md:text-sm font-medium">Value</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="rounded-full p-1 md:p-1.5 bg-background/80 backdrop-blur-sm">
                    <Users className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total value of all collections in USD</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent className="p-3 md:pt-4">
            <div className="text-xl md:text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalCollections > 0
                ? `$${(stats.totalValue / stats.totalCollections).toFixed(2)} avg`
                : "No collections"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base md:text-lg">Collection Growth</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Number of collections created over time</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Tabs defaultValue={chartType} onValueChange={setChartType} className="w-full sm:w-[200px]">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="bar" className="flex items-center justify-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Bar
                  </TabsTrigger>
                  <TabsTrigger value="line" className="flex items-center justify-center">
                    <LineChartIcon className="mr-2 h-4 w-4" />
                    Line
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <CardDescription className="text-xs md:text-sm">Monthly collection creation activity</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            {isLoading ? (
              <div className="h-[250px] md:h-[300px] w-full bg-muted/20 rounded-md animate-pulse"></div>
            ) : (
              <div className="h-[250px] md:h-[300px] w-full">
                {chartType === "bar" ? renderBarChart() : renderLineChart()}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div className="text-xs md:text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{collections.length}</span> total collections
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs md:text-sm w-full sm:w-auto" asChild>
              <Link href="/dashboard/statistics/detailed-report">
                View detailed report
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg">Stage Distribution</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Distribution of collections by stage</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription className="text-xs md:text-sm">Collections by stage</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-[180px] md:h-[200px] w-full bg-muted/20 rounded-md animate-pulse"></div>
            ) : (
              renderPieChart()
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg">Chain Distribution</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Distribution of collections by blockchain</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardDescription className="text-xs md:text-sm">Collections by blockchain</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-[180px] md:h-[200px] w-full bg-muted/20 rounded-md animate-pulse"></div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {stats.chainDistribution.length > 0 ? (
                  stats.chainDistribution.map((chain, index) => (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs md:text-sm font-medium truncate max-w-[120px] md:max-w-none">
                          {chain.name}
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground">{chain.count}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-primary transition-all duration-300 group-hover:bg-primary/80"
                          style={{
                            width: `${(chain.count / stats.totalCollections) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[150px] items-center justify-center rounded-md border border-dashed">
                    <p className="text-xs md:text-sm text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Collection Performance - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-base md:text-lg">Collection Performance</CardTitle>
          <CardDescription className="text-xs md:text-sm">Overview of collection metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 md:py-3 px-3 md:px-4 font-medium">Metric</th>
                  <th className="text-right py-2 md:py-3 px-3 md:px-4 font-medium">Active</th>
                  <th className="text-right py-2 md:py-3 px-3 md:px-4 font-medium">Upcoming</th>
                  <th className="text-right py-2 md:py-3 px-3 md:px-4 font-medium">Ended</th>
                  <th className="text-right py-2 md:py-3 px-3 md:px-4 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-2 md:py-3 px-3 md:px-4">Collections</td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4">{stats.activeCollections}</td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4">{stats.upcomingCollections}</td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4">{stats.completedCollections}</td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4 font-medium">{stats.totalCollections}</td>
                </tr>
                <tr className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-2 md:py-3 px-3 md:px-4">Percentage</td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4">
                    {stats.totalCollections > 0
                      ? `${Math.round((stats.activeCollections / stats.totalCollections) * 100)}%`
                      : "0%"}
                  </td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4">
                    {stats.totalCollections > 0
                      ? `${Math.round((stats.upcomingCollections / stats.totalCollections) * 100)}%`
                      : "0%"}
                  </td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4">
                    {stats.totalCollections > 0
                      ? `${Math.round((stats.completedCollections / stats.totalCollections) * 100)}%`
                      : "0%"}
                  </td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4 font-medium">100%</td>
                </tr>
                <tr className="hover:bg-muted/50 transition-colors">
                  <td className="py-2 md:py-3 px-3 md:px-4">Monthly Growth</td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4">
                    <span className={growthPercentages.active >= 0 ? "text-green-600" : "text-red-600"}>
                      {growthPercentages.active >= 0 ? "+" : ""}
                      {growthPercentages.active}%
                    </span>
                  </td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4">
                    <span className={growthPercentages.upcoming >= 0 ? "text-green-600" : "text-red-600"}>
                      {growthPercentages.upcoming >= 0 ? "+" : ""}
                      {growthPercentages.upcoming}%
                    </span>
                  </td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4">
                    <span className={growthPercentages.ended >= 0 ? "text-green-600" : "text-red-600"}>
                      {growthPercentages.ended >= 0 ? "+" : ""}
                      {growthPercentages.ended}%
                    </span>
                  </td>
                  <td className="text-right py-2 md:py-3 px-3 md:px-4 font-medium">
                    <span className={growthPercentages.total >= 0 ? "text-green-600" : "text-red-600"}>
                      {growthPercentages.total >= 0 ? "+" : ""}
                      {growthPercentages.total}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-4 right-4 md:hidden print:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" className="h-12 w-12 rounded-full shadow-lg">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => setTimeRange("all")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>All Time</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange("year")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Last Year</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange("month")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Last Month</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange("week")}>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Last Week</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload("csv")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Export as CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload("json")}>
              <FileJson className="mr-2 h-4 w-4" />
              <span>Export as JSON</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/statistics/detailed-report">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                <span>View Detailed Report</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

