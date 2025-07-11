"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ExternalLink,
  Copy,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Globe,
  User,
  Crown,
  Mail,
  Building,
} from "lucide-react"
import { toast } from "sonner"
import type { ProcessedApp } from "@/types/app"

interface AppDetailsModalProps {
  app: ProcessedApp | null
  isOpen: boolean
  onClose: () => void
}

export function AppDetailsModal({ app, isOpen, onClose }: AppDetailsModalProps) {
  if (!app) return null
  console.log('app:',app)
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const openAppStore = () => {
    if (app.linkedAppInfo?.appStoreId) {
      const url =
        app.platform === "ANDROID"
          ? `https://play.google.com/store/apps/details?id=${app.linkedAppInfo.appStoreId}`
          : `https://apps.apple.com/app/id${app.linkedAppInfo.appStoreId}`
      window.open(url, "_blank")
    }
  }

  const getStatusColor = (status: string) => {
    return status === "APPROVED" ? "text-green-600" : "text-orange-600"
  }

  const getStatusIcon = (status: string) => {
    return status === "APPROVED" ? CheckCircle : AlertCircle
  }

  const StatusIcon = getStatusIcon(app.approvalState)

  const accountInfo = app.account_id
  console.log('accountInfo',accountInfo)
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            App Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{app.displayName}</h2>
              {app.linkedAppInfo && app.linkedAppInfo.displayName !== app.displayName && (
                <p className="text-muted-foreground">Store Name: {app.linkedAppInfo.displayName}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={app.platform === "ANDROID" ? "text-green-600" : "text-blue-600"}>
                {app.platform}
              </Badge>
              <Badge
                variant={app.approvalState === "APPROVED" ? "default" : "secondary"}
                className={
                  app.approvalState === "APPROVED" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                }
              >
                <StatusIcon className="w-3 h-3 mr-1" />
                {app.approvalState === "APPROVED" ? "Approved" : "Action Required"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">App ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted px-2 py-1 rounded flex-1">{app.appId}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(app.appId, "App ID")}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Publisher ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted px-2 py-1 rounded flex-1">{app.publisherId}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(app.publisherId, "Publisher ID")}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Platform</label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={app.platform === "ANDROID" ? "text-green-600" : "text-blue-600"}
                    >
                      <Smartphone className="w-3 h-3 mr-1" />
                      {app.platform}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {accountInfo ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{accountInfo.name}</span>
                        {accountInfo.isLeader && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                            <Crown className="w-3 h-3 mr-1" />
                            Leader
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Account ID</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm bg-muted px-2 py-1 rounded flex-1">{accountInfo._id}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(accountInfo._id, "Account ID")}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Private Email</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{accountInfo.email_private}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(accountInfo.email_private, "Private Email")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Company Email</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{accountInfo.email_company}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(accountInfo.email_company, "Company Email")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>

                    <div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="bg-muted rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Chưa được assign cho ai</p>
                    <p className="text-xs text-muted-foreground mt-1">App này chưa được gán cho account nào</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Store Information */}
          {app.linkedAppInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Store Name</label>
                    <p className="text-sm mt-1">{app.linkedAppInfo.displayName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Store ID</label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm bg-muted px-2 py-1 rounded flex-1">{app.linkedAppInfo.appStoreId}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(app.linkedAppInfo!.appStoreId, "Store ID")}
                        className="h-8 w-8 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Button onClick={openAppStore} className="w-full flex items-center gap-2" size="sm">
                  <ExternalLink className="h-4 w-4" />
                  View in {app.platform === "ANDROID" ? "Play Store" : "App Store"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Status Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <StatusIcon className={`h-4 w-4 ${getStatusColor(app.approvalState)}`} />
                Approval Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${getStatusColor(app.approvalState)}`}>
                    {app.approvalState === "APPROVED" ? "Approved" : "Action Required"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {app.approvalState === "APPROVED"
                      ? "This app is approved and can show ads"
                      : "This app requires action before it can show ads"}
                  </p>
                </div>
                <Badge
                  variant={app.approvalState === "APPROVED" ? "default" : "secondary"}
                  className={
                    app.approvalState === "APPROVED" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                  }
                >
                  {app.approvalState}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
