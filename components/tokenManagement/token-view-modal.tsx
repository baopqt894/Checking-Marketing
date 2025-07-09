"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Copy, Eye, EyeOff, Edit, Save, X, Plus, Trash2, BarChart3 } from "lucide-react"
import { toast } from "sonner"
import type { Token } from "@/types/token"
import type { AdMobResponse } from "@/types/admob"
import type { AnalyticsSummary, AppAnalyticsSummary, CountryAnalytics } from "@/types/daily-analytics"
import { ComprehensiveAnalyticsDashboard } from "../analytisc/comprehensive-analytics-dashboard"


interface TokenViewModalProps {
  isOpen: boolean
  token: Token | null
  onClose: () => void
}

export default function TokenViewModal({ isOpen, token, onClose }: TokenViewModalProps) {
  const [currentToken, setCurrentToken] = useState<Token | null>(null)
  const [googleAuthUrl, setGoogleAuthUrl] = useState<string | null>(null)
  const [showAccessToken, setShowAccessToken] = useState(false)
  const [showRefreshToken, setShowRefreshToken] = useState(false)
  const [isEditingPublisherIds, setIsEditingPublisherIds] = useState(false)
  const [editablePublisherIds, setEditablePublisherIds] = useState<string[]>([])
  const [isUpdatingPublisherIds, setIsUpdatingPublisherIds] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)

  // Update currentToken when token prop changes
  useEffect(() => {
    if (token) {
      setCurrentToken({ ...token })
      setEditablePublisherIds(token.publisher_ids || [])
    }
  }, [token])

  useEffect(() => {
    if (currentToken) {
      const redirectUri = currentToken.google_redirect_uri || "YOUR_DEFAULT_REDIRECT_URI"
      const clientId = currentToken.google_client_id || "YOUR_DEFAULT_GOOGLE_CLIENT_ID"
      const scopes = [
        "openid",
        "profile",
        "email",
        "https://www.googleapis.com/auth/admob.report",
        "https://www.googleapis.com/auth/admob.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" ")

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent`
      setGoogleAuthUrl(authUrl)
    }
  }, [currentToken])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")

    const fetchTokens = async () => {
      if (code && currentToken) {
        try {
          console.log("🔗 Fetching tokens with code:", code)
          console.log("🔗 Using token data:", currentToken)

          const response = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              code,
              client_id: currentToken.google_client_id,
              client_secret: currentToken.google_client_secret,
              redirect_uri: currentToken.google_redirect_uri,
              grant_type: "authorization_code",
            }),
          })

          const data = await response.json()
          console.log("🔗 Response:", data)

          if (data.access_token && data.refresh_token) {
            console.log("✅ Access Token:", data.access_token)
            console.log("🔁 Refresh Token:", data.refresh_token)

            // Update the current token state with new tokens
            setCurrentToken((prev) =>
              prev
                ? {
                    ...prev,
                    access_token: data.access_token,
                    refresh_token: data.refresh_token,
                    updatedAt: new Date().toISOString(),
                  }
                : null,
            )

            const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
            const saveResponse = await fetch(`${apiUrl}tokens/save-token`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: currentToken.email,
                access_token: data.access_token,
                refresh_token: data.refresh_token,
              }),
            })

            if (!saveResponse.ok) {
              const err = await saveResponse.json()
              throw new Error(err.message || "Failed to save token to server")
            }

            toast.success("Tokens updated successfully!")
          } else {
            console.error("❌ Invalid token response:", data)
            toast.error("Failed to get valid tokens")
          }
        } catch (error) {
          console.error("❌ Failed to fetch or save tokens:", error)
          toast.error("Failed to fetch or save tokens")
        }
      }
    }

    fetchTokens()
  }, [currentToken])

  if (!currentToken) return null

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
      toast.success("Copy successful")
    } catch (err) {
      console.error("Failed to copy text: ", err)
      toast.error("Copy failed")
    }
  }

  const handleAddPublisherId = () => {
    setEditablePublisherIds([...editablePublisherIds, ""])
  }

  const handleRemovePublisherId = (index: number) => {
    setEditablePublisherIds(editablePublisherIds.filter((_, i) => i !== index))
  }

  const handlePublisherIdChange = (index: number, value: string) => {
    const updated = [...editablePublisherIds]
    updated[index] = value
    setEditablePublisherIds(updated)
  }

  const handleSavePublisherIds = async () => {
    if (!currentToken.id) {
      toast.error("Token ID not found")
      return
    }

    setIsUpdatingPublisherIds(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const response = await fetch(`${apiUrl}tokens/${currentToken.id}/publisher-ids`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publisherIds: editablePublisherIds.filter((id) => id.trim() !== ""),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update publisher IDs")
      }

      const updatedToken = await response.json()
      setCurrentToken((prev) =>
        prev
          ? {
              ...prev,
              publisher_ids: updatedToken.publisher_ids || editablePublisherIds.filter((id) => id.trim() !== ""),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )

      setIsEditingPublisherIds(false)
      toast.success("Publisher IDs updated successfully!")
    } catch (error) {
      console.error("Failed to update publisher IDs:", error)
      toast.error("Failed to update publisher IDs")
    } finally {
      setIsUpdatingPublisherIds(false)
    }
  }

  const handleCancelEdit = () => {
    setEditablePublisherIds(currentToken.publisher_ids || [])
    setIsEditingPublisherIds(false)
  }

  // Fetch daily data for each day individually
  const fetchDailyDataFromAPI = async (appId: string, accessToken: string, publisherId: string) => {
    const dailyData = []
    const promises = []

    // Create promises for each day
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const requestBody = {
        reportSpec: {
          dateRange: {
            startDate: {
              year: date.getFullYear(),
              month: date.getMonth() + 1,
              day: date.getDate(),
            },
            endDate: {
              year: date.getFullYear(),
              month: date.getMonth() + 1,
              day: date.getDate(),
            },
          },
          dimensions: ["APP"],
          metrics: ["CLICKS", "ESTIMATED_EARNINGS", "IMPRESSIONS", "OBSERVED_ECPM", "IMPRESSION_CTR"],
          dimensionFilters: [
            {
              dimension: "APP",
              matchesAny: {
                values: [appId],
              },
            },
          ],
        },
      }

      const promise = fetch(`https://admob.googleapis.com/v1/accounts/${publisherId}/mediationReport:generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
        .then(async (response) => {
          if (!response.ok) {
            console.warn(`Failed to fetch data for ${date.toISOString().split("T")[0]}`)
            return {
              date: date.toISOString().split("T")[0],
              estimated_earnings: 0,
              impressions: 0,
              observed_ecpm: 0,
              clicks: 0,
              requests: 0,
              ctr: 0,
            }
          }

          const data: AdMobResponse[] = await response.json()
          const rows = data.filter((item) => item.row).map((item) => item.row!)

          let dayEarnings = 0
          let dayImpressions = 0
          let dayClicks = 0
          let dayEcpm = 0

          rows.forEach((row) => {
            dayEarnings += Number.parseInt(row.metricValues.ESTIMATED_EARNINGS?.microsValue || "0")
            dayImpressions += Number.parseInt(row.metricValues.IMPRESSIONS?.integerValue || "0")
            dayClicks += Number.parseInt(row.metricValues.CLICKS?.integerValue || "0")
            dayEcpm += Number.parseInt(row.metricValues.OBSERVED_ECPM?.microsValue || "0")
          })

          return {
            date: date.toISOString().split("T")[0],
            estimated_earnings: dayEarnings,
            impressions: dayImpressions,
            observed_ecpm: dayEcpm,
            clicks: dayClicks,
            requests: Math.floor(dayImpressions * 1.2),
            ctr: dayImpressions > 0 ? dayClicks / dayImpressions : 0,
          }
        })
        .catch(() => ({
          date: date.toISOString().split("T")[0],
          estimated_earnings: 0,
          impressions: 0,
          observed_ecpm: 0,
          clicks: 0,
          requests: 0,
          ctr: 0,
        }))

      promises.push(promise)
    }

    // Wait for all API calls to complete
    const results = await Promise.all(promises)
    return results.sort((a, b) => a.date.localeCompare(b.date))
  }

  const processAdMobDataToAnalyticsSummary = async (rawData: AdMobResponse[]): Promise<AnalyticsSummary> => {
    const header = rawData.find((item) => item.header)?.header
    const rows = rawData.filter((item) => item.row).map((item) => item.row!)

    let totalEarnings = 0
    let totalClicks = 0
    let totalImpressions = 0
    let totalRequests = 0
    let totalEcpm = 0
    let totalCtr = 0

    const appMap = new Map<
      string,
      {
        earnings: number
        clicks: number
        impressions: number
        requests: number
        ecpm: number
        ctr: number
        platform: "ANDROID" | "IOS"
        app_id: string
      }
    >()

    const countryMap = new Map<
      string,
      {
        earnings: number
        clicks: number
        impressions: number
        ctr: number
      }
    >()

    console.log("🔄 Processing AdMob data...")

    rows.forEach((row) => {
      console.log("Processing row:", row)
      const earnings = Number.parseInt(row.metricValues.ESTIMATED_EARNINGS?.microsValue || "0")
      const clicks = Number.parseInt(row.metricValues.CLICKS?.integerValue || "0")
      const impressions = Number.parseInt(row.metricValues.IMPRESSIONS?.integerValue || "0")
      const requests = Math.floor(impressions * 1.2)
      const ecpm = Number.parseInt(row.metricValues.OBSERVED_ECPM?.microsValue || "0")
      const ctr = impressions > 0 ? clicks / impressions : 0

      totalEarnings += earnings
      totalClicks += clicks
      totalImpressions += impressions
      totalRequests += requests
      totalEcpm += ecpm
      totalCtr += ctr

      const appLabel = row.dimensionValues.APP?.displayLabel || "Unknown App"
      const appId = row.dimensionValues.APP?.value || `app_${Math.random().toString(36).substr(2, 9)}`
      const platform = appLabel.toLowerCase().includes("ios") ? "IOS" : "ANDROID"

      console.log("appMap:", appMap)
      if (appMap.has(appLabel)) {
        const existing = appMap.get(appLabel)!
        appMap.set(appLabel, {
          earnings: existing.earnings + earnings,
          clicks: existing.clicks + clicks,
          impressions: existing.impressions + impressions,
          requests: existing.requests + requests,
          ecpm: existing.ecpm + ecpm,
          ctr: existing.ctr + ctr,
          platform: existing.platform,
          app_id: existing.app_id,
        })
      } else {
        appMap.set(appLabel, {
          earnings,
          clicks,
          impressions,
          requests,
          ecpm,
          ctr,
          platform,
          app_id: appId,
        })
      }

      const country = row.dimensionValues.COUNTRY?.value || "Unknown"
      if (countryMap.has(country)) {
        const existing = countryMap.get(country)!
        countryMap.set(country, {
          earnings: existing.earnings + earnings,
          clicks: existing.clicks + clicks,
          impressions: existing.impressions + impressions,
          ctr: existing.ctr + ctr,
        })
      } else {
        countryMap.set(country, {
          earnings,
          clicks,
          impressions,
          ctr,
        })
      }
    })

    // Fetch real daily data for each app
    console.log("🔄 Fetching daily data for each app...")
    const appDataPromises = Array.from(appMap.entries()).map(async ([appName, data]) => {
      console.log(`🔄 Fetching daily data for app: ${appName}`)

      const dailyData = await fetchDailyDataFromAPI(
        data.app_id,
        currentToken.access_token || "",
        currentToken.publisher_ids?.[0] || "",
      )

      console.log(`✅ Fetched ${dailyData.length} daily records for ${appName}`)

      return {
        app_id: data.app_id,
        app_name: appName,
        platform: data.platform,
        total_earnings: data.earnings,
        total_impressions: data.impressions,
        total_clicks: data.clicks,
        average_ecpm: data.ecpm,
        average_ctr: data.impressions > 0 ? data.clicks / data.impressions : 0,
        daily_data: dailyData,
      }
    })

    const appData: AppAnalyticsSummary[] = (await Promise.all(appDataPromises)).sort(
      (a, b) => b.total_earnings - a.total_earnings,
    )

    const countryData: CountryAnalytics[] = Array.from(countryMap.entries())
      .map(([country, data]) => ({
        country,
        earnings: data.earnings,
        clicks: data.clicks,
        impressions: data.impressions,
        ctr: data.impressions > 0 ? data.clicks / data.impressions : 0,
      }))
      .sort((a, b) => b.earnings - a.earnings)

    const dateRange = header
      ? `${header.dateRange.startDate.year}-${header.dateRange.startDate.month.toString().padStart(2, "0")}-${header.dateRange.startDate.day.toString().padStart(2, "0")} to ${header.dateRange.endDate.year}-${header.dateRange.endDate.month.toString().padStart(2, "0")}-${header.dateRange.endDate.day.toString().padStart(2, "0")}`
      : "Last 30 Days"

    return {
      totalEarnings,
      totalClicks,
      totalImpressions,
      averageEcpm: totalImpressions > 0 ? Math.floor((totalEarnings / totalImpressions) * 1000000) : 0,
      averageCtr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
      dateRange,
      appData,
      countryData,
    }
  }

  const fetchAnalyticsData = async () => {
    if (!currentToken.access_token) {
      toast.error("No access token available")
      return
    }

    setIsLoadingAnalytics(true)
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const publisherIds = currentToken.publisher_ids || []
      if (publisherIds.length === 0) {
        toast.error("No publisher IDs configured")
        return
      }

      const publisherId = publisherIds[0]
      const requestBody = {
        reportSpec: {
          dateRange: {
            startDate: {
              year: startDate.getFullYear(),
              month: startDate.getMonth() + 1,
              day: startDate.getDate() - 1,
            },
            endDate: {
              year: endDate.getFullYear(),
              month: endDate.getMonth() + 1,
              day: endDate.getDate() - 1,
            },
          },
          dimensions: ["APP", "AD_SOURCE", "COUNTRY"],
          metrics: ["CLICKS", "ESTIMATED_EARNINGS", "IMPRESSIONS", "OBSERVED_ECPM", "IMPRESSION_CTR"],
        },
      }

      const response = await fetch(`https://admob.googleapis.com/v1/accounts/${publisherId}/mediationReport:generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data: AdMobResponse[] = await response.json()
      const processedData = await processAdMobDataToAnalyticsSummary(data)
      setAnalyticsData(processedData)
      console.log("📊 Processed Analytics Data:", processedData)
      setShowAnalytics(true)
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
      toast.error("Failed to fetch analytics data")
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="max-w-[90vw] w-full h-[85vh] p-0 gap-0 overflow-hidden"
          style={{
            transform: "none",
            animation: "none",
            transition: "none",
          }}
        >
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">Token Details</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  onClick={fetchAnalyticsData}
                  disabled={!currentToken.access_token || isLoadingAnalytics}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  {isLoadingAnalytics ? "Loading..." : "View Analytics"}
                </Button>
                <Badge variant={currentToken.is_active ? "default" : "secondary"} className="ml-2">
                  {currentToken.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden px-6 py-4">
            <div className="grid grid-cols-3 gap-6 h-full">
              <div className="space-y-4 overflow-y-auto">
                <div className="border rounded-lg p-4 bg-card">
                  <h3 className="font-semibold text-base mb-3 text-card-foreground">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                      <div className="text-sm p-2 bg-muted rounded border break-all">{currentToken.email}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Created</label>
                        <div className="text-xs p-2 bg-muted rounded border">{formatDate(currentToken.createdAt)}</div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Updated</label>
                        <div className="text-xs p-2 bg-muted rounded border">{formatDate(currentToken.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-card">
                  <h3 className="font-semibold text-base mb-3 text-card-foreground">Google API Config</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Client ID</label>
                      <div className="text-xs font-mono p-2 bg-muted rounded border break-all">
                        {currentToken.google_client_id || "Not configured"}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Client Secret</label>
                      <div className="text-xs font-mono p-2 bg-muted rounded border break-all">
                        {maskSecret(currentToken.google_client_secret) || "Not configured"}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Redirect URI</label>
                      <div className="text-xs font-mono p-2 bg-muted rounded border break-all">
                        {currentToken.google_redirect_uri || "Not configured"}
                      </div>
                    </div>
                    <Button onClick={handleGoogleLogin} disabled={!googleAuthUrl} className="w-full mt-3" size="sm">
                      Login with Google
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto">
                <div className="border rounded-lg p-4 bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-base text-card-foreground">Publisher IDs</h3>
                    {!isEditingPublisherIds && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingPublisherIds(true)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="p-3 bg-muted rounded border min-h-[200px] max-h-[280px] overflow-y-auto">
                    {isEditingPublisherIds ? (
                      <div className="space-y-2">
                        {editablePublisherIds.map((id, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              value={id}
                              onChange={(e) => handlePublisherIdChange(index, e.target.value)}
                              placeholder="Enter Publisher ID"
                              className="text-xs h-8"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePublisherId(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex items-center gap-1 mt-3 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddPublisherId}
                            className="flex items-center gap-1 h-7 text-xs bg-transparent"
                          >
                            <Plus className="h-3 w-3" />
                            Add
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSavePublisherIds}
                            disabled={isUpdatingPublisherIds}
                            className="flex items-center gap-1 h-7 text-xs"
                          >
                            <Save className="h-3 w-3" />
                            {isUpdatingPublisherIds ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 h-7 text-xs bg-transparent"
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {currentToken.publisher_ids && currentToken.publisher_ids.length > 0 ? (
                          <ul className="space-y-1">
                            {currentToken.publisher_ids.map((id, index) => (
                              <li key={index} className="text-xs font-mono bg-background p-2 rounded break-all">
                                {id}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-muted-foreground">No publisher IDs configured</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Other Settings */}
                <div className="border rounded-lg p-4 bg-card">
                  <h3 className="font-semibold text-base mb-3 text-card-foreground">Other Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Currency</label>
                      <div className="text-sm p-2 bg-muted rounded border">
                        {currentToken.currency_code || "Not configured"}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Timezone</label>
                      <div className="text-sm p-2 bg-muted rounded border">
                        {currentToken.reporting_time_zone || "Not configured"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto">
                <div className="border rounded-lg p-4 bg-card">
                  <h3 className="font-semibold text-base mb-3 text-card-foreground">Authentication Tokens</h3>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">Access Token</label>
                      <div className="flex items-center gap-1">
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
                          onClick={() => copyToClipboard(currentToken.access_token || "", "Access Token")}
                          className="h-6 w-6 p-0"
                          disabled={!currentToken.access_token}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs font-mono p-3 bg-muted rounded border break-all leading-relaxed max-h-[140px] overflow-y-auto">
                      {showAccessToken
                        ? currentToken.access_token || "Not available"
                        : maskSecret(currentToken.access_token)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-muted-foreground">Refresh Token</label>
                      <div className="flex items-center gap-1">
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
                          onClick={() => copyToClipboard(currentToken.refresh_token || "", "Refresh Token")}
                          className="h-6 w-6 p-0"
                          disabled={!currentToken.refresh_token}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs font-mono p-3 bg-muted rounded border break-all leading-relaxed max-h-[140px] overflow-y-auto">
                      {showRefreshToken
                        ? currentToken.refresh_token || "Not available"
                        : maskSecret(currentToken.refresh_token)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAnalytics} onOpenChange={(open) => !open && setShowAnalytics(false)}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
            <DialogTitle className="text-xl font-semibold">Analytics Dashboard</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {analyticsData && (
              <ComprehensiveAnalyticsDashboard
                data={analyticsData}
                dateRange={analyticsData.dateRange}
                isLoading={isLoadingAnalytics}
              />
            )}
          </div>
          <DialogFooter className="flex-shrink-0 px-6 py-4 border-t">
            <Button onClick={() => setShowAnalytics(false)} variant="outline">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function maskSecret(secret?: string): string {
  if (!secret) return ""
  if (secret.length <= 8) return "•".repeat(secret.length)
  return secret.substring(0, 4) + "•".repeat(secret.length - 8) + secret.substring(secret.length - 4)
}
