"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Globe, User, Database, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Publisher, PublisherOption } from "@/types/publisher"


interface PublisherSelectorProps {
  selectedPublisherId: string | null
  onPublisherChange: (publisherId: string) => void
  onSyncData: (publisherId: string) => void
  isSyncing: boolean
}

export function PublisherSelector({
  selectedPublisherId,
  onPublisherChange,
  onSyncData,
  isSyncing,
}: PublisherSelectorProps) {
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

      // If no publisher is selected and we have options, select the first one
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
      } else {
        toast.success(`Loaded ${publisherOptions.length} publisher${publisherOptions.length !== 1 ? "s" : ""}`)
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

  useEffect(() => {
    fetchPublishers()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Publisher Selection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Select Publisher</label>
            <Select value={selectedPublisherId || ""} onValueChange={handlePublisherChange} disabled={loading}>
              <SelectTrigger>
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

          <div className="flex flex-col justify-end">
            <Button
              onClick={handleSyncData}
              disabled={!selectedPublisherId || isSyncing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync from AdMob"}
            </Button>
          </div>
        </div>

        {publishers.length === 0 && !loading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800">No Publishers Available</p>
                <p className="text-xs text-yellow-600 mt-1">
                  No publishers with valid Publisher IDs were found. Please ensure publishers have configured their
                  Publisher IDs.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedPublisher && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Selected Publisher
              </h4>
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                {publishers.length} total
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Publisher ID:</span>
                <div className="font-mono text-xs bg-background px-2 py-1 rounded mt-1">{selectedPublisher.id}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <div className="text-xs mt-1">{selectedPublisher.email}</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {publishers.length > 0
              ? `${publishers.length} publisher${publishers.length !== 1 ? "s" : ""} available`
              : "No publishers available"}
          </span>
          <Button variant="ghost" size="sm" onClick={fetchPublishers} disabled={loading} className="h-auto p-1 text-xs">
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh List
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
