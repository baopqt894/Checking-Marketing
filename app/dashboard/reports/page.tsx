import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportsTable } from "@/components/reports-table"
import { DateRangePicker } from "@/components/date-range-picker"

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
    <DashboardHeader title="Reports" description="Manage mediation reports" />

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Mediation Report</CardTitle>
                <CardDescription>View detailed mediation performance data</CardDescription>
              </div>
              <DateRangePicker />
            </div>
          </CardHeader>
          <CardContent>
            <ReportsTable />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
