"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface AppMetricChartProps {
  data: any[]
  dataKey: string
  color: string
  decreasing?: boolean
}

export function AppMetricChart({ data, dataKey, color, decreasing = false }: AppMetricChartProps) {
  const formatValue = (value: number) => {
    if (dataKey === "ctr") return `${value.toFixed(2)}%`
    if (dataKey === "revenue") return `$${value.toFixed(2)}`
    if (dataKey === "ecpm") return `$${value.toFixed(2)}`
    return value.toLocaleString()
  }

  const formatTooltipValue = (value: number) => {
    if (dataKey === "ctr") return `${value.toFixed(2)}%`
    if (dataKey === "revenue") return `$${value.toFixed(2)}`
    if (dataKey === "ecpm") return `$${value.toFixed(2)}`
    return value.toLocaleString()
  }

  const getGradientColors = () => {
    if (decreasing) {
      return {
        stop1: color,
        stop2: `${color}33`, // 20% opacity
      }
    }
    return {
      stop1: color,
      stop2: `${color}33`, // 20% opacity
    }
  }

  const { stop1, stop2 } = getGradientColors()

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stop1} stopOpacity={0.8} />
              <stop offset="95%" stopColor={stop2} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              const date = new Date(value)
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatValue(value)}
          />
          <Tooltip
            formatter={(value: number) => [
              formatTooltipValue(value),
              dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
            ]}
            labelFormatter={(label) => {
              const date = new Date(label)
              return date.toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} fillOpacity={1} fill={`url(#gradient-${dataKey})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
