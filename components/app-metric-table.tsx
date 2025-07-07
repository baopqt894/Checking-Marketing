"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface AppMetricTableProps {
  data: any[]
  metric: string
  timeframe: "day" | "hour"
}

export function AppMetricTable({ data, metric, timeframe }: AppMetricTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (timeframe === "day") {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } else {
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
    }
  }

  const formatValue = (value: number, key: string) => {
    if (key === "ctr") return `${value.toFixed(2)}%`
    if (key === "revenue") return `$${value.toFixed(2)}`
    if (key === "ecpm") return `$${value.toFixed(2)}`
    return value.toLocaleString()
  }

  const getChangePercent = (current: number, previous: number) => {
    if (!previous) return 0
    return ((current - previous) / previous) * 100
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>{metric.toUpperCase()}</TableHead>
            <TableHead>Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const previousValue = index < data.length - 1 ? data[index + 1][metric] : null
            const changePercent = previousValue ? getChangePercent(item[metric], previousValue) : 0
            const isDecreasing = changePercent < 0

            return (
              <TableRow key={item.date}>
                <TableCell>{formatDate(item.date)}</TableCell>
                <TableCell>{formatValue(item[metric], metric)}</TableCell>
                <TableCell>
                  {previousValue ? (
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className={`${
                          isDecreasing
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-green-50 text-green-700 border-green-200"
                        }`}
                      >
                        <span className="mr-1">
                          {isDecreasing ? "↓" : "↑"} {Math.abs(changePercent).toFixed(2)}%
                        </span>
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
