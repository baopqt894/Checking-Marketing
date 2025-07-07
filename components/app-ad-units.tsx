"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface AppAdUnitsProps {
  appId: string
}

export function AppAdUnits({ appId }: AppAdUnitsProps) {
  // Mock ad units data
  const adUnits = [
    {
      id: "1",
      name: "Banner - Main Menu",
      format: "Banner",
      status: "Active",
      impressions: 110000,
      ctr: "3.0%",
      revenue: "$550.00",
      ecpm: "$5.00",
    },
    {
      id: "2",
      name: "Interstitial - Level Complete",
      format: "Interstitial",
      status: "Active",
      impressions: 40000,
      ctr: "5.0%",
      revenue: "$800.00",
      ecpm: "$20.00",
    },
    {
      id: "3",
      name: "Rewarded - Extra Lives",
      format: "Rewarded",
      status: "Active",
      impressions: 25000,
      ctr: "6.0%",
      revenue: "$750.00",
      ecpm: "$30.00",
    },
    {
      id: "4",
      name: "Native - Game Store",
      format: "Native",
      status: "Inactive",
      impressions: 0,
      ctr: "0.0%",
      revenue: "$0.00",
      ecpm: "$0.00",
    },
  ]

  return (
    <div className="grid gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Ad Units</h3>
        <Button size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Ad Unit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ad Units</CardTitle>
          <CardDescription>Manage your app's ad units and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Impressions</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">eCPM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adUnits.map((adUnit) => (
                  <TableRow key={adUnit.id}>
                    <TableCell className="font-medium">{adUnit.name}</TableCell>
                    <TableCell>{adUnit.format}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          adUnit.status === "Active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }
                      >
                        {adUnit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{adUnit.impressions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{adUnit.ctr}</TableCell>
                    <TableCell className="text-right">{adUnit.revenue}</TableCell>
                    <TableCell className="text-right">{adUnit.ecpm}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
