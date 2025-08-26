"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Loader2, TrendingUp, MousePointer, Globe, Smartphone, ChevronDown, ChevronRight } from "lucide-react"
import { ProcessedAdMobData } from "@/types/admob"


interface AnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
  data: ProcessedAdMobData | null
  isLoading: boolean
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export default function AnalyticsModal({ isOpen, onClose, data, isLoading }: AnalyticsModalProps) {
  console.log("AnalyticsModal render, data:", data);

  const [activeTab, setActiveTab] = useState<"overview" | "apps" | "countries">("overview")
  const [expandedApps, setExpandedApps] = useState<Set<number>>(new Set());

  const formatCurrency = (microsValue: number) => {
    return `$${(microsValue / 1000000).toFixed(2)}`
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

  useEffect(() => {
    if (data?.appData) {
      console.log("data.appData", data.appData);
      data.appData.forEach(app => {
        console.log("app object", app);
      });
    }
  }, [data]);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading analytics data...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!data) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AdMob Analytics - {data.dateRange}
          </DialogTitle>
        </DialogHeader>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("apps")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "apps"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Apps
          </button>
          <button
            onClick={() => setActiveTab("countries")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "countries"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Countries
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data.totalEarnings)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    <MousePointer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{data.totalClicks.toLocaleString()}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Earnings by App</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={data.appData.slice(0, 6)}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="earnings"
                          label={({ app, earnings }) => `${app.split(" - ")[0]}: ${formatCurrency(earnings)}`}
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
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={data.countryData.slice(0, 8)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="country" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Bar dataKey="earnings" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
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
                        <TableHead className="text-right">Earnings</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">Earnings per Click</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.appData.map((app: {
    app_name?: string;
    app?: string;
    total_earnings?: number;
    earnings?: number;
    total_clicks?: number;
    clicks?: number;
    countries?: Array<{
      country: string;
      earnings?: number;
      clicks?: number;
    }>;
  }, index: number) => {
    return (
      <React.Fragment key={index}>
        <TableRow>
          <TableCell className="w-8">
            {Array.isArray(app.countries) ? (
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
          <TableCell className="font-medium">{app.app_name || app.app || ""}</TableCell>
          <TableCell className="text-right">{formatCurrency(app.total_earnings ?? app.earnings ?? 0)}</TableCell>
          <TableCell className="text-right">{(app.total_clicks ?? app.clicks ?? 0).toLocaleString()}</TableCell>
          <TableCell className="text-right">
            {(app.total_clicks ?? app.clicks ?? 0) > 0
              ? formatCurrency((app.total_earnings ?? app.earnings ?? 0) / (app.total_clicks ?? app.clicks ?? 1))
              : "$0.00"}
          </TableCell>
        </TableRow>
        {/* Tree: Top 3 countries for this app, only show if expanded */}
        {expandedApps.has(index) && Array.isArray(app.countries) && app.countries.length > 0 && (
          app.countries
            .filter((country): country is { country: string; earnings?: number; clicks?: number } => country && typeof country === "object" && typeof country.country === "string")
            .sort((a, b) => (b.earnings ?? 0) - (a.earnings ?? 0))
            .slice(0, 3)
            .map((country, cidx) => (
              <TableRow key={index + "-country-" + cidx} className="bg-muted">
                <TableCell></TableCell>
                <TableCell className="pl-8 text-xs">↳ {country.country}</TableCell>
                <TableCell className="text-right text-xs">{formatCurrency(country.earnings ?? 0)}</TableCell>
                <TableCell className="text-right text-xs">{(country.clicks ?? 0).toLocaleString()}</TableCell>
                <TableCell className="text-right text-xs">
                  {(country.clicks ?? 0) > 0
                    ? formatCurrency((country.earnings ?? 0) / (country.clicks ?? 1))
                    : "$0.00"}
                </TableCell>
              </TableRow>
            ))
        )}
      </React.Fragment>
    );
  })}
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
<TableHead className="text-right">Clicks</TableHead>
<TableHead className="text-right">Earnings per Click</TableHead>
</TableRow>
</TableHeader>
<TableBody>
{data.countryData.map((country, index) => (
<TableRow key={index}>
<TableCell>{country.country}</TableCell>
<TableCell className="text-right">{formatCurrency(country.earnings)}</TableCell>
<TableCell className="text-right">{country.clicks.toLocaleString()}</TableCell>
<TableCell className="text-right">
{country.clicks > 0
? formatCurrency(country.earnings / country.clicks)
: "$0.00"}
</TableCell>
</TableRow>
))}
</TableBody>
</Table>
</CardContent>
</Card>
</div>
)}
</div>

<DialogFooter className="flex justify-end">
<Button variant="outline" onClick={onClose}>
Close
</Button>
</DialogFooter>
</DialogContent>
</Dialog>
)
}
