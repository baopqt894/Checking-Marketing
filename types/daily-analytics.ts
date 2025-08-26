export interface DailyAnalytics {
  _id: string
  date: string
  publisher_id: string
  app_id: string
  app_name: string
  platform: "ANDROID" | "IOS"
  estimated_earnings: number // Micro USD
  observed_ecpm: number // Micro USD
  requests: number
  match_rate: number // 0-1
  matched_requests: number
  show_rate: number // 0-1
  impressions: number
  ctr: number // 0-1
  clicks: number
  ads_arpu: number // Micro USD
  ad_source: string
  country: string
  date_publisher_app: string
  created_at: string
  updated_at: string
  id: string
}

export interface DailyAnalyticsChart {
  date: string
  estimated_earnings: number
  impressions: number
  observed_ecpm: number
  clicks: number
  requests: number
  ctr: number
}

export interface AppAnalyticsSummary {
  app_id: string
  app_name: string
  platform: "ANDROID" | "IOS"
  total_earnings: number
  total_impressions: number
  total_clicks: number
  average_ecpm: number
  average_ctr: number
  daily_data: DailyAnalyticsChart[]
  countries: CountryAnalytics[]
}

export interface CountryAnalytics {
  country: string
  earnings: number
  clicks: number
  impressions: number
  ctr: number
}

export interface AnalyticsSummary {
  totalEarnings: number
  totalClicks: number
  totalImpressions: number
  averageEcpm: number
  averageCtr: number
  dateRange: string
  appData: AppAnalyticsSummary[]
  countryData: CountryAnalytics[]
}
