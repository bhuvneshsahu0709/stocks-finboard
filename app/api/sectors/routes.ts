import { NextResponse } from "next/server"

export async function GET() {
  try {
    const res = await fetch(
      `https://financialmodelingprep.com/api/v3/sector-performance?apikey=${process.env.FMP_API_KEY}`,
      { cache: "no-store" }
    )

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from FMP" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
