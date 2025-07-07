// app/apps/[appName]/page.tsx
"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useParams } from "next/navigation"
import { AppCard } from "@/components/app-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface App {
  id: string
  app: string
  appIdAdmob: string
  country: string
  platform: string
  isActive: string
  countryCount?: number
  platformCount?: number
}

export default function AppByNamePage() {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const appName = params.appName as string

  const fetchApps = async () => {
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;  
      const res = await axios.get(`${apiUrl}/apps/test/${appName}`)
      setApps(res.data)
    } catch (error) {
      console.error("Error fetching apps:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (appName) fetchApps()
  }, [appName])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Apps for "{decodeURIComponent(appName)}"</h1>

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : apps.length === 0 ? (
        <div className="text-muted-foreground">No apps found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>

   
        </>
      )}
    </div>
  )
}
