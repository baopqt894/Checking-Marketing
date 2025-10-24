"use client"

import { useEffect, useMemo, useState, Fragment } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getAccessToken } from "@/lib/auth"
import { Loader2, ChevronDown, ChevronRight, RefreshCcw, ArrowLeft } from "lucide-react"

interface ApiTotals {
  clicks: number
  earnings: number
  impressions: number
  adRequests: number
  matchedRequests: number
  ecpm?: number
  ctr?: number
  matchRate?: number
}
interface ApiAdSource {
  adSourceId: string
  adSourceName: string
  totals: ApiTotals
}
interface ApiAdUnit {
  adUnitId: string
  adUnitName: string
  totals: ApiTotals
  adSources: ApiAdSource[]
}
interface ApiCountryBlock {
  code: string
  totals: ApiTotals
  adUnits: ApiAdUnit[]
}
interface ApiDay {
  date: string
  metrics: {
    ESTIMATED_EARNINGS: number
    CLICKS: number
    IMPRESSIONS: number
    AD_REQUESTS: number
    MATCHED_REQUESTS: number
  }
  countries: ApiCountryBlock[]
}
interface MetricsResponse {
  appId: string
  appName?: string
  metrics: ApiDay[]
}

interface Totals {
  clicks: number
  earnings: number
  impressions: number
  adRequests: number
  matchedRequests: number
}
function addTotals(a: Totals, b: Partial<ApiTotals | Totals>) {
  a.clicks += b.clicks || 0
  a.earnings += b.earnings || 0
  a.impressions += b.impressions || 0
  a.adRequests += b.adRequests || 0
  a.matchedRequests += b.matchedRequests || 0
}
function calcDerived(t: Totals) {
  const ecpm = t.impressions > 0 ? (t.earnings / t.impressions) * 1000 : 0
  const ctr = t.impressions > 0 ? t.clicks / t.impressions : 0
  const matchRate = t.adRequests > 0 ? t.matchedRequests / t.adRequests : 0
  return { ecpm, ctr, matchRate }
}
interface AggAdSource {
  adSourceId: string
  adSourceName: string
  totals: Totals
}
interface AggCountry {
  code: string
  totals: Totals
  adSources: Record<string, AggAdSource>
}
interface AggAdUnit {
  adUnitId: string
  adUnitName: string
  totals: Totals
  countries: Record<string, AggCountry>
}

export default function AppMetricsPage() {
  const { appId } = useParams<{ appId: string }>()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MetricsResponse | null>(null)
  const [expandedUnit, setExpandedUnit] = useState<Record<string, boolean>>({})
  const [expandedCountry, setExpandedCountry] = useState<Record<string, Record<string, boolean>>>({})

  const apiBase = (process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:2703/").replace(/([^/])$/, "$1/")

  async function fetchMetrics() {
    if (!appId) return
    setLoading(true)
    try {
      const token = getAccessToken()
      const res = await fetch(`${apiBase}tokens/app-daily-metrics-30d?appId=${encodeURIComponent(String(appId))}`, {
        headers: { accept: "*/*", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: MetricsResponse = await res.json()
      setData(json)
    } catch (e: any) {
      toast.error("Failed to load metrics", { description: e.message })
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [appId])

  const agg = useMemo(() => {
    const map: Record<string, AggAdUnit> = {}
    if (!data) return map
    for (const day of data.metrics || []) {
      for (const c of day.countries || []) {
        for (const u of c.adUnits || []) {
          const unit = (map[u.adUnitId] ||= {
            adUnitId: u.adUnitId,
            adUnitName: u.adUnitName,
            totals: { clicks: 0, earnings: 0, impressions: 0, adRequests: 0, matchedRequests: 0 },
            countries: {},
          })
          addTotals(unit.totals, u.totals)

          const country = (unit.countries[c.code] ||= {
            code: c.code,
            totals: { clicks: 0, earnings: 0, impressions: 0, adRequests: 0, matchedRequests: 0 },
            adSources: {},
          })
          addTotals(country.totals, u.totals)

          for (const s of u.adSources || []) {
            const src = (country.adSources[s.adSourceId] ||= {
              adSourceId: s.adSourceId,
              adSourceName: s.adSourceName,
              totals: { clicks: 0, earnings: 0, impressions: 0, adRequests: 0, matchedRequests: 0 },
            })
            addTotals(src.totals, s.totals)
          }
        }
      }
    }
    return map
  }, [data])

  const units = useMemo(() => Object.values(agg).sort((a, b) => b.totals.earnings - a.totals.earnings), [agg])

  const fmt = new Intl.NumberFormat()
  const money = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 4 })

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader title={data?.appName || "App Metrics"} description={`AdMob 30-day metrics for ${appId}`} />

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button variant="outline" size="sm" onClick={fetchMetrics} disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <RefreshCcw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-muted/50 border-b">
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="w-12 px-3 py-3.5"></th>
                <th className="px-4 py-3.5 text-left font-semibold min-w-[280px]">Ad Unit</th>
                <th className="px-4 py-3.5 text-right font-semibold w-24">Clicks</th>
                <th className="px-4 py-3.5 text-right font-semibold w-24">Impr</th>
                <th className="px-4 py-3.5 text-right font-semibold w-28">Requests</th>
                <th className="px-4 py-3.5 text-right font-semibold w-24">Matched</th>
                <th className="px-4 py-3.5 text-right font-semibold w-24">CTR</th>
                <th className="px-4 py-3.5 text-right font-semibold w-24">Match</th>
                <th className="px-4 py-3.5 text-right font-semibold w-32">eCPM</th>
                <th className="px-4 py-3.5 text-right font-semibold w-32">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-muted-foreground">
                    <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
                    <div className="text-sm">Loading metrics...</div>
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-muted-foreground">
                    <div className="text-sm">No data available</div>
                  </td>
                </tr>
              ) : (
                units.map((u, idx) => {
                  const d = calcDerived(u.totals)
                  const open = !!expandedUnit[u.adUnitId]
                  const countries = Object.values(u.countries).sort((a, b) => b.totals.earnings - a.totals.earnings)
                  return (
                    <Fragment key={u.adUnitId}>
                      <tr
                        className={`hover:bg-muted/40 transition-colors ${idx % 2 === 0 ? "bg-background" : "bg-muted/10"}`}
                      >
                        <td className="px-3 py-4">
                          <button
                            onClick={() => setExpandedUnit((p) => ({ ...p, [u.adUnitId]: !p[u.adUnitId] }))}
                            className="h-7 w-7 inline-flex items-center justify-center rounded-md border bg-background hover:bg-muted transition-colors"
                            aria-label="Toggle countries"
                          >
                            {open ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-foreground">{u.adUnitName}</span>
                            <span className="text-xs text-muted-foreground font-mono">({u.adUnitId})</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-mono tabular-nums text-foreground">
                          {fmt.format(u.totals.clicks)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono tabular-nums text-foreground">
                          {fmt.format(u.totals.impressions)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono tabular-nums text-foreground">
                          {fmt.format(u.totals.adRequests)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono tabular-nums text-foreground">
                          {fmt.format(u.totals.matchedRequests)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono tabular-nums text-foreground">
                          {(d.ctr * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-4 text-right font-mono tabular-nums text-foreground">
                          {(d.matchRate * 100).toFixed(2)}%
                        </td>
                        <td className="px-4 py-4 text-right font-mono tabular-nums text-foreground">
                          {money.format(d.ecpm)}
                        </td>
                        <td className="px-4 py-4 text-right font-mono tabular-nums font-semibold text-foreground">
                          {money.format(u.totals.earnings)}
                        </td>
                      </tr>
                      {open && (
                        <tr>
                          <td colSpan={10} className="p-0 bg-muted/20">
                            <div className="px-10 py-5">
                              <table className="w-full text-xs border-collapse bg-background rounded-lg overflow-hidden shadow-sm">
                                <thead className="bg-muted/50 border-b">
                                  <tr className="text-muted-foreground uppercase tracking-wide">
                                    <th className="w-10 px-3 py-3"></th>
                                    <th className="px-4 py-3 text-left font-semibold min-w-[200px]">Country</th>
                                    <th className="px-4 py-3 text-right font-semibold w-20">Clicks</th>
                                    <th className="px-4 py-3 text-right font-semibold w-20">Impr</th>
                                    <th className="px-4 py-3 text-right font-semibold w-24">Requests</th>
                                    <th className="px-4 py-3 text-right font-semibold w-20">Matched</th>
                                    <th className="px-4 py-3 text-right font-semibold w-20">CTR</th>
                                    <th className="px-4 py-3 text-right font-semibold w-20">Match</th>
                                    <th className="px-4 py-3 text-right font-semibold w-28">eCPM</th>
                                    <th className="px-4 py-3 text-right font-semibold w-28">Earnings</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                  {countries.map((c, cidx) => {
                                    const openC = !!expandedCountry[u.adUnitId]?.[c.code]
                                    const cd = calcDerived(c.totals)
                                    const sources = Object.values(c.adSources).sort(
                                      (a, b) => b.totals.earnings - a.totals.earnings,
                                    )
                                    return (
                                      <Fragment key={`${u.adUnitId}:${c.code}`}>
                                        <tr
                                          className={`hover:bg-muted/30 transition-colors ${cidx % 2 === 0 ? "bg-background" : "bg-muted/10"}`}
                                        >
                                          <td className="px-3 py-3">
                                            <button
                                              onClick={() =>
                                                setExpandedCountry((prev) => ({
                                                  ...prev,
                                                  [u.adUnitId]: { ...(prev[u.adUnitId] || {}), [c.code]: !openC },
                                                }))
                                              }
                                              className="h-6 w-6 inline-flex items-center justify-center rounded-md border bg-background hover:bg-muted transition-colors"
                                              aria-label="Toggle ad sources"
                                            >
                                              {openC ? (
                                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                                              ) : (
                                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                                              )}
                                            </button>
                                          </td>
                                          <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium text-xs">
                                              {c.code}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-right font-mono tabular-nums">
                                            {fmt.format(c.totals.clicks)}
                                          </td>
                                          <td className="px-4 py-3 text-right font-mono tabular-nums">
                                            {fmt.format(c.totals.impressions)}
                                          </td>
                                          <td className="px-4 py-3 text-right font-mono tabular-nums">
                                            {fmt.format(c.totals.adRequests)}
                                          </td>
                                          <td className="px-4 py-3 text-right font-mono tabular-nums">
                                            {fmt.format(c.totals.matchedRequests)}
                                          </td>
                                          <td className="px-4 py-3 text-right font-mono tabular-nums">
                                            {(cd.ctr * 100).toFixed(2)}%
                                          </td>
                                          <td className="px-4 py-3 text-right font-mono tabular-nums">
                                            {(cd.matchRate * 100).toFixed(2)}%
                                          </td>
                                          <td className="px-4 py-3 text-right font-mono tabular-nums">
                                            {money.format(cd.ecpm)}
                                          </td>
                                          <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold">
                                            {money.format(c.totals.earnings)}
                                          </td>
                                        </tr>
                                        {openC && (
                                          <tr>
                                            <td colSpan={10} className="p-0 bg-muted/10">
                                              <div className="px-8 py-4">
                                                <table className="w-full text-[11px] border-collapse bg-background rounded-md overflow-hidden">
                                                  <thead className="bg-muted/40 border-b">
                                                    <tr className="text-muted-foreground uppercase tracking-wide">
                                                      <th className="px-4 py-2.5 text-left font-semibold min-w-[180px]">
                                                        Ad Source
                                                      </th>
                                                      <th className="px-4 py-2.5 text-right font-semibold w-20">
                                                        Clicks
                                                      </th>
                                                      <th className="px-4 py-2.5 text-right font-semibold w-20">
                                                        Impr
                                                      </th>
                                                      <th className="px-4 py-2.5 text-right font-semibold w-24">
                                                        Requests
                                                      </th>
                                                      <th className="px-4 py-2.5 text-right font-semibold w-20">
                                                        Matched
                                                      </th>
                                                      <th className="px-4 py-2.5 text-right font-semibold w-20">CTR</th>
                                                      <th className="px-4 py-2.5 text-right font-semibold w-20">
                                                        Match
                                                      </th>
                                                      <th className="px-4 py-2.5 text-right font-semibold w-28">
                                                        eCPM
                                                      </th>
                                                      <th className="px-4 py-2.5 text-right font-semibold w-28">
                                                        Earnings
                                                      </th>
                                                    </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-border">
                                                    {sources.map((s, sidx) => {
                                                      const sd = calcDerived(s.totals)
                                                      return (
                                                        <tr
                                                          key={s.adSourceId}
                                                          className={`hover:bg-muted/20 transition-colors ${sidx % 2 === 0 ? "bg-background" : "bg-muted/5"}`}
                                                        >
                                                          <td className="px-4 py-2.5 font-medium">{s.adSourceName}</td>
                                                          <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                                                            {fmt.format(s.totals.clicks)}
                                                          </td>
                                                          <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                                                            {fmt.format(s.totals.impressions)}
                                                          </td>
                                                          <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                                                            {fmt.format(s.totals.adRequests)}
                                                          </td>
                                                          <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                                                            {fmt.format(s.totals.matchedRequests)}
                                                          </td>
                                                          <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                                                            {(sd.ctr * 100).toFixed(2)}%
                                                          </td>
                                                          <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                                                            {(sd.matchRate * 100).toFixed(2)}%
                                                          </td>
                                                          <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                                                            {money.format(sd.ecpm)}
                                                          </td>
                                                          <td className="px-4 py-2.5 text-right font-mono tabular-nums font-semibold">
                                                            {money.format(s.totals.earnings)}
                                                          </td>
                                                        </tr>
                                                      )
                                                    })}
                                                  </tbody>
                                                </table>
                                              </div>
                                            </td>
                                          </tr>
                                        )}
                                      </Fragment>
                                    )
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
