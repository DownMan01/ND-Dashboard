import type React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        <main className="px-4 py-4 lg:px-8 lg:py-6 pb-20 lg:pb-6">{children}</main>
      </div>
    </div>
  )
}

