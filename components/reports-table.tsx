"use client";

import { useState, useEffect } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdMobReport = {
  id: string;
  app: string;
  country: string;
  platform: string;
  date: string;
  estimatedEarnings: string;
  adSource: string;
  adSourceInstance: string;
  adUnit: string;
  mediationGroup: string;
  format: string;
  mobileOsVersion: number;
  gmaSdkVersion: number;
  appVersionName: number;
  servingRestriction: string;
  adRequests: string;
  clicks: string;
  impressions: string;
  matchedRequests: string;
  matchRate: string;
  observedEcpm: string;
};

export function ReportsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [data, setData] = useState<AdMobReport[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
        console.log("API URL:", apiUrl);
        const res = await fetch(`${apiUrl}/daily-earnings`);
        const json = await res.json();
        console.log("Fetched data:", json);
        const mappedData: AdMobReport[] = json.data.map((item: any) => ({
          id: item.id || item._id,
          date: new Date(item.date).toLocaleDateString(),
          app: item.appId?.app,
          country: item?.appId?.country,
          platform: item?.appId?.platform || "N/A",
          estimatedEarnings: item.estimatedEarnings || "0",
          adSource: item.adSource || "N/A",
          adSourceInstance: item.adSourceInstance || "N/A",
          adUnit: item.adUnit || "N/A",
          mediationGroup: item.mediationGroup || "N/A",
          format: item.format,
          mobileOsVersion: parseInt(item.mobileOsVersion) || 0,
          gmaSdkVersion: parseInt(item.gmaSdkVersion) || 0,
          appVersionName: parseInt(item.appVersionName) || 0,
          servingRestriction: item.servingRestriction || "N/A",
          adRequests: item.adRequests || "0",
          clicks: item.clicks || "0",
          impressions: item.impressions || "0",
          matchedRequests: item.matchedRequests || "0",
          matchRate: item.matchRate || "0",
          observedEcpm: item.observedEcpm || "0",
        }));
        console.log("Mapped data:", mappedData);

        setData(mappedData);
      } catch (error) {
        console.error("Failed to fetch report:", error);
      }
    };

    fetchData();
  }, []);

  const columns: ColumnDef<AdMobReport>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <div>{row.getValue("date")}</div>,
    },
    {
      accessorKey: "app",
      header: "App",
      cell: ({ row }) => <div>{row.getValue("app")}</div>,
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => <div>{row.getValue("country")}</div>,
    },
    {
      accessorKey: "platform",
      header: "Platform",
      cell: ({ row }) => <div>{row.getValue("platform")}</div>,
    },
    {
      accessorKey: "adUnit",
      header: "Ad Unit",
      cell: ({ row }) => <div>{row.getValue("adUnit")}</div>,
    },
    {
      accessorKey: "format",
      header: "Ad Format",
      cell: ({ row }) => <div>{row.getValue("format")}</div>,
    },
    {
      accessorKey: "adSource",
      header: "Ad Source",
      cell: ({ row }) => <div>{row.getValue("adSource")}</div>,
    },
    {
      accessorKey: "adSourceInstance",
      header: "Ad Source Instance",
      cell: ({ row }) => <div>{row.getValue("adSourceInstance")}</div>,
    },
    {
      accessorKey: "estimatedEarnings",
      header: "Revenue",
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.getValue("estimatedEarnings")}</div>
      ),
    },
    {
      accessorKey: "observedEcpm",
      header: "eCPM",
      cell: ({ row }) => (
        <div className="text-right">{row.getValue("observedEcpm")}</div>
      ),
    },
    {
      accessorKey: "impressions",
      header: "Impressions",
      cell: ({ row }) => (
        <div className="text-right">
          {(row.getValue("impressions") as number).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "clicks",
      header: "Clicks",
      cell: ({ row }) => (
        <div className="text-right">
          {(row.getValue("clicks") as number).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "adRequests",
      header: "Ad Requests",
      cell: ({ row }) => (
        <div className="text-right">
          {(row.getValue("adRequests") as number).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "matchedRequests",
      header: "Matched Requests",
      cell: ({ row }) => (
        <div className="text-right">
          {(row.getValue("matchedRequests") as number).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "matchRate",
      header: "Match Rate",
      cell: ({ row }) => <div className="text-right">{row.getValue("matchRate")}</div>,
    },
    {
      accessorKey: "mediationGroup",
      header: "Mediation Group",
      cell: ({ row }) => <div>{row.getValue("mediationGroup")}</div>,
    },
    {
      accessorKey: "mobileOsVersion",
      header: "OS Version",
      cell: ({ row }) => <div>{row.getValue("mobileOsVersion")}</div>,
    },
    {
      accessorKey: "gmaSdkVersion",
      header: "GMA SDK Version",
      cell: ({ row }) => <div>{row.getValue("gmaSdkVersion")}</div>,
    },
    {
      accessorKey: "appVersionName",
      header: "App Version",
      cell: ({ row }) => <div>{row.getValue("appVersionName")}</div>,
    },
    {
      accessorKey: "servingRestriction",
      header: "Restriction",
      cell: ({ row }) => <div>{row.getValue("servingRestriction")}</div>,
    },
  ];
  
  

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter apps..."
          value={(table.getColumn("app")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("app")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getFilteredRowModel().rows.length} of {data.length}{" "}
          results
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
