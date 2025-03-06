"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Gift, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Update the bubble styles to include 10 more bubbles (bubbles 13-22)
const bubbleStyles = `
  @keyframes float-1 {
    0% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -50px) rotate(10deg); }
    66% { transform: translate(-20px, 20px) rotate(-5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  @keyframes float-2 {
    0% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(-40px, -30px) rotate(-10deg); }
    66% { transform: translate(20px, 40px) rotate(5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  @keyframes float-3 {
    0% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(20px, 30px) rotate(5deg); }
    66% { transform: translate(-30px, -20px) rotate(-10deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  @keyframes float-4 {
    0% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(-15px, -25px) rotate(-8deg); }
    50% { transform: translate(20px, 10px) rotate(8deg); }
    75% { transform: translate(-25px, 25px) rotate(-5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  @keyframes float-5 {
    0% { transform: translate(0, 0) rotate(0deg); }
    20% { transform: translate(25px, 10px) rotate(5deg); }
    40% { transform: translate(10px, -20px) rotate(10deg); }
    60% { transform: translate(-15px, -10px) rotate(-5deg); }
    80% { transform: translate(-20px, 15px) rotate(-10deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  @keyframes float-6 {
    0% { transform: translate(0, 0) rotate(0deg); }
    20% { transform: translate(-10px, -15px) rotate(-3deg); }
    40% { transform: translate(15px, 10px) rotate(7deg); }
    60% { transform: translate(5px, -25px) rotate(3deg); }
    80% { transform: translate(-15px, 5px) rotate(-7deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  @keyframes float-7 {
    0% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(12px, -18px) rotate(5deg); }
    50% { transform: translate(-8px, -12px) rotate(-3deg); }
    75% { transform: translate(-15px, 15px) rotate(-6deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.05); opacity: 0.9; }
    100% { transform: scale(1); opacity: 0.7; }
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .bubble {
    opacity: 0.7;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .bubble-1 {
    top: 15%;
    left: 15%;
    animation: float-1 20s ease-in-out infinite;
  }
  
  .bubble-2 {
    top: 25%;
    right: 20%;
    animation: float-2 25s ease-in-out infinite;
  }
  
  .bubble-3 {
    bottom: 20%;
    left: 25%;
    animation: float-3 18s ease-in-out infinite;
  }
  
  .bubble-4 {
    bottom: 30%;
    right: 15%;
    animation: float-1 22s ease-in-out infinite;
  }
  
  .bubble-5 {
    top: 40%;
    left: 40%;
    animation: float-2 19s ease-in-out infinite;
  }
  
  .bubble-6 {
    top: 60%;
    right: 30%;
    animation: float-3 24s ease-in-out infinite;
  }
  
  .bubble-7 {
    top: 10%;
    left: 50%;
    animation: float-4 21s ease-in-out infinite;
  }
  
  .bubble-8 {
    top: 70%;
    left: 10%;
    animation: float-5 23s ease-in-out infinite;
  }
  
  .bubble-9 {
    top: 30%;
    right: 5%;
    animation: float-4 26s ease-in-out infinite;
  }
  
  .bubble-10 {
    bottom: 15%;
    right: 40%;
    animation: float-5 19s ease-in-out infinite;
  }
  
  .bubble-11 {
    top: 5%;
    right: 30%;
    animation: float-1 27s ease-in-out infinite;
  }
  
  .bubble-12 {
    bottom: 5%;
    left: 35%;
    animation: float-3 22s ease-in-out infinite;
  }
  
  .bubble-13 {
    top: 8%;
    left: 8%;
    animation: float-6 24s ease-in-out infinite;
  }
  
  .bubble-14 {
    top: 45%;
    right: 12%;
    animation: float-7 26s ease-in-out infinite;
  }
  
  .bubble-15 {
    bottom: 12%;
    left: 45%;
    animation: float-5 28s ease-in-out infinite;
  }
  
  .bubble-16 {
    top: 35%;
    left: 5%;
    animation: float-4 23s ease-in-out infinite;
  }
  
  .bubble-17 {
    top: 65%;
    right: 8%;
    animation: float-2 21s ease-in-out infinite;
  }
  
  .bubble-18 {
    bottom: 40%;
    left: 15%;
    animation: float-7 25s ease-in-out infinite;
  }
  
  .bubble-19 {
    top: 20%;
    left: 30%;
    animation: float-6 22s ease-in-out infinite;
  }
  
  .bubble-20 {
    bottom: 25%;
    right: 25%;
    animation: float-3 27s ease-in-out infinite;
  }
  
  .bubble-21 {
    top: 50%;
    right: 35%;
    animation: float-1 29s ease-in-out infinite;
  }
  
  .bubble-22 {
    bottom: 60%;
    left: 60%;
    animation: float-4 20s ease-in-out infinite;
  }
  
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--primary)/0.1) 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 50;
    transition: opacity 0.5s ease-in-out;
  }
  
  .loading-logo {
    animation: pulse 2s infinite ease-in-out;
  }
  
  .loading-spinner {
    margin-top: 20px;
    animation: spin 1.5s infinite linear;
  }
  
  .loading-text {
    margin-top: 20px;
    animation: pulse 2s infinite ease-in-out;
  }
  
  .fade-in {
    animation: fadeIn 1s ease-in-out forwards;
  }
  
  .fade-out {
    animation: fadeOut 0.5s ease-in-out forwards;
  }
  
  @media (max-width: 640px) {
    .bubble {
      transform: scale(0.7);
    }
  }
`

// Update the export default function to include the loading screen
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showLoadingScreen, setShowLoadingScreen] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const { signIn } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Add bubble styles to document
    const styleElement = document.createElement("style")
    styleElement.innerHTML = bubbleStyles
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Loading screen with delay
  useEffect(() => {
    if (!mounted) return

    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 300)

    // Add delay before hiding loading screen
    const timer = setTimeout(() => {
      setShowLoadingScreen(false)
    }, 3500)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      toast({
        title: "Success",
        description: "You have been logged in successfully!",
      })
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: "Failed to login. Please check your credentials.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-background via-background to-background/80">
      {/* Loading Screen */}
      {showLoadingScreen && (
        <div className="loading-screen">
          <div className="loading-logo p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full backdrop-blur-sm border border-primary/20">
            <Gift className="h-12 w-12 sm:h-16 sm:w-16 text-primary" />
          </div>
          <div className="loading-spinner relative h-12 w-12 mt-8">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10"></div>
            <div
              className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
              style={{ clipPath: "inset(0 0 0 0)" }}
            ></div>
          </div>
          <div className="loading-text text-lg sm:text-xl font-bold text-primary mt-4">Loading NoteDrop...</div>
          <div className="mt-4 w-48 h-2 bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">{loadingProgress}% Complete</div>
        </div>
      )}

      {/* Floating bubbles background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Static gradient background */}
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[30%] -right-[20%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl" />

        {/* Floating bubbles - original 12 bubbles */}
        <div className="bubble bubble-1 w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 absolute"></div>
        <div className="bubble bubble-2 w-20 h-20 md:w-32 md:h-32 rounded-full bg-primary/5 backdrop-blur-sm border border-primary/10 absolute"></div>
        <div className="bubble bubble-3 w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/15 backdrop-blur-sm border border-primary/20 absolute"></div>
        <div className="bubble bubble-4 w-24 h-24 md:w-40 md:h-40 rounded-full bg-primary/5 backdrop-blur-sm border border-primary/10 absolute"></div>
        <div className="bubble bubble-5 w-10 h-10 md:w-14 md:h-14 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 absolute"></div>
        <div className="bubble bubble-6 w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/5 backdrop-blur-sm border border-primary/10 absolute"></div>
        <div className="bubble bubble-7 w-14 h-14 md:w-18 md:h-18 rounded-full bg-primary/8 backdrop-blur-sm border border-primary/15 absolute"></div>
        <div className="bubble bubble-8 w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary/12 backdrop-blur-sm border border-primary/20 absolute"></div>
        <div className="bubble bubble-9 w-10 h-10 md:w-16 md:h-16 rounded-full bg-primary/7 backdrop-blur-sm border border-primary/10 absolute"></div>
        <div className="bubble bubble-10 w-12 h-12 md:w-20 md:h-20 rounded-full bg-primary/9 backdrop-blur-sm border border-primary/15 absolute"></div>
        <div className="bubble bubble-11 w-8 h-8 md:w-14 md:h-14 rounded-full bg-primary/6 backdrop-blur-sm border border-primary/10 absolute"></div>
        <div className="bubble bubble-12 w-18 h-18 md:w-28 md:h-28 rounded-full bg-primary/4 backdrop-blur-sm border border-primary/8 absolute"></div>

        {/* Add 10 more bubbles (bubbles 13-22) */}
        <div className="bubble bubble-13 w-9 h-9 md:w-15 md:h-15 rounded-full bg-primary/8 backdrop-blur-sm border border-primary/12 absolute"></div>
        <div className="bubble bubble-14 w-11 h-11 md:w-17 md:h-17 rounded-full bg-primary/6 backdrop-blur-sm border border-primary/10 absolute"></div>
        <div className="bubble bubble-15 w-13 h-13 md:w-22 md:h-22 rounded-full bg-primary/7 backdrop-blur-sm border border-primary/14 absolute"></div>
        <div className="bubble bubble-16 w-7 h-7 md:w-13 md:h-13 rounded-full bg-primary/9 backdrop-blur-sm border border-primary/16 absolute"></div>
        <div className="bubble bubble-17 w-15 h-15 md:w-26 md:h-26 rounded-full bg-primary/4 backdrop-blur-sm border border-primary/9 absolute"></div>
        <div className="bubble bubble-18 w-10 h-10 md:w-18 md:h-18 rounded-full bg-primary/11 backdrop-blur-sm border border-primary/18 absolute"></div>
        <div className="bubble bubble-19 w-8 h-8 md:w-14 md:h-14 rounded-full bg-primary/13 backdrop-blur-sm border border-primary/22 absolute"></div>
        <div className="bubble bubble-20 w-12 h-12 md:w-19 md:h-19 rounded-full bg-primary/5 backdrop-blur-sm border border-primary/11 absolute"></div>
        <div className="bubble bubble-21 w-9 h-9 md:w-16 md:h-16 rounded-full bg-primary/8 backdrop-blur-sm border border-primary/13 absolute"></div>
        <div className="bubble bubble-22 w-11 h-11 md:w-21 md:h-21 rounded-full bg-primary/6 backdrop-blur-sm border border-primary/12 absolute"></div>
      </div>

      {/* Content - add fade-in animation when loading screen is hidden */}
      <div
        className={`flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 relative z-10 ${!showLoadingScreen ? "fade-in" : "opacity-0"}`}
      >
        <div className="w-full max-w-md mx-auto">
          {/* Logo and branding - adjusted for mobile */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
              <div className="relative p-2 sm:p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full backdrop-blur-sm border border-primary/20 mb-3 sm:mb-4">
                <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              NoteDrop
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Manage your airdrop collections</p>
          </div>

          {/* Login card with glass effect - adjusted for mobile */}
          <Card className="backdrop-blur-sm bg-card/80 border-primary/10 shadow-xl">
            <CardHeader className="space-y-1 p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-xl sm:text-2xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center text-xs sm:text-sm">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="email" className="text-xs sm:text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-9 sm:h-11 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm bg-background/50 border-input/50 focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs sm:text-sm font-medium">
                      Password
                    </Label>
                    <Link href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-9 sm:h-11 pl-3 sm:pl-4 pr-3 sm:pr-4 text-sm bg-background/50 border-input/50 focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className={cn(
                    "w-full h-9 sm:h-11 mt-1 sm:mt-2 text-sm font-medium transition-all",
                    "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
                    "shadow-md hover:shadow-lg",
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted"></span>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <div className="text-center w-full">
                <span className="text-xs sm:text-sm text-muted-foreground">Don't have an account? </span>
                <Link
                  href="/signup"
                  className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Update the footer to be more mobile-friendly */}
      <div
        className={`text-center w-full py-3 sm:py-4 text-[10px] sm:text-xs text-muted-foreground relative z-10 ${!showLoadingScreen ? "fade-in" : "opacity-0"}`}
      >
        &copy; {new Date().getFullYear()} NoteDrop. All rights reserved.
      </div>
    </div>
  )
}

