"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Users, Crown, CheckCircle, XCircle, Mail, Building, Smartphone, Clock, Monitor } from "lucide-react"
import { toast } from "sonner"
import type { Account } from "@/types/account"

interface ActualAppInfo {
  _id: string
  id: string
  Publisher_id: string
  account_id: string
  app: Array<{
    name: string
    appId: string
    platform: "ANDROID" | "IOS"
    appApprovalState: "APPROVED" | "ACTION_REQUIRED"
    manualAppInfo: {
      displayName: string
    }
    linkedAppInfo?: {
      displayName: string
      appStoreId: string
    }
  }>
  __v: number
}

interface AccountDetailsModalProps {
  account: Account | null
  isOpen: boolean
  onClose: () => void
}

export function AccountDetailsModal({ account, isOpen, onClose }: AccountDetailsModalProps) {
  if (!account) return null

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (err) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getAppDisplayInfo = (appInfo: string | any) => {
    if (typeof appInfo === "string") {
      return {
        id: appInfo,
        displayName: `App ${appInfo.slice(-6)}`,
        platform: "ANDROID" as const,
        appId: appInfo,
        approvalState: "ACTION_REQUIRED" as const,
      }
    }

    // Handle ActualAppInfo structure
    const actualAppInfo = appInfo as ActualAppInfo
    const app = actualAppInfo.app?.[0]

    if (!app) {
      return {
        id: actualAppInfo._id,
        displayName: `App ${actualAppInfo._id.slice(-6)}`,
        platform: "ANDROID" as const,
        appId: actualAppInfo._id,
        approvalState: "ACTION_REQUIRED" as const,
      }
    }

    return {
      id: actualAppInfo._id,
      displayName: app.linkedAppInfo?.displayName || app.manualAppInfo?.displayName || "Unknown App",
      platform: app.platform,
      appId: app.appId,
      shortAppId: app.appId.length > 12 ? `...${app.appId.slice(-12)}` : app.appId,
      approvalState: app.appApprovalState,
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Account Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Account Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">{account.name}</h2>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>{account.email_private}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-3 w-3" />
                  <span>{account.email_company}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={account.isActive ? "default" : "secondary"}
                className={account.isActive ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}
              >
                {account.isActive ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                {account.isActive ? "Active" : "Inactive"}
              </Badge>
              {account.isLeader && (
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <Crown className="w-3 h-3 mr-1" />
                  Leader
                </Badge>
              )}
            </div>
          </div>

          {/* Account Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Account ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted px-2 py-1 rounded flex-1">{account.id}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(account.id, "Account ID")}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{account.name}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Private Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{account.email_private}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(account.email_private || "", "Private Email")}
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
                    <span className="text-sm">{account.email_company}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(account.email_company || "", "Company Email")}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-2 w-2" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <div className="mt-1">
                    {account.isLeader ? (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        <Crown className="w-3 h-3 mr-1" />
                        Leader
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-blue-600">
                        Member
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  App Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Apps</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">{account.appInfos?.length || 0} apps</span>
                  </div>
                </div>

                {account.appInfos && account.appInfos.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Apps</label>
                    <ScrollArea className="mt-2 h-64 ">
                      <div className="space-y-2">
                        {account.appInfos.map((appInfo, index) => {
                          const appDetails = getAppDisplayInfo(appInfo)
                          console.log("Account details - rendering app:", appInfo, "processed:", appDetails)
                          return (
                            <div
                              key={`${appDetails.id}-${index}`}
                              className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30"
                            >
                              <div className="flex items-center gap-2 flex-1">
                                {appDetails.platform === "ANDROID" ? (
                                  <Smartphone className="h-4 w-4 text-blue-600" />
                                ) : appDetails.platform === "IOS" ? (
                                  <Monitor className="h-4 w-4 text-blue-600" />
                                ) : (
                                  <div className="h-4 w-4 bg-gray-400 rounded" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm truncate" title={appDetails.displayName}>
                                    {appDetails.displayName.length > 25
                                      ? `${appDetails.displayName.slice(0, 25)}...`
                                      : appDetails.displayName}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate" title={appDetails.appId}>
                                    {appDetails.appId.length > 12
                                      ? `...${appDetails.appId.slice(-12)}`
                                      : appDetails.appId}
                                  </div>
                                </div>
                                <Badge
                                  variant={appDetails.approvalState === "APPROVED" ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {appDetails.approvalState}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(appDetails.appId, "App ID")}
                                className="h-6 w-6 p-0"
                              >
                                <Copy className="h-2 w-2" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {(!account.appInfos || account.appInfos.length === 0) && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">No apps configured</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Account Created:</span>
                  <div className="font-medium">{formatDate(account.created_at)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Account Updated:</span>
                  <div className="font-medium">{formatDate(account.updated_at)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Created By:</span>
                  <div className="font-medium">{account.created_by || "System"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Updated By:</span>
                  <div className="font-medium">{account.update_by || "System"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
