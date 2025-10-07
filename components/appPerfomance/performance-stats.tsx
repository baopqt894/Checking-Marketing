import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DailyMetric {
  date: string
  CLICKS?: number
  ESTIMATED_EARNINGS?: number
  IMPRESSIONS?: number
  IMPRESSION_CTR?: number
  MATCH_RATE?: number
  OBSERVED_ECPM?: number
}

interface AppCountryData {
  appId: string
  country: string
  today: any
  yesterday: any
  avg7: any
  avg30: any
}

interface PerformanceStatsProps {
  latestData?: DailyMetric
  countryApiData?: AppCountryData
  currentValue: number
  metricChange: number
  metricFormatter: (value: number) => string
  metricLabel: string
  selectedApp: string
  selectedCountry: string
}

export function PerformanceStats({
  latestData,
  countryApiData,
  currentValue,
  metricChange,
  metricFormatter,
  metricLabel,
  selectedApp,
  selectedCountry,
}: PerformanceStatsProps) {
  return (
    <div className="space-y-6">
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Current {metricLabel}</div>
            <div className="text-2xl font-bold text-gray-900">{metricFormatter(currentValue)}</div>
            <div className={`text-sm ${metricChange >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {metricChange >= 0 ? "+" : ""}
              {metricChange.toFixed(2)}% (24h)
            </div>
          </div>

          {countryApiData && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Clicks</span>
                <span className="font-mono">
                  {(countryApiData.today.CLICKS || countryApiData.avg7.CLICKS || 0).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Impressions</span>
                <span className="font-mono">
                  {(countryApiData.today.IMPRESSIONS || countryApiData.avg7.IMPRESSIONS || 0).toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CTR</span>
                <span className="font-mono">
                  {((countryApiData.today.IMPRESSION_CTR || countryApiData.avg7.IMPRESSION_CTR || 0) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Match Rate</span>
                <span className="font-mono">
                  {((countryApiData.today.MATCH_RATE || countryApiData.avg7.MATCH_RATE || 0) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Latest Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  A
                </div>
                <span className="font-medium text-sm">ANALYST</span>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <p className="text-sm text-gray-700">
                📊 {selectedApp} performance in {selectedCountry} showing {metricChange >= 0 ? "positive" : "negative"}{" "}
                momentum. Current {metricLabel.toLowerCase()} at {metricFormatter(currentValue)} with{" "}
                {((latestData?.IMPRESSION_CTR || 0) * 100).toFixed(1)}% CTR.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
