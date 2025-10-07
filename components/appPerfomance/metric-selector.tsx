"use client"

import { Button } from "@/components/ui/button"

interface MetricOption {
  value: string
  label: string
  format: (val: number) => string
}

interface MetricSelectorProps {
  selectedMetric: string
  onMetricChange: (metric: string) => void
  metricOptions: MetricOption[]
}

export function MetricSelector({ selectedMetric, onMetricChange, metricOptions }: MetricSelectorProps) {
  return (
    <div className="flex gap-4 mb-6">
      <select
        value={selectedMetric}
        onChange={(e) => onMetricChange(e.target.value)}
        className="bg-white border border-gray-300 text-gray-900 rounded px-4 py-2 text-sm font-medium"
      >
        {metricOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        {["1D", "7D", "1M", "3M", "1Y", "YTD"].map((period) => (
          <Button
            key={period}
            variant={period === "1D" ? "default" : "ghost"}
            size="sm"
            className={period === "1D" ? "bg-blue-500 hover:bg-blue-600" : "text-gray-600 hover:text-gray-900"}
          >
            {period}
          </Button>
        ))}
      </div>
    </div>
  )
}
