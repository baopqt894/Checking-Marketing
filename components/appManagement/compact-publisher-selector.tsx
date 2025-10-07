"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Globe, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import type { Publisher, PublisherOption } from "@/types/publisher"

interface CompactPublisherSelectorProps {
  selectedPublisherId: string | null
  onPublisherChange: (publisherId: string) => void
  onSyncData: (publisherId: string) => void
  isSyncing: boolean
  lastSyncTime: string | null
  syncError: string | null
}

export function CompactPublisherSelector({
  selectedPublisherId,
  onPublisherChange,
  onSyncData,
  isSyncing,
  lastSyncTime,
  syncError,
}: CompactPublisherSelectorProps) {
  const [publishers, setPublishers] = useState<PublisherOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPublisher, setSelectedPublisher] = useState<PublisherOption | null>(null)

  const fetchPublishers = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL
      const response = await fetch(`${apiUrl}tokens/publishers`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: Publisher[] = await response.json()

      const publisherOptions: PublisherOption[] = []

      data.forEach((publisher) => {
        if (publisher.publisher_ids && publisher.publisher_ids.length > 0) {
          publisher.publisher_ids.forEach((pubId) => {
            publisherOptions.push({
              id: pubId,
              label: pubId,
              email: publisher.email,
            })
          })
        }
      })

      setPublishers(publisherOptions)

      if (!selectedPublisherId && publisherOptions.length > 0) {
        const firstPublisher = publisherOptions[0]
        setSelectedPublisher(firstPublisher)
        onPublisherChange(firstPublisher.id)
      } else if (selectedPublisherId) {
        const currentPublisher = publisherOptions.find((p) => p.id === selectedPublisherId)
        setSelectedPublisher(currentPublisher || null)
      }

      if (publisherOptions.length === 0) {
        toast.warning("No publishers with valid Publisher IDs found")
      }
    } catch (err) {
      console.error("Failed to fetch publishers:", err)
      toast.error("Failed to fetch publishers")
    } finally {
      setLoading(false)
    }
  }

  const handlePublisherChange = (publisherId: string) => {
    const publisher = publishers.find((p) => p.id === publisherId)
    setSelectedPublisher(publisher || null)
    onPublisherChange(publisherId)
  }

    const handleSyncData = () => {
    if (selectedPublisherId) {
      onSyncData(selectedPublisherId)
    }
  }

  const getSyncStatusIcon = () => {
    if (isSyncing) return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
    if (syncError) return <AlertCircle className="h-4 w-4 text-red-600" />
    if (lastSyncTime) return <CheckCircle className="h-4 w-4 text-green-600" />
    return <Globe className="h-4 w-4 text-muted-foreground" />
  }

  const formatSyncTime = (time: string | null) => {
    if (!time) return "Never synced"
    return `Last sync: ${new Date(time).toLocaleString()}`
  }

  useEffect(() => {
    fetchPublishers()
  }, [])

  return (
    <Card className="mb-7">
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        
          <div className="flex-1 min-w-0 h-10">
            <div className="flex items-center gap-3">
              <Globe className="h-7 w-7 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Select value={selectedPublisherId || ""} onValueChange={handlePublisherChange} disabled={loading}>
                  <SelectTrigger className="w-full h-1 !h-auto">
                    <SelectValue placeholder={loading ? "Loading publishers..." : "Select a publisher"} />
                  </SelectTrigger>
                  <SelectContent>
                    {publishers.map((publisher) => (
                      <SelectItem key={publisher.id} value={publisher.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{publisher.id}</span>
                          <span className="text-xs text-muted-foreground">{publisher.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getSyncStatusIcon()}
              <span className="hidden sm:inline">{formatSyncTime(lastSyncTime)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchPublishers}
                disabled={loading}
                className="flex items-center gap-2 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>

              <Button
                onClick={handleSyncData}
                disabled={!selectedPublisherId || isSyncing}
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync AdMob"}
              </Button>
            </div>
          </div>
        </div>

        {selectedPublisher && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {selectedPublisher.email}
                </Badge>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{publishers.length} publishers available</span>
              </div>
              {syncError && (
                <Badge variant="destructive" className="text-xs">
                  Sync Error
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* No Publishers Warning */}
        {publishers.length === 0 && !loading && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">No Publishers Available</p>
                <p className="text-xs text-blue-600 mt-1">
                  No publishers with valid Publisher IDs were found. Please ensure publishers have configured their
                  Publisher IDs.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
