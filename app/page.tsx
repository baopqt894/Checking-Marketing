"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { EyeIcon, EyeOffIcon, Zap } from "lucide-react"
import { setAuthCookies, setAuthLocalStorage, isAuthenticated } from "@/lib/auth"

const LoginForm = ({ onSubmit, isLoading }: { onSubmit: (e: React.FormEvent) => void; isLoading: boolean }) => {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="userEmail" className="text-sm font-medium">
          Email address
        </Label>
        <Input
          type="email"
          id="userEmail"
          name="email"
          placeholder="you@example.com"
          defaultValue="admin@example.com"
          className="h-11 border-2 border-gray-300 focus:border-primary"
          required
        />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={isVisible ? "text" : "password"}
            placeholder="Enter your password"
            className="h-11 pr-10 border-2 border-gray-300 focus:border-primary"
            defaultValue="admin"
            required
          />
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setIsVisible((prevState) => !prevState)}
            className="absolute inset-y-0 right-0 h-full px-3 hover:bg-transparent"
          >
            {isVisible ? (
              <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <EyeIcon className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">{isVisible ? "Hide password" : "Show password"}</span>
          </Button>
        </div>
      </div>

      {/* Remember Me */}
      <div className="flex items-center gap-2">
        <Checkbox id="rememberMe" />
        <Label htmlFor="rememberMe" className="text-sm font-normal text-muted-foreground cursor-pointer">
          Remember me for 30 days
        </Label>
      </div>

      <Button
        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      // User is already logged in, redirect to dashboard
      window.location.href = "/dashboard/app-performance"
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BACKEND_URL}auth/login`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Login failed. Please check your credentials.")
      }

      const data = await response.json()
      console.log("[v0] Login successful:", data)

      // Extract tokens and user info
      const accessToken = data.access_token || data.accessToken || data.token
      const refreshToken = data.refresh_token || data.refreshToken
      const userInfo = data.user || data.userInfo || {}

      if (accessToken) {
        // Prepare auth data
        const authData = {
          accessToken,
          refreshToken,
          userInfo: Object.keys(userInfo).length > 0 ? userInfo : undefined
        }

        // Save to both localStorage and cookies using utility functions
        setAuthLocalStorage(authData)
        setAuthCookies(authData)

        console.log("[v0] Authentication data saved successfully")
      }

      window.location.href = "/dashboard/app-performance"
    } catch (err) {
      console.error("[v0] Login error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    console.log("Google login clicked")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Zap className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">AdMob Dashboard</h1>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold tracking-tight text-balance">Welcome back</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Sign in to access your dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Login Form */}
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              variant="outline"
              className="w-full h-11 border-border hover:bg-secondary bg-transparent"
              onClick={handleGoogleLogin}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="font-medium">Google</span>
            </Button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="#" className="font-medium text-foreground hover:underline">
                Sign up
              </a>
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
