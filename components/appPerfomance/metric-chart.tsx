import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface DailyMetric {
  date: string
  CLICKS?: number
  ESTIMATED_EARNINGS?: number
  IMPRESSIONS?: number
  IMPRESSION_CTR?: number
  MATCH_RATE?: number
  OBSERVED_ECPM?: number
  AD_REQUESTS?: number
  MATCHED_REQUESTS?: number
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
  "#f59e0b", // amber-500
  "#d97706", // amber-600
  "#b45309", // amber-700
  "#92400e", // amber-800
  "#78350f", // amber-900
  "#fbbf24", // amber-400
  "#3b82f6", // blue-500 (AD_REQUESTS)
  "#10b981", // green-500 (MATCHED_REQUESTS)
]

// Map metric key to color for consistency
const METRIC_COLOR_MAP: Record<string, string> = {
  CLICKS: "#f59e0b",
  ESTIMATED_EARNINGS: "#d97706",
  IMPRESSIONS: "#b45309",
  IMPRESSION_CTR: "#92400e",
  MATCH_RATE: "#78350f",
  OBSERVED_ECPM: "#fbbf24",
  AD_REQUESTS: "#3b82f6",
  MATCHED_REQUESTS: "#10b981",
};

// Add default metricOptions for new metrics if not provided
const DEFAULT_METRIC_OPTIONS: MetricOption[] = [
  { value: "CLICKS", label: "Clicks", format: (val) => val.toLocaleString() },
  { value: "ESTIMATED_EARNINGS", label: "Earnings", format: (val) => `$${val.toFixed(2)}` },
  { value: "IMPRESSIONS", label: "Impressions", format: (val) => val.toLocaleString() },
  { value: "IMPRESSION_CTR", label: "Impression CTR", format: (val) => `${(val * 100).toFixed(2)}%` },
  { value: "MATCH_RATE", label: "Match Rate", format: (val) => `${(val * 100).toFixed(2)}%` },
  { value: "OBSERVED_ECPM", label: "eCPM", format: (val) => `$${val.toFixed(2)}` },
  { value: "AD_REQUESTS", label: "Ad Requests", format: (val) => val.toLocaleString() },
  { value: "MATCHED_REQUESTS", label: "Matched Requests", format: (val) => val.toLocaleString() },
];

export function MetricChart({
  data,
  selectedMetrics,
  metricOptions = DEFAULT_METRIC_OPTIONS,
  title = "Metrics Over Time",
  selectedMetric,
  metricFormatter,
  metricLabel,
}: MetricChartProps) {
  const metricsToShow = (() => {
    if (selectedMetrics && selectedMetrics.length > 0) {
      if (typeof selectedMetrics[0] === "object" && "key" in selectedMetrics[0]) {
        // Ensure color is set by key
        return (selectedMetrics as MetricConfig[]).map((metric) => ({
          ...metric,
          color: METRIC_COLOR_MAP[metric.key] || METRIC_COLORS[0],
        }))
      }
      if (metricOptions) {
        return (selectedMetrics as string[]).map((metricValue) => {
          const option = metricOptions.find((opt) => opt.value === metricValue)
          return {
            key: metricValue,
            label: option?.label || metricValue,
            format: option?.format || ((val: number) => val.toString()),
            color: METRIC_COLOR_MAP[metricValue] || METRIC_COLORS[0],
          }
        })
      }
    }
    if (selectedMetric) {
      return [
        {
          key: selectedMetric,
          label: metricLabel || selectedMetric,
          format: metricFormatter || ((val: number) => val.toString()),
          color: METRIC_COLOR_MAP[selectedMetric] || METRIC_COLORS[0],
        },
      ]
    }
    return []
  })()

  console.log("[v0] MetricChart data:", data)
  console.log("[v0] MetricChart selectedMetrics:", selectedMetrics)
  console.log("[v0] MetricChart metricsToShow:", metricsToShow)

  if (data.length > 0 && metricsToShow.length > 0) {
    const sampleDataPoint = data[0]
    metricsToShow.forEach((metric) => {
      console.log(`[v0] Sample data for ${metric.key}:`, sampleDataPoint[metric.key as keyof DailyMetric])
    })
  }

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
