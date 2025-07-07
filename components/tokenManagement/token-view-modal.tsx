"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Eye, EyeOff } from "lucide-react"

import { toast } from 'sonner';

import type { Token } from "@/types/token"

interface TokenViewModalProps {
  isOpen: boolean
  token: Token | null
  onClose: () => void
}

export default function TokenViewModal({ isOpen, token, onClose }: TokenViewModalProps) {
  const [googleAuthUrl, setGoogleAuthUrl] = useState<string | null>(null)
  const [showAccessToken, setShowAccessToken] = useState(false)
  const [showRefreshToken, setShowRefreshToken] = useState(false)

  useEffect(() => {
    if (token) {
      const redirectUri = token.google_redirect_uri || "YOUR_DEFAULT_REDIRECT_URI"
      const clientId = token.google_client_id || "YOUR_DEFAULT_GOOGLE_CLIENT_ID"
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid profile email&access_type=offline&prompt=consent`
      setGoogleAuthUrl(authUrl)
    }
  }, [token])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")

    const fetchTokens = async () => {
      if (code && token) {
        try {
          console.log("🔗 Fetching tokens with code:", code)
          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              code,
              client_id: token.google_client_id,
              client_secret: token.google_client_secret,
              redirect_uri: token.google_redirect_uri,
              grant_type: "authorization_code",
            }).toString(),
          })
          console.log("🔗 Response status:", response)
          const data = await response.json()

          if (data.access_token && data.refresh_token) {
            console.log("✅ Access Token:", data.access_token)
            console.log("🔁 Refresh Token:", data.refresh_token)

            const saveResponse = await fetch("https://admod-tracking.limgrow.com/tokens/save-token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: token.email,
                access_token: data.access_token,
                refresh_token: data.refresh_token,
              }),
            })
            
            if (!saveResponse.ok) {
              const err = await saveResponse.json()
              throw new Error(err.message || "Failed to save token to server")
            }
          } else {
            console.error("❌ Invalid token response:", data)
          }
        } catch (error) {
          console.error("❌ Failed to fetch or save tokens:", error)
        }
      }
    }

    fetchTokens()
  }, [token])

  useEffect(() => {
    console.log("Token data:", token);
  }, [token]);

  if (!token) return null

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  const handleGoogleLogin = () => {
    if (googleAuthUrl) {
      window.location.href = googleAuthUrl
    }
  }

  const copyToClipboard = async (text: string, tokenType: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copy successful");
    } catch (err) {
      console.error("Failed to copy text: ", err)
      toast.error("Copy failed");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Token Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Account Status</h3>
            <Badge variant={token.is_active ? "success" : "secondary"}>{token.is_active ? "Active" : "Inactive"}</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
              <p className="text-sm">{token.email}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Created At</h4>
                <p className="text-sm">{formatDate(token.createdAt)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Updated At</h4>
                <p className="text-sm">{formatDate(token.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-3">Google API Configuration</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Client ID</h4>
                <p className="text-sm break-all">{token.google_client_id || "Not configured"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Client Secret</h4>
                <p className="text-sm">{maskSecret(token.google_client_secret) || "Not configured"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Redirect URI</h4>
                <p className="text-sm break-all">{token.google_redirect_uri || "Not configured"}</p>
              </div>
              <div className="mt-4">
                <Button onClick={handleGoogleLogin} disabled={!googleAuthUrl}>
                  Login with Google
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-3">Account Configuration</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Publisher IDs</h4>
                {token.publisher_ids && token.publisher_ids.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm">
                    {token.publisher_ids.map((id, index) => (
                      <li key={index}>{id}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No publisher IDs configured</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Currency</h4>
                  <p className="text-sm">{token.currency_code || "Not configured"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Timezone</h4>
                  <p className="text-sm">{token.reporting_time_zone || "Not configured"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-3">Authentication Tokens</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Access Token</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAccessToken(!showAccessToken)}
                      className="h-6 w-6 p-0"
                    >
                      {showAccessToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(token.access_token || "", "Access Token")}
                      className="h-6 w-6 p-0"
                      disabled={!token.access_token}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm font-mono bg-muted p-3 rounded-md break-all leading-relaxed">
                  {showAccessToken ? token.access_token || "Not available" : maskSecret(token.access_token)}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Refresh Token</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowRefreshToken(!showRefreshToken)}
                      className="h-6 w-6 p-0"
                    >
                      {showRefreshToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(token.refresh_token || "", "Refresh Token")}
                      className="h-6 w-6 p-0"
                      disabled={!token.refresh_token}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm font-mono bg-muted p-3 rounded-md break-all leading-relaxed">
                  {showRefreshToken ? token.refresh_token || "Not available" : maskSecret(token.refresh_token)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to mask sensitive information
function maskSecret(secret: string): string {
  if (!secret) return ""
  if (secret.length <= 8) return "•".repeat(secret.length)
  return secret.substring(0, 4) + "•".repeat(secret.length - 8) + secret.substring(secret.length - 4)
}
