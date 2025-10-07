"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import { TrendingUp, DollarSign, MousePointer, Eye, Smartphone, Globe, BarChart3, ChevronDown, ChevronRight } from "lucide-react"
import type { AnalyticsSummary } from "@/types/daily-analytics"

interface ComprehensiveAnalyticsDashboardProps {
    data: AnalyticsSummary
    dateRange: string
    isLoading?: boolean
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

const CHART_COLORS = {
    earnings: "#10b981", // Green
    impressions: "#3b82f6", // Blue
    ecpm: "#f59e0b", // Orange
    clicks: "#ef4444", // Red
    ctr: "#8b5cf6", // Purple
}

export function ComprehensiveAnalyticsDashboard({ data, dateRange, isLoading }: ComprehensiveAnalyticsDashboardProps) {
    const [activeTab, setActiveTab] = useState<"overview" | "trends" | "apps" | "countries">("overview")
    const [selectedMetric, setSelectedMetric] = useState<string>("estimated_earnings")
    const [showAllApps, setShowAllApps] = useState(false)
    const [expandedApps, setExpandedApps] = useState<Set<number>>(new Set());

    const trendData = useMemo(() => {
        if (!data.appData || data.appData.length === 0) return []

        const allDates = new Set<string>()
        data.appData.forEach((app) => {
            app.daily_data.forEach((day) => allDates.add(day.date))
        })

        return Array.from(allDates)
            .sort()
            .map((date) => {
                let totalEarnings = 0
                let totalImpressions = 0
                let totalClicks = 0
                let totalRequests = 0
                let avgEcpm = 0
                let avgCtr = 0

                data.appData.forEach((app) => {
                    const dayRecord = app.daily_data.find((d) => d.date === date)
                    if (dayRecord) {
                        totalEarnings += dayRecord.estimated_earnings
                        totalImpressions += dayRecord.impressions
                        totalClicks += dayRecord.clicks
                        totalRequests += dayRecord.requests
                        avgEcpm += dayRecord.observed_ecpm
                        avgCtr += dayRecord.ctr
                    }
                })

                return {
                    date,
                    estimated_earnings: totalEarnings / 1000000,
                    impressions: totalImpressions,
                    clicks: totalClicks,
                    requests: totalRequests,
                    observed_ecpm: avgEcpm / data.appData.length / 1000000,
                    ctr: (avgCtr / data.appData.length) * 100,
                }
            })
    }, [data])

    const formatCurrency = (value: number) => `$${value.toFixed(2)}`
    const formatNumber = (value: number) => value.toLocaleString()
    const formatPercentage = (value: number) => `${value.toFixed(2)}%`

    const getMetricFormatter = (metric: string) => {
        switch (metric) {
            case "estimated_earnings":
            case "observed_ecpm":
                return formatCurrency
            case "ctr":
                return formatPercentage
            default:
                return formatNumber
        }
    }

    const getMetricLabel = (metric: string) => {
        switch (metric) {
            case "estimated_earnings":
                return "Estimated Earnings"
            case "impressions":
                return "Impressions"
            case "observed_ecpm":
                return "eCPM"
            case "clicks":
                return "Clicks"
            case "ctr":
                return "CTR"
            case "requests":
                return "Requests"
            default:
                return metric
        }
    }

    const handleExpand = (index: number) => {
        setExpandedApps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading analytics data...</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(data.totalEarnings / 1000000)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatNumber(data.totalImpressions)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                        <MousePointer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{formatNumber(data.totalClicks)}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average eCPM</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(Number((data.averageEcpm / 1000000000).toFixed(2)))}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average CTR</CardTitle>
                        <MousePointer className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{formatPercentage(data.averageCtr * 100)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            <CardTitle>Analytics Dashboard - {dateRange}</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex border-b mb-6">
                        <button
                            onClick={() => setActiveTab("overview")}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "overview"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab("trends")}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "trends"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Trends
                        </button>
                        <button
                            onClick={() => setActiveTab("apps")}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "apps"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Apps
                        </button>
                        <button
                            onClick={() => setActiveTab("countries")}
                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "countries"
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Countries
                        </button>
                    </div>

                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Earnings by App</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={data.appData.slice(0, 6).map((app) => ({
                                                        name: app.app_name,
                                                        value: app.total_earnings / 1000000,
                                                        earnings: app.total_earnings,
                                                    }))}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                                                >
                                                    {data.appData.slice(0, 6).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base">Top Countries by Earnings</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart
                                                data={data.countryData.slice(0, 8).map((country) => ({
                                                    ...country,
                                                    earnings: country.earnings / 1000000,
                                                }))}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="country" />
                                                <YAxis tickFormatter={(value) => `$${value.toFixed(1)}`} />
                                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                                <Bar dataKey="earnings" fill="#8884d8" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}

                    {activeTab === "trends" && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="estimated_earnings">Estimated Earnings</SelectItem>
                                        <SelectItem value="impressions">Impressions</SelectItem>
                                        <SelectItem value="observed_ecpm">eCPM</SelectItem>
                                        <SelectItem value="clicks">Clicks</SelectItem>
                                        <SelectItem value="ctr">CTR</SelectItem>
                                        <SelectItem value="requests">Requests</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Daily {getMetricLabel(selectedMetric)} Trend</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={trendData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                                <XAxis
                                                    dataKey="date"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: "#666" }}
                                                    tickFormatter={(value) =>
                                                        new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                                    }
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12, fill: "#666" }}
                                                    tickFormatter={getMetricFormatter(selectedMetric)}
                                                />
                                                <Tooltip
                                                    formatter={(value: number) => [
                                                        getMetricFormatter(selectedMetric)(value),
                                                        getMetricLabel(selectedMetric),
                                                    ]}
                                                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                                    contentStyle={{ fontSize: "12px" }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey={selectedMetric}
                                                    stroke={CHART_COLORS[selectedMetric as keyof typeof CHART_COLORS] || CHART_COLORS.earnings}
                                                    strokeWidth={3}
                                                    dot={{ r: 4 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === "apps" && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Smartphone className="h-4 w-4" />
                                        App Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead></TableHead>
                                                <TableHead>App Name</TableHead>
                                                <TableHead>Platform</TableHead>
                                                <TableHead className="text-right">Earnings</TableHead>
                                                <TableHead className="text-right">Impressions</TableHead>
                                                <TableHead className="text-right">Clicks</TableHead>
                                                <TableHead className="text-right">CTR</TableHead>
                                                <TableHead className="text-right">eCPM</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.appData.map((app, index) => (
                                                <React.Fragment key={index}>
                                                    <TableRow>
                                                        <TableCell className="w-8">
                                                            {Array.isArray(app.countries) && app.countries.length > 0 ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleExpand(index)}
                                                                    className="focus:outline-none cursor-pointer"
                                                                    aria-label={expandedApps.has(index) ? "Collapse" : "Expand"}
                                                                >
                                                                    {expandedApps.has(index) ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    )}
                                                                </button>
                                                            ) : null}
                                                        </TableCell>
                                                        <TableCell className="font-medium">{app.app_name}</TableCell>
                                                        <TableCell>
                                                            <span className={`px-2 py-1 rounded text-xs ${app.platform === "ANDROID" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{app.platform}</span>
                                                        </TableCell>
                                                        <TableCell className="text-right">{formatCurrency(app.total_earnings / 1000000)}</TableCell>
                                                        <TableCell className="text-right">{formatNumber(app.total_impressions)}</TableCell>
                                                        <TableCell className="text-right">{formatNumber(app.total_clicks)}</TableCell>
                                                        <TableCell className="text-right">{formatPercentage(app.average_ctr * 100)}</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(app.average_ecpm / 1000000)}</TableCell>
                                                    </TableRow>
                                                    {/* Tree: Top 3 countries for this app, only show if expanded */}
                                                    {expandedApps.has(index) && Array.isArray(app.countries) && app.countries.length > 0 && (
                                                        app.countries
                                                            .filter((country) => country && typeof country === "object" && typeof country.country === "string")
                                                            .sort((a, b) => (b.earnings ?? 0) - (a.earnings ?? 0))
                                                            .slice(0, 3)
                                                            .map((country, cidx) => (
                                                                <TableRow key={index + "-country-" + cidx} className="bg-muted">
                                                                    <TableCell></TableCell>
                                                                    <TableCell className="pl-8 text-xs">↳ {country.country}</TableCell>
                                                                    <TableCell></TableCell>
                                                                    <TableCell className="text-right text-xs">{formatCurrency((country.earnings ?? 0) / 1000000)}</TableCell>
                                                                    <TableCell className="text-right text-xs">{formatNumber(country.impressions ?? 0)}</TableCell>
                                                                    <TableCell className="text-right text-xs">{formatNumber(country.clicks ?? 0)}</TableCell>
                                                                    <TableCell className="text-right text-xs">{formatPercentage((country.ctr ?? 0) * 100)}</TableCell>
                                                                    <TableCell className="text-right text-xs">{country.clicks > 0 ? formatCurrency((country.earnings ?? 0) / country.clicks / 1000000) : "$0.00"}</TableCell>
                                                                </TableRow>
                                                            ))
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === "countries" && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Country Performance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Country</TableHead>
                                                <TableHead className="text-right">Earnings</TableHead>
                                                <TableHead className="text-right">Impressions</TableHead>
                                                <TableHead className="text-right">Clicks</TableHead>
                                                <TableHead className="text-right">CTR</TableHead>
                                                <TableHead className="text-right">Earnings per Click</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.countryData.map((country, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{country.country}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(country.earnings / 1000000)}</TableCell>
                                                    <TableCell className="text-right">{formatNumber(country.impressions)}</TableCell>
                                                    <TableCell className="text-right">{formatNumber(country.clicks)}</TableCell>
                                                    <TableCell className="text-right">{formatPercentage(country.ctr * 100)}</TableCell>
                                                    <TableCell className="text-right">
                                                        {country.clicks > 0 ? formatCurrency(country.earnings / country.clicks / 1000000) : "$0.00"}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
