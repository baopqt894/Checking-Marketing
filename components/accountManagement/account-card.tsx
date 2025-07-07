"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Settings, Mail } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Token {
  _id: string
  email: string
  access_token: string
  refresh_token: string
  google_client_id?: string
  google_client_secret?: string
  google_redirect_uri?: string
  publisher_ids?: string[]
  currency_code?: string
  reporting_time_zone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AccountCardProps {
  token: Token
  onClick: () => void
}

export function AccountCard({ token, onClick }: AccountCardProps) {
  const isConfigured = token.is_active
  const publisherCount = token.publisher_ids?.length || 0
  const lastUpdated = formatDistanceToNow(new Date(token.updated_at), { addSuffix: true })

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-medium">{token.email}</h3>
          </div>
          <Badge variant={isConfigured ? "success" : "destructive"}>{isConfigured ? "Active" : "Inactive"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Publishers:</span>
            <span className="font-medium">{publisherCount}</span>
          </div>
          <div className="flex justify-between">
            <span>Google Config:</span>
            <span className="font-medium">{token.google_client_id ? "Set" : "Not Set"}</span>
          </div>
          <div className="flex justify-between">
            <span>Currency:</span>
            <span className="font-medium">{token.currency_code || "Not Set"}</span>
          </div>
          <div className="flex justify-between">
            <span>Timezone:</span>
            <span className="font-medium">{token.reporting_time_zone || "Not Set"}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Updated:</span>
            <span className="font-medium">{lastUpdated}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 pt-2">
        <Button variant="outline" className="w-full gap-2" onClick={onClick}>
          <Settings className="h-4 w-4" />
          Configure
        </Button>
      </CardFooter>
    </Card>
  )
}
