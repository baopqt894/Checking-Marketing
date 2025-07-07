// Function to generate mock app data
export function generateAppData(appId: string, timeframe: "day" | "hour") {
    const data = []
    const now = new Date()
    const daysToGenerate = timeframe === "day" ? 30 : 2
    const pointsPerDay = timeframe === "day" ? 1 : 24
    const totalPoints = daysToGenerate * pointsPerDay
  
    // Base values for different apps
    const baseValues: Record<string, { ctr: number; impressions: number; revenue: number; ecpm: number }> = {
      "1": { ctr: 3.5, impressions: 120000, revenue: 600, ecpm: 5 },
      "2": { ctr: 4.2, impressions: 90000, revenue: 500, ecpm: 5.5 },
      "3": { ctr: 5.0, impressions: 75000, revenue: 450, ecpm: 6 },
      "4": { ctr: 2.8, impressions: 60000, revenue: 300, ecpm: 5 },
      "5": { ctr: 3.2, impressions: 50000, revenue: 250, ecpm: 5 },
    }
  
    // Generate decreasing CTR and eCPM trend, increasing impressions and revenue
    for (let i = 0; i < totalPoints; i++) {
      const date = new Date(now)
  
      if (timeframe === "day") {
        date.setDate(date.getDate() - i)
      } else {
        // For hourly, go back by hours
        const hoursToGoBack = i
        date.setHours(date.getHours() - hoursToGoBack)
      }
  
      // Get base values for this app
      const base = baseValues[appId] || { ctr: 3.0, impressions: 100000, revenue: 500, ecpm: 5 }
  
      // Add some randomness and trends
      const dayFactor = i / totalPoints // 0 to 1, higher for older dates
  
      // CTR decreases over time (higher for newer dates)
      const ctrTrend = base.ctr * (1 - dayFactor * 0.3) // 30% decrease over the period
      const ctr = ctrTrend + (Math.random() * 0.5 - 0.25) // Add some noise
  
      // Impressions increase over time (higher for newer dates)
      const impressionsTrend = base.impressions * (1 + dayFactor * 0.2) // 20% increase over the period
      const impressions = Math.round(
        impressionsTrend + (Math.random() * impressionsTrend * 0.1 - impressionsTrend * 0.05),
      )
  
      // Revenue increases over time (higher for newer dates)
      const revenueTrend = base.revenue * (1 + dayFactor * 0.25) // 25% increase over the period
      const revenue = revenueTrend + (Math.random() * revenueTrend * 0.1 - revenueTrend * 0.05)
  
      // eCPM decreases over time (higher for newer dates)
      const ecpmTrend = base.ecpm * (1 - dayFactor * 0.15) // 15% decrease over the period
      const ecpm = ecpmTrend + (Math.random() * 0.5 - 0.25)
  
      data.push({
        date: date.toISOString(),
        ctr: Math.max(0.1, ctr), // Ensure CTR doesn't go below 0.1%
        impressions: Math.max(1000, impressions), // Ensure impressions don't go below 1000
        revenue: Math.max(10, revenue), // Ensure revenue doesn't go below $10
        ecpm: Math.max(0.5, ecpm), // Ensure eCPM doesn't go below $0.5
      })
    }
  
    return data
  }
  