import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface DailyMetric {
  date: string
  CLICKS?: number
  ESTIMATED_EARNINGS?: number
  IMPRESSIONS?: number
  IMPRESSION_CTR?: number
  MATCH_RATE?: number
  OBSERVED_ECPM?: number
}

interface MetricOption {
  value: string
  label: string
  format: (val: number) => string
}

interface MetricConfig {
  key: string
  label: string
  format: (val: number) => string
  color: string
}

interface MetricChartProps {
  data: DailyMetric[]
  selectedMetrics?: string[] | MetricConfig[] // Support both string[] and MetricConfig[]
  metricOptions?: MetricOption[]
  title?: string
  selectedMetric?: string
  metricFormatter?: (val: number) => string
  metricLabel?: string
}

const METRIC_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#06b6d4", // cyan
]

export function MetricChart({
  data,
  selectedMetrics,
  metricOptions,
  title = "Metrics Over Time",
  selectedMetric,
  metricFormatter,
  metricLabel,
}: MetricChartProps) {
  const metricsToShow = (() => {
    if (selectedMetrics && selectedMetrics.length > 0) {
      // Check if it's MetricConfig[] (from app-metrics-dashboard)
      if (typeof selectedMetrics[0] === "object" && "key" in selectedMetrics[0]) {
        return selectedMetrics as MetricConfig[]
      }

      // Handle string[] with metricOptions (from country-analytics-dashboard)
      if (metricOptions) {
        return (selectedMetrics as string[]).map((metricValue, index) => {
          const option = metricOptions.find((opt) => opt.value === metricValue)
          return {
            key: metricValue,
            label: option?.label || metricValue,
            format: option?.format || ((val: number) => val.toString()),
            color: METRIC_COLORS[index % METRIC_COLORS.length],
          }
        })
      }
    }

    // Fallback to single metric mode
    if (selectedMetric) {
      return [
        {
          key: selectedMetric,
          label: metricLabel || selectedMetric,
          format: metricFormatter || ((val: number) => val.toString()),
          color: METRIC_COLORS[0],
        },
      ]
    }

    return []
  })()

  return (
    <div className="h-96">
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart className="pr-10" data={data}>
            <defs>
              {metricsToShow.map((metric) => (
                <linearGradient key={metric.key} id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value, name) => {
                const metric = metricsToShow.find((m) => m.key === name)
                return metric ? [metric.format(Number(value)), metric.label] : [value, name]
              }}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
            />
            {metricsToShow.length > 1 && <Legend />}
            {metricsToShow.map((metric) => (
              <Area
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                stroke={metric.color}
                strokeWidth={2}
                fill={`url(#gradient-${metric.key})`}
                name={metric.label}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Không có dữ liệu hàng ngày cho quốc gia này
        </div>
      )}
    </div>
  )
}
