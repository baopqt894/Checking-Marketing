"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Smartphone, ExternalLink, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Update the App interface to remove the icon property
interface App {
  id: string
  app: string
  appIdAdmob: string
  country: string
  platform: string
  isActive: string
}

interface AppCardProps {
  app: App
}

export function AppCard({ app }: AppCardProps) {
  const getBadgeVariant = (status: boolean): "success" | "secondary" => {
    return status ? "secondary" : "success";
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2 border-b">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg truncate" title={app.app}>
              {app.app}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <svg width="15" height="3" viewBox="0 0 15 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M1.5 1.5C1.5 1.89782 1.65804 2.27936 1.93934 2.56066C2.22064 2.84196 2.60218 3 3 3C3.39782 3 3.77936 2.84196 4.06066 2.56066C4.34196 2.27936 4.5 1.89782 4.5 1.5C4.5 1.10218 4.34196 0.720644 4.06066 0.43934C3.77936 0.158035 3.39782 0 3 0C2.60218 0 2.22064 0.158035 1.93934 0.43934C1.65804 0.720644 1.5 1.10218 1.5 1.5ZM7.5 3C7.10218 3 6.72064 2.84196 6.43934 2.56066C6.15804 2.27936 6 1.89782 6 1.5C6 1.10218 6.15804 0.720644 6.43934 0.43934C6.72064 0.158035 7.10218 0 7.5 0C7.89782 0 8.27936 0.158035 8.56066 0.43934C8.84196 0.720644 9 1.10218 9 1.5C9 1.89782 8.84196 2.27936 8.56066 2.56066C8.27936 2.84196 7.89782 3 7.5 3ZM12 3C11.6022 3 11.2206 2.84196 10.9393 2.56066C10.658 2.27936 10.5 1.89782 10.5 1.5C10.5 1.10218 10.658 0.720644 10.9393 0.43934C11.2206 0.158035 11.6022 0 12 0C12.3978 0 12.7794 0.158035 13.0607 0.43934C13.342 0.720644 13.5 1.10218 13.5 1.5C13.5 1.89782 13.342 2.27936 13.0607 2.56066C12.7794 2.84196 12.3978 3 12 3Z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit App
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Delete App
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs font-normal">
              {app.platform}
            </Badge>
            <Badge variant={getBadgeVariant(app.isActive === "true")} className="text-xs">
            {app.isActive ? "Active" : "Inactive"}
          </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Smartphone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">AdMob ID</span>
              <span className="font-mono text-sm truncate" title={app.appIdAdmob}>
                {app.appIdAdmob}
              </span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Country</span>
              <span className="text-sm">{app.country}</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <Button variant="outline" size="sm" className="gap-1">
          <Edit className="h-4 w-4" />
          Edit
        </Button>
        <Button size="sm" className="gap-1" asChild>
          <Link href={`/dashboard/detailapp/${app.id}`}>
            Manage
            <ExternalLink className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
