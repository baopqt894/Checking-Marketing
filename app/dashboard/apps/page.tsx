"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard-header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface GroupedApp {
  _id: string
  app: string
  countryCount: number
  platformCount: number
}

export default function AppsPage() {
  const [apps, setApps] = useState<GroupedApp[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const fetchGroupedApps = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;  
      const res = await axios.get(`${apiUrl}/apps/test/groupByApp`)
      setApps(res.data)
    } catch (err) {
      console.error("Failed to fetch grouped apps:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (appName: string) => {
    const encoded = encodeURIComponent(appName)
    router.push(`apps/${encoded}`)
  }

  useEffect(() => {
    fetchGroupedApps()
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <DashboardHeader
          title="Your Apps"
          description="Select an app to view more details"
        />
        <Button variant="outline" onClick={fetchGroupedApps}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground py-10 text-sm">
          Loading apps...
        </div>
      ) : apps.length === 0 ? (
        <div className="text-center text-muted-foreground py-10 text-sm">
          No apps found.
        </div>
      ) : (
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">App Name</TableHead>
                <TableHead>Country Count</TableHead>
                <TableHead>Platform Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app._id}>
                  <TableCell>{app.app}</TableCell>
                  <TableCell>{app.countryCount}</TableCell>
                  <TableCell>{app.platformCount}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(app.app)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
