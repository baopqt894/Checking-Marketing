"use client"

import type React from "react"

import { useSession, signIn } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard/app-performance")
    }
  }, [status, router])

  const handleUsernameLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simple admin/admin validation
    if (formData.username === "admin" && formData.password === "admin") {
      // Simulate login success - redirect to dashboard
      router.push("/dashboard/app-performance")
    } else {
      alert("Invalid credentials. Use admin/admin")
    }

    setIsLoading(false)
  }

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    await signIn("google", {
      callbackUrl: "/dashboard/app-performance",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
          <CardDescription className="text-gray-600">Sign in to your account to continue</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleUsernameLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
              Sign in
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            className="w-full h-11 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 font-medium"
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="animate-spin w-4 h-4 mr-2" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20" height="20" className="mr-2">
                <path
                  fill="#4285F4"
                  d="M24 9.5c3.1 0 5.9 1.1 8 2.9l6-6C33.8 3.2 29.2 1 24 1 14.6 1 6.7 6.8 3.2 15h7.4c2-4.1 6.3-7 11.4-7z"
                />
                <path
                  fill="#34A853"
                  d="M46.1 24.6c0-1.6-.1-2.8-.4-4H24v7.6h12.4c-.5 2.7-2.1 5-4.4 6.6l7 5.4c4-3.7 6.1-9.2 6.1-15.6z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.6 28.9c-.5-1.5-.8-3.2-.8-4.9s.3-3.4.8-4.9l-7.4-5.7C2.4 16.3 1 20 1 24s1.4 7.7 3.7 10.6l7.3-5.7z"
                />
                <path
                  fill="#EA4335"
                  d="M24 47c5.2 0 9.8-1.7 13.1-4.7l-7-5.4c-2 1.3-4.6 2.1-7.1 2.1-5.1 0-9.4-2.9-11.4-7h-7.4C6.7 41.2 14.6 47 24 47z"
                />
              </svg>
            )}
            Sign in with Google
          </Button>

          <p className="text-xs text-center text-gray-500 mt-4">
            Demo credentials: <span className="font-medium">admin / admin</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
