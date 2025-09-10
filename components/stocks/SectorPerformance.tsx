"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

interface Sector {
  sector: string
  changesPercentage: string
}

async function fetchSectorPerformance(): Promise<Sector[]> {
  const url = `https://financialmodelingprep.com/api/v3/sector-performance?apikey=${process.env.FMP_API_KEY}`

  const res = await fetch(url, {
    method: "GET",
    next: { revalidate: 3600 }, // cache for 1 hour
  })

  if (!res.ok) {
    throw new Error("Failed to fetch sector performance")
  }

  return res.json()
}

export default function SectorPerformance() {
  const [data, setData] = useState<Sector[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const result = await fetchSectorPerformance()
        if (!result) {
          setError("No sector data found")
          return
        }

        // Calculate average across all sectors
        const totalChangePercentage = result.reduce((total, sector) => {
          return total + parseFloat(sector.changesPercentage)
        }, 0)

        const averageChangePercentage =
          (totalChangePercentage / result.length).toFixed(2) + "%"

        const allSectors = {
          sector: "All sectors",
          changesPercentage: averageChangePercentage,
        }

        setData([allSectors, ...result])
      } catch (err: any) {
        setError(err.message)
      }
    }

    loadData()
  }, [])

  if (error) return <p className="text-red-500">{error}</p>
  if (!data) return <p>Loading sector performance...</p>

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Sector Performance</h2>

      {/* Grid view */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.map((sector) => (
          <div
            key={sector.sector}
            className="flex w-full flex-row items-center justify-between text-sm"
          >
            <span className="font-medium">{sector.sector}</span>
            <span
              className={cn(
                "w-[4rem] min-w-fit rounded-md px-2 py-0.5 text-right transition-colors",
                parseFloat(sector.changesPercentage) > 0
                  ? "bg-gradient-to-l from-green-300 text-green-800 dark:from-green-950 dark:text-green-400"
                  : "bg-gradient-to-l from-red-300 text-red-800 dark:from-red-950 dark:text-red-500"
              )}
            >
              {parseFloat(sector.changesPercentage).toFixed(2) + "%"}
            </span>
          </div>
        ))}
      </div>

      {/* Chart view */}
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sector" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey={(entry) => parseFloat(entry.changesPercentage)}
              fill="#10b981" // Tailwind green-500
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
