export interface AdMobDateRange {
    startDate: {
        year: number
        month: number
        day: number
    }
    endDate: {
        year: number
        month: number
        day: number
    }
}

export interface AdMobHeader {
    dateRange: AdMobDateRange
    localizationSettings: {
        currencyCode: string
        languageCode: string
    }
}

export interface AdMobDimensionValues {
    APP?: {
        value: string
        displayLabel: string
    }
    AD_SOURCE?: {
        value: string
        displayLabel: string
    }
    COUNTRY?: {
        value: string
    }
}

export interface AdMobMetricValues {
    CLICKS?: {
        integerValue: string
    }
    ESTIMATED_EARNINGS?: {
        microsValue: string
    }
    IMPRESSIONS?: {
        integerValue: string
    }
    OBSERVED_ECPM?: {
        microsValue: string
    }
    IMPRESSION_CTR?: {
        doubleValue: string
    }
}

export interface AdMobRow {
    dimensionValues: AdMobDimensionValues
    metricValues: AdMobMetricValues

}

export interface AdMobResponse {
    header?: AdMobHeader
    row?: AdMobRow
    footer?: {
        matchingRowCount: string
    }
}

export interface ProcessedAdMobData {
    totalEarnings: number
    totalClicks: number
    appData: Array<{
        app: string
        earnings: number
        clicks: number
    }>
    countryData: Array<{
        country: string
        earnings: number
        clicks: number
    }>
    dateRange: string
}
