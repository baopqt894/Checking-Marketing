/**
 * Color utility classes and constants for the application
 * This file centralizes all color-related utilities for easier management
 */

// Primary color classes - use these for main UI elements
export const COLORS = {
  // Primary theme colors
  primary: {
    bg: 'bg-primary',
    text: 'text-primary', 
    border: 'border-primary',
    hover: 'hover:bg-primary/90'
  },
  
  // Blue variants - for accents and highlights
  blue: {
    50: 'bg-blue-50 text-blue-50 border-blue-50',
    100: 'bg-blue-100 text-blue-100 border-blue-100', 
    200: 'bg-blue-200 text-blue-200 border-blue-200',
    300: 'bg-blue-300 text-blue-300 border-blue-300',
    400: 'bg-blue-400 text-blue-400 border-blue-400',
    500: 'bg-blue-500 text-blue-500 border-blue-500',
    600: 'bg-blue-600 text-blue-600 border-blue-600',
    700: 'bg-blue-700 text-blue-700 border-blue-700',
    800: 'bg-blue-800 text-blue-800 border-blue-800',
    900: 'bg-blue-900 text-blue-900 border-blue-900',
  },
  
  // Semantic colors
  success: {
    bg: 'bg-success-light',
    text: 'text-success',
    border: 'border-success',
    icon: 'text-success-light'
  },
  
  warning: {
    bg: 'bg-warning-light', 
    text: 'text-warning',
    border: 'border-warning',
    icon: 'text-warning-light'
  },
  
  error: {
    bg: 'bg-error-light',
    text: 'text-error', 
    border: 'border-error',
    icon: 'text-error-light'
  },
  
  // Neutral colors
  muted: {
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    border: 'border-muted'
  },
  
  card: {
    bg: 'bg-card',
    text: 'text-card-foreground',
    border: 'border-border'
  }
} as const

// Utility functions for dynamic color classes
export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info') => {
  switch (status) {
    case 'success':
      return COLORS.success
    case 'warning': 
      return COLORS.warning
    case 'error':
      return COLORS.error
    case 'info':
    default:
      return COLORS.primary
  }
}

export const getBlueShade = (shade: keyof typeof COLORS.blue) => {
  return COLORS.blue[shade]
}

// Metric-specific colors for charts and data visualization
export const METRIC_COLORS = {
  // Core metrics
  CLICKS: '#3b82f6',           // Blue - Primary action metric
  ESTIMATED_EARNINGS: '#10b981', // Green - Money/earnings
  IMPRESSIONS: '#06b6d4',      // Cyan - View/display metric
  IMPRESSION_CTR: '#f59e0b',   // Amber - Rate/percentage
  MATCH_RATE: '#f97316',       // Orange - Match/success rate
  OBSERVED_ECPM: '#84cc16',    // Lime - Revenue per mille
  AD_REQUESTS: '#8b5cf6',      // Purple - Request metrics
  MATCHED_REQUESTS: '#ef4444', // Red - Secondary request metric
  
  // Additional performance metrics
  ctr: '#f59e0b',              // Amber - Click-through rate
  impressions: '#06b6d4',      // Cyan - Impressions
  revenue: '#10b981',          // Green - Revenue
  ecpm: '#84cc16',             // Lime - eCPM
  
  // Chart colors array for multiple metrics
  chartColors: [
    '#3b82f6', // Blue - Primary
    '#10b981', // Green - Earnings
    '#f59e0b', // Amber - Rates
    '#ef4444', // Red - Alerts
    '#8b5cf6', // Purple - Requests
    '#06b6d4', // Cyan - Impressions
    '#f97316', // Orange - Match rates
    '#84cc16', // Lime - Secondary
  ]
} as const

// Get color by metric key
export const getMetricColor = (metricKey: string): string => {
  const color = METRIC_COLORS[metricKey as keyof typeof METRIC_COLORS]
  if (typeof color === 'string') {
    return color
  }
  return METRIC_COLORS.chartColors[0]
}

// Get chart color by index
export const getChartColor = (index: number): string => {
  return METRIC_COLORS.chartColors[index % METRIC_COLORS.chartColors.length]
}
