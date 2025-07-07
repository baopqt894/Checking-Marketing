"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  {
    name: "Jan 1",
    total: 1200,
  },
  {
    name: "Jan 2",
    total: 1320,
  },
  {
    name: "Jan 3",
    total: 1560,
  },
  {
    name: "Jan 4",
    total: 1480,
  },
  {
    name: "Jan 5",
    total: 1590,
  },
  {
    name: "Jan 6",
    total: 1720,
  },
  {
    name: "Jan 7",
    total: 1800,
  },
  {
    name: "Jan 8",
    total: 1680,
  },
  {
    name: "Jan 9",
    total: 1540,
  },
  {
    name: "Jan 10",
    total: 1720,
  },
  {
    name: "Jan 11",
    total: 1890,
  },
  {
    name: "Jan 12",
    total: 2100,
  },
  {
    name: "Jan 13",
    total: 1950,
  },
  {
    name: "Jan 14",
    total: 1780,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip formatter={(value) => [`${value}`, "Revenue"]} labelFormatter={(label) => `Date: ${label}`} />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}
