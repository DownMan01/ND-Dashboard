"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  FileText,
  FileJson,
  Info,
  LineChart,
  PieChart,
  Printer,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  Table2,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/types/supabase"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type Collection = Database["public"]["Tables"]["airdrop_collections"]["Row"]
type TimeRange = "7d" | "30d" | "90d" | "1y" | "all"
type ChartView = "line" | "bar" | "pie" | "table"

export default function DetailedReportPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>("all")
  const [chartView, setChartView] = useState<ChartView>("line")
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const { user } = useAuth()
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1)
    toast({
      title: "Refreshing data",
      description: "Your report data is being updated",
    })
  }

  useEffect(() => {
    async function fetchCollections() {
      if (!user) return

      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("airdrop_collections")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching collections:", error)
        toast({
          title: "Error",
          description: "Failed to fetch collection data",
          variant: "destructive",
        })
        return
      }

      setCollections(data || [])
      setIsLoading(false)
    }

    fetchCollections()
  }, [user, toast, refreshKey])

  // Filter collections based on time range
  const filteredCollections = useMemo(() => {
    if (timeRange === "all") return collections

    const now = new Date()
    let cutoffDate: Date

    switch (timeRange) {
      case "7d":
        cutoffDate = new Date(now.setDate(now.getDate() - 7))
        break
      case "30d":
        cutoffDate = new Date(now.setDate(now.getDate() - 30))
        break
      case "90d":
        cutoffDate = new Date(now.setDate(now.getDate() - 90))
        break
      case "1y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        return collections
    }

    return collections.filter((c) => new Date(c.created_at) >= cutoffDate)
  }, [collections, timeRange])

  // Generate monthly data
  const monthlyData = useMemo(() => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()
    const data = monthNames.map((month) => ({
      month,
      total: 0,
      active: 0,
      upcoming: 0,
      ended: 0,
    }))

    filteredCollections.forEach((collection) => {
      const date = new Date(collection.created_at)
      if (date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth()
        data[monthIndex].total += 1

        switch (collection.stage) {
          case "active":
            data[monthIndex].active += 1
            break
          case "upcoming":
            data[monthIndex].upcoming += 1
            break
          case "ended":
            data[monthIndex].ended += 1
            break
        }
      }
    })

    return data
  }, [filteredCollections])

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalCollections = filteredCollections.length
    const activeCollections = filteredCollections.filter((c) => c.stage === "active").length
    const upcomingCollections = filteredCollections.filter((c) => c.stage === "upcoming").length
    const endedCollections = filteredCollections.filter((c) => c.stage === "ended").length

    // Chain distribution
    const chains = [...new Set(filteredCollections.map((c) => c.chain))]
    const chainDistribution = chains.map((chain) => ({
      name: chain,
      count: filteredCollections.filter((c) => c.chain === chain).length,
      percentage: (filteredCollections.filter((c) => c.chain === chain).length / Math.max(totalCollections, 1)) * 100,
    }))

    // Monthly growth metrics
    const monthlyTotal = monthlyData.reduce((sum, month) => sum + month.total, 0)
    const monthlyAverage = monthlyTotal / 12

    // Most active month
    const mostActiveMonth = [...monthlyData].sort((a, b) => b.total - a.total)[0]

    // Calculate trends (comparing to previous period)
    const currentMonth = new Date().getMonth()
    const previousMonth = currentMonth > 0 ? currentMonth - 1 : 11

    const currentMonthData = monthlyData[currentMonth]
    const previousMonthData = monthlyData[previousMonth]

    const totalGrowth =
      previousMonthData.total > 0
        ? ((currentMonthData.total - previousMonthData.total) / previousMonthData.total) * 100
        : currentMonthData.total > 0
          ? 100
          : 0

    const activeGrowth =
      previousMonthData.active > 0
        ? ((currentMonthData.active - previousMonthData.active) / previousMonthData.active) * 100
        : currentMonthData.active > 0
          ? 100
          : 0

    const upcomingGrowth =
      previousMonthData.upcoming > 0
        ? ((currentMonthData.upcoming - previousMonthData.upcoming) / previousMonthData.upcoming) * 100
        : currentMonthData.upcoming > 0
          ? 100
          : 0

    const endedGrowth =
      previousMonthData.ended > 0
        ? ((currentMonthData.ended - previousMonthData.ended) / previousMonthData.ended) * 100
        : currentMonthData.ended > 0
          ? 100
          : 0

    return {
      totalCollections,
      activeCollections,
      upcomingCollections,
      endedCollections,
      chainDistribution,
      totalGrowth,
      activeGrowth,
      upcomingGrowth,
      endedGrowth,
      monthlyAverage,
      mostActiveMonth,
    }
  }, [filteredCollections, monthlyData])

  // Render line chart - Mobile optimized
  const renderLineChart = () => {
    // Calculate points for each dataset
    const getPoints = (dataKey: "total" | "active" | "upcoming" | "ended") => {
      const maxValue = Math.max(...monthlyData.map((m) => m[dataKey]), 1)
      return monthlyData.map((month, i) => [i * (100 / 11), 100 - (month[dataKey] / maxValue) * 100])
    }

    const totalPoints = getPoints("total")
    const activePoints = getPoints("active")
    const upcomingPoints = getPoints("upcoming")
    const endedPoints = getPoints("ended")

    // Create smooth path data
    const createSmoothPath = (points: number[][]) => {
      let pathData = ""
      for (let i = 0; i < points.length; i++) {
        if (i === 0) {
          pathData += `M ${points[i][0]},${points[i][1]} `
        } else {
          const cp1x = points[i - 1][0] + (points[i][0] - points[i - 1][0]) / 3
          const cp1y = points[i - 1][1]
          const cp2x = points[i][0] - (points[i][0] - points[i - 1][0]) / 3
          const cp2y = points[i][1]
          pathData += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${points[i][0]},${points[i][1]} `
        }
      }
      return pathData
    }

    const totalPath = createSmoothPath(totalPoints)
    const activePath = createSmoothPath(activePoints)
    const upcomingPath = createSmoothPath(upcomingPoints)
    const endedPath = createSmoothPath(endedPoints)

    return (
      <div className="h-full w-full relative">
        {/* Grid lines */}
        <div className="absolute inset-0 grid grid-cols-6 md:grid-cols-12 grid-rows-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="col-span-full border-t border-muted/20" />
          ))}
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="row-span-6 border-l border-muted/20" />
          ))}
        </div>

        {/* Chart */}
        <div className="absolute inset-0 px-2 md:px-4 py-6">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="totalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="1" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="1" />
                <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="upcomingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="1" />
                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="endedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(107, 114, 128)" stopOpacity="1" />
                <stop offset="100%" stopColor="rgb(107, 114, 128)" stopOpacity="0.1" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Lines and areas */}
            {/* Total area */}
            <path
              d={`${totalPath} L 100,100 L 0,100 Z`}
              fill="url(#totalGradient)"
              opacity="0.5"
              className="transition-all duration-500 ease-in-out"
            />

            {/* Total line */}
            <path
              d={totalPath}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              className="transition-all duration-500 ease-in-out"
              vectorEffect="non-scaling-stroke"
            />

            {/* Active line */}
            <path
              d={activePath}
              fill="none"
              stroke="rgb(34, 197, 94)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5,5"
              className="transition-all duration-500 ease-in-out"
              vectorEffect="non-scaling-stroke"
            />

            {/* Upcoming line */}
            <path
              d={upcomingPath}
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="3,3"
              className="transition-all duration-500 ease-in-out"
              vectorEffect="non-scaling-stroke"
            />

            {/* Ended line */}
            <path
              d={endedPath}
              fill="none"
              stroke="rgb(107, 114, 128)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="2,4"
              className="transition-all duration-500 ease-in-out"
              vectorEffect="non-scaling-stroke"
            />

            {/* Data points for total - simplified for mobile */}
            {totalPoints
              .filter((_, i) => !isMobile || i % 2 === 0)
              .map((point, i) => {
                const month = monthlyData[i * (isMobile ? 2 : 1)]
                return (
                  <g key={`total-${i}`} className="group">
                    <circle
                      cx={point[0]}
                      cy={point[1]}
                      r="2.5"
                      fill="hsl(var(--primary))"
                      className="transition-all duration-300 group-hover:r-4"
                    />

                    {/* Simplified tooltip for mobile */}
                    <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <rect
                        x={point[0] - 30}
                        y={point[1] - 50}
                        width="60"
                        height="45"
                        rx="4"
                        fill="hsl(var(--card))"
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                      />
                      <text
                        x={point[0]}
                        y={point[1] - 38}
                        textAnchor="middle"
                        fontSize={isMobile ? "5" : "7"}
                        fill="currentColor"
                        fontWeight="bold"
                      >
                        {month.month}
                      </text>
                      <text
                        x={point[0]}
                        y={point[1] - 28}
                        textAnchor="middle"
                        fontSize={isMobile ? "5" : "6"}
                        fill="currentColor"
                      >
                        Total: {month.total}
                      </text>
                      <text
                        x={point[0]}
                        y={point[1] - 18}
                        textAnchor="middle"
                        fontSize={isMobile ? "5" : "6"}
                        fill="currentColor"
                      >
                        Active: {month.active}
                      </text>
                      <text
                        x={point[0]}
                        y={point[1] - 8}
                        textAnchor="middle"
                        fontSize={isMobile ? "5" : "6"}
                        fill="currentColor"
                      >
                        Upcoming: {month.upcoming}
                      </text>
                    </g>
                  </g>
                )
              })}
          </svg>

          {/* X-axis labels - simplified for mobile */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 md:px-4">
            {monthlyData
              .filter((_, i) => !isMobile || i % 2 === 0)
              .map((month, i) => (
                <span key={i} className="text-[8px] md:text-xs text-muted-foreground font-medium">
                  {month.month}
                </span>
              ))}
          </div>
        </div>
      </div>
    )
  }

  // Render bar chart - Mobile optimized
  const renderBarChart = () => {
    const maxValue = Math.max(...monthlyData.map((m) => m.total), 1)

    // For mobile, we'll show fewer bars to avoid overcrowding
    const displayData = isMobile
      ? monthlyData.filter((_, i) => i % 2 === 0 || i === monthlyData.length - 1)
      : monthlyData

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
                  <span className="font-medium">{month.total}</span>
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

              {/* Main bar */}
              <div
                className="w-full rounded-t-md transition-all duration-500 ease-in-out group-hover:scale-105 relative overflow-hidden"
                style={{
                  height: `${(month.total / maxValue) * 100}%`,
                  background: "linear-gradient(to top, hsl(var(--primary)/0.7), hsl(var(--primary)))",
                }}
              >
                {/* Stacked sections for different statuses */}
                {month.active > 0 && (
                  <div
                    className="absolute bottom-0 w-full transition-all duration-300 ease-in-out"
                    style={{
                      height: `${(month.active / month.total) * 100}%`,
                      background: "linear-gradient(to top, rgba(34, 197, 94, 0.7), rgba(34, 197, 94, 0.9))",
                    }}
                  />
                )}

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />

                {/* Value indicator - simplified for mobile */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] md:text-xs font-medium">
                  {month.total}
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

  // Render pie chart - Mobile optimized
  const renderPieChart = () => {
    const stageDistribution = [
      { name: "Active", value: metrics.activeCollections, color: "rgb(34, 197, 94)" },
      { name: "Upcoming", value: metrics.upcomingCollections, color: "rgb(59, 130, 246)" },
      { name: "Ended", value: metrics.endedCollections, color: "rgb(107, 114, 128)" },
    ]

    const total = stageDistribution.reduce((sum, item) => sum + item.value, 0) || 1
    let currentAngle = 0

    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="relative h-32 w-32 md:h-60 md:w-60">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {/* Background circle */}
            <circle cx="50" cy="50" r="40" fill="hsl(var(--muted)/0.3)" />

            {/* Pie segments */}
            {stageDistribution.map((item, index) => {
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

            {/* Center text - simplified for mobile */}
            <text
              x="50"
              y="45"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isMobile ? "5" : "6"}
              fill="currentColor"
            >
              Total Collections
            </text>
            <text
              x="50"
              y="55"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isMobile ? "8" : "10"}
              fill="currentColor"
              fontWeight="bold"
            >
              {metrics.totalCollections}
            </text>
          </svg>
        </div>

        {/* Legend - simplified for mobile */}
        <div className="absolute bottom-2 md:bottom-8 left-0 right-0 flex justify-center gap-3 md:gap-6">
          {stageDistribution.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
                <div className="h-2 w-2 md:h-3 md:w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] md:text-sm">{item.name}</span>
              </div>
              <span className="text-[10px] md:text-sm font-medium">{item.value}</span>
              <span className="text-[8px] md:text-xs text-muted-foreground">
                {item.value > 0 ? `${Math.round((item.value / total) * 100)}%` : "0%"}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render table - Mobile optimized
  const renderTable = () => {
    return (
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] md:text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-2 md:px-4 py-2 md:py-3 text-left font-medium">Month</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium">Total</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium">Active</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium">Upcoming</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium">Ended</th>
                <th className="px-2 md:px-4 py-2 md:py-3 text-right font-medium">Growth</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month, i) => {
                // Calculate growth from previous month
                const prevMonth = i > 0 ? monthlyData[i - 1].total : 0
                const growth = prevMonth > 0 ? ((month.total - prevMonth) / prevMonth) * 100 : 0

                return (
                  <tr key={i} className="border-t hover:bg-muted/10 transition-colors">
                    <td className="px-2 md:px-4 py-2 md:py-3 font-medium">{month.month}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-right">{month.total}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-right text-green-600">{month.active}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-right text-blue-600">{month.upcoming}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-right text-gray-600">{month.ended}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 text-right">
                      <span className={growth > 0 ? "text-green-600" : growth < 0 ? "text-red-600" : "text-gray-600"}>
                        {growth > 0 ? "+" : ""}
                        {Math.round(growth)}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="bg-muted/30">
              <tr>
                <td className="px-2 md:px-4 py-2 md:py-3 font-medium">Total</td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-right font-medium">
                  {monthlyData.reduce((sum, m) => sum + m.total, 0)}
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-green-600">
                  {monthlyData.reduce((sum, m) => sum + m.active, 0)}
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-blue-600">
                  {monthlyData.reduce((sum, m) => sum + m.upcoming, 0)}
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-right font-medium text-gray-600">
                  {monthlyData.reduce((sum, m) => sum + m.ended, 0)}
                </td>
                <td className="px-2 md:px-4 py-2 md:py-3 text-right"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    )
  }

  const handleExport = (format: "csv" | "json" | "pdf") => {
    try {
      // Prepare the data
      let content: string
      let fileName: string
      let mimeType: string

      if (format === "csv") {
        // Create CSV content
        const headers = ["Month", "Total Collections", "Active", "Upcoming", "Ended"]
        const rows = monthlyData.map((month) =>
          [month.month, month.total, month.active, month.upcoming, month.ended].join(","),
        )

        // Add summary row
        rows.push(
          [
            "Total",
            monthlyData.reduce((sum, m) => sum + m.total, 0),
            monthlyData.reduce((sum, m) => sum + m.active, 0),
            monthlyData.reduce((sum, m) => sum + m.upcoming, 0),
            monthlyData.reduce((sum, m) => sum + m.ended, 0),
          ].join(","),
        )

        content = [headers.join(","), ...rows].join("\n")
        fileName = "notedrop-detailed-report.csv"
        mimeType = "text/csv"
      } else if (format === "json") {
        // Create JSON content
        const data = {
          summary: {
            totalCollections: metrics.totalCollections,
            activeCollections: metrics.activeCollections,
            upcomingCollections: metrics.upcomingCollections,
            endedCollections: metrics.endedCollections,
            monthlyAverage: metrics.monthlyAverage,
            mostActiveMonth: metrics.mostActiveMonth,
            totalGrowth: metrics.totalGrowth,
            activeGrowth: metrics.activeGrowth,
            upcomingGrowth: metrics.upcomingGrowth,
            endedGrowth: metrics.endedGrowth,
          },
          monthlyData,
          chainDistribution: metrics.chainDistribution,
          timeRange,
        }
        content = JSON.stringify(data, null, 2)
        fileName = "notedrop-detailed-report.json"
        mimeType = "application/json"
      } else if (format === "pdf") {
        // For PDF, we would typically generate on the server side
        // Here we just show a message that it's not supported in this demo
        toast({
          title: "PDF export",
          description: "PDF export would be implemented with a server-side solution",
        })
        return
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
        title: "Export successful",
        description: `Report exported as ${format.toUpperCase()}`,
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your report",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-8 print:p-10">
      {/* Header Section - Mobile Optimized */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="print:hidden" asChild>
            <Link href="/dashboard/statistics">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Detailed Report</h1>
            <p className="text-sm text-muted-foreground mt-1">Comprehensive analysis of your collection metrics</p>
          </div>
        </div>

        {/* Mobile-friendly controls */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <div className="flex w-full justify-between sm:w-auto sm:justify-start">
            <Button variant="outline" size="sm" onClick={refreshData} className="flex-1 sm:flex-none">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>

            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger className="flex-1 sm:w-[140px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
                <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Export as CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileJson className="mr-2 h-4 w-4" />
                <span>Export as JSON</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                <span>Print Report</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="text-xs md:text-sm font-medium">Total</CardTitle>
            <BarChart3 className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 md:pt-4">
            <div className="text-xl md:text-2xl font-bold">{metrics.totalCollections}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${metrics.totalGrowth >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}
              >
                {metrics.totalGrowth >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {Math.abs(Math.round(metrics.totalGrowth))}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
            <CardTitle className="text-xs md:text-sm font-medium">Active</CardTitle>
            <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent className="p-3 md:pt-4">
            <div className="text-xl md:text-2xl font-bold">{metrics.activeCollections}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${metrics.activeGrowth >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}
              >
                {metrics.activeGrowth >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {Math.abs(Math.round(metrics.activeGrowth))}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
            <CardTitle className="text-xs md:text-sm font-medium">Upcoming</CardTitle>
            <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent className="p-3 md:pt-4">
            <div className="text-xl md:text-2xl font-bold">{metrics.upcomingCollections}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${metrics.upcomingGrowth >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}
              >
                {metrics.upcomingGrowth >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {Math.abs(Math.round(metrics.upcomingGrowth))}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 md:pb-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-900/10">
            <CardTitle className="text-xs md:text-sm font-medium">Ended</CardTitle>
            <div className="h-3 w-3 md:h-4 md:w-4 rounded-full bg-gray-500" />
          </CardHeader>
          <CardContent className="p-3 md:pt-4">
            <div className="text-xl md:text-2xl font-bold">{metrics.endedCollections}</div>
            <div className="flex items-center mt-1">
              <span
                className={`text-xs ${metrics.endedGrowth >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}
              >
                {metrics.endedGrowth >= 0 ? (
                  <TrendingUp className="mr-1 h-3 w-3" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3" />
                )}
                {Math.abs(Math.round(metrics.endedGrowth))}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Series Chart - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
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
            </div>
            <CardDescription className="text-xs md:text-sm">Monthly collection creation activity</CardDescription>

            {/* Mobile-friendly tabs */}
            <Tabs
              defaultValue={chartView}
              value={chartView}
              onValueChange={(value) => setChartView(value as ChartView)}
              className="w-full mt-2"
            >
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="line" className="text-xs md:text-sm">
                  <LineChart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Line</span>
                </TabsTrigger>
                <TabsTrigger value="bar" className="text-xs md:text-sm">
                  <BarChart3 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Bar</span>
                </TabsTrigger>
                <TabsTrigger value="pie" className="text-xs md:text-sm">
                  <PieChart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Pie</span>
                </TabsTrigger>
                <TabsTrigger value="table" className="text-xs md:text-sm">
                  <Table2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Table</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          {isLoading ? (
            <div className="h-[250px] md:h-[400px] w-full bg-muted/20 rounded-md animate-pulse"></div>
          ) : (
            <div className="rounded-md border bg-card/20 p-1">
              <TabsContent value="line" className="mt-0 mb-0">
                <div className="h-full">{renderLineChart()}</div>
              </TabsContent>

              <TabsContent value="bar" className="mt-0 mb-0">
                <div className="h-full">{renderBarChart()}</div>
              </TabsContent>

              <TabsContent value="pie" className="mt-0 mb-0">
                <div className="h-full">{renderPieChart()}</div>
              </TabsContent>

              <TabsContent value="table" className="mt-0 mb-0">
                <div className="max-h-[350px] overflow-auto">{renderTable()}</div>
              </TabsContent>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row items-center justify-between p-4">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <Badge className="bg-primary text-primary-foreground text-xs">Total</Badge>
            <Badge className="bg-green-500 text-white text-xs">Active</Badge>
            <Badge className="bg-blue-500 text-white text-xs">Upcoming</Badge>
            <Badge className="bg-gray-500 text-white text-xs">Ended</Badge>
          </div>
          <div className="text-xs md:text-sm text-muted-foreground">
            <span className="font-medium">Time Range:</span>{" "}
            {timeRange === "7d"
              ? "Last 7 days"
              : timeRange === "30d"
                ? "Last 30 days"
                : timeRange === "90d"
                  ? "Last 90 days"
                  : timeRange === "1y"
                    ? "Last year"
                    : "All time"}
          </div>
        </CardFooter>
      </Card>

      {/* Collection Distribution - Mobile Optimized */}
      <div className="grid gap-4 md:gap-6">
        {/* Chain Distribution */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base md:text-lg">Chain Distribution</CardTitle>
            <CardDescription className="text-xs md:text-sm">Collections by blockchain network</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-[150px] md:h-[200px] w-full bg-muted/20 rounded-md animate-pulse"></div>
            ) : (
              <div className="space-y-3 md:space-y-4">
                {metrics.chainDistribution.length > 0 ? (
                  metrics.chainDistribution.map((chain, index) => (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs md:text-sm font-medium truncate max-w-[100px] md:max-w-none">
                            {chain.name}
                          </span>
                          <Badge variant="outline" className="text-[10px] md:text-xs">
                            {Math.round(chain.percentage)}%
                          </Badge>
                        </div>
                        <span className="text-xs md:text-sm text-muted-foreground">{chain.count}</span>
                      </div>
                      <div className="h-2 md:h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300 group-hover:bg-primary/80"
                          style={{
                            width: `${chain.percentage}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex h-[150px] md:h-[200px] items-center justify-center rounded-md border border-dashed">
                    <p className="text-xs md:text-sm text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Performance Metrics */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-base md:text-lg">Monthly Performance</CardTitle>
            <CardDescription className="text-xs md:text-sm">Key metrics and trends</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="rounded-lg border bg-card p-3 md:p-4">
                  <div className="text-xs md:text-sm text-muted-foreground mb-1">Monthly Average</div>
                  <div className="text-lg md:text-2xl font-bold">{metrics.monthlyAverage.toFixed(1)}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground mt-1">collections per month</div>
                </div>

                <div className="rounded-lg border bg-card p-3 md:p-4">
                  <div className="text-xs md:text-sm text-muted-foreground mb-1">Most Active</div>
                  <div className="text-lg md:text-2xl font-bold">{metrics.mostActiveMonth?.month || "N/A"}</div>
                  <div className="text-[10px] md:text-xs text-muted-foreground mt-1">
                    {metrics.mostActiveMonth?.total || 0} collections
                  </div>
                </div>
              </div>

              <div className="space-y-1 md:space-y-2">
                <div className="text-xs md:text-sm font-medium">Growth Trend</div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex-1 h-1.5 md:h-2 rounded-full ${metrics.totalGrowth >= 0 ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span
                    className={`text-xs md:text-sm ${metrics.totalGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {Math.round(metrics.totalGrowth)}%
                  </span>
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground mt-1">
                  {metrics.totalGrowth >= 0 ? "Positive" : "Negative"} trend compared to previous period
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collections Table - Mobile Optimized */}
      <Card>
        <CardHeader className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base md:text-lg">Recent Collections</CardTitle>
              <CardDescription className="text-xs md:text-sm">Your most recently created collections</CardDescription>
            </div>
            <div className="relative mt-2 sm:mt-0">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 text-sm h-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 md:p-4 md:pt-0">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="rounded-md border p-3 animate-pulse">
                    <div className="h-4 w-2/3 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-1/3 bg-muted rounded"></div>
                  </div>
                ))}
            </div>
          ) : filteredCollections.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
            <div className="md:rounded-md md:border">
              {/* Mobile view - Card style */}
              <div className="block md:hidden divide-y">
                {filteredCollections
                  .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map((collection) => (
                    <div key={collection.id} className="p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{collection.name}</h3>
                          <p className="text-xs text-muted-foreground">{collection.chain}</p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            collection.stage === "active"
                              ? "bg-green-100 text-green-700"
                              : collection.stage === "upcoming"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {collection.stage}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span>{collection.cost ? `$${collection.cost}` : "Free"}</span>
                        <span className="text-muted-foreground">
                          {new Date(collection.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Desktop view - Table style */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Chain</th>
                      <th className="px-4 py-3 text-left font-medium">Stage</th>
                      <th className="px-4 py-3 text-right font-medium">Cost</th>
                      <th className="px-4 py-3 text-right font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCollections
                      .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 10)
                      .map((collection) => (
                        <tr key={collection.id} className="border-t hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3 font-medium">{collection.name}</td>
                          <td className="px-4 py-3">{collection.chain}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                collection.stage === "active"
                                  ? "bg-green-100 text-green-700"
                                  : collection.stage === "upcoming"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {collection.stage}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">{collection.cost ? `$${collection.cost}` : "Free"}</td>
                          <td className="px-4 py-3 text-right text-muted-foreground">
                            {new Date(collection.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">No collections found</p>
              <p className="text-xs text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Create your first collection to see data here"}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t md:border-0">
          <div className="text-xs md:text-sm text-muted-foreground">
            <span className="font-medium">{filteredCollections.length}</span> collections in total
          </div>
          <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/collections">View All Collections</Link>
          </Button>
        </CardFooter>
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
            <DropdownMenuItem onClick={refreshData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              <span>Refresh Data</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("csv")}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Export as CSV</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("json")}>
              <FileJson className="mr-2 h-4 w-4" />
              <span>Export as JSON</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              <span>Print Report</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

