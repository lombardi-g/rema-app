"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useCallback } from "react"

type Activity = {
  id: number
  title: string | null
  description: string
  startTime: string | null
  endTime: string | null
  createdAt: string
  userId: string
  username: string
}

// --- helpers ---------------------------------------------------------------
// The dashboard reuses the same /api?resource=activities endpoint the main
// page already uses. Instead of issuing one SQL "sum" query per day/user, we
// fetch every activity once and derive the stats here. Same data source as the
// activity log, no extra API code, and easy to reason about.

// Duration of a single activity in milliseconds (0 if it has no valid range).
function durationMs(a: Activity) {
  if (!a.startTime || !a.endTime) return 0
  const ms = new Date(a.endTime).getTime() - new Date(a.startTime).getTime()
  return ms > 0 ? ms : 0
}

// Format a duration as H:MM (hours can exceed 24), e.g. 30:23.
function formatHoursMinutes(ms: number) {
  const totalMinutes = Math.floor(ms / 60000)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}:${String(m).padStart(2, "0")}`
}

// Local YYYY-MM-DD key, matching how the main page groups activities by day.
function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

// Short DD/MM label for the chart axis.
function dayLabel(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`
}

// Total logged time per user, sorted descending, limited to the top 5.
function topUsers(activities: Activity[]) {
  const totals = new Map<string, number>()
  for (const a of activities) {
    const ms = durationMs(a)
    if (ms > 0) totals.set(a.username, (totals.get(a.username) ?? 0) + ms)
  }
  return [...totals.entries()]
    .map(([username, ms]) => ({ username, ms }))
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 5)
}

// The last 7 calendar days (oldest first), each with its total logged time.
function lastSevenDays(activities: Activity[]) {
  const today = new Date()
  const days: { key: string; label: string; ms: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push({ key: dayKey(d), label: dayLabel(d), ms: 0 })
  }
  for (const a of activities) {
    const ms = durationMs(a)
    if (ms === 0) continue
    const key = dayKey(new Date(a.createdAt))
    const day = days.find((x) => x.key === key)
    if (day) day.ms += ms
  }
  return days
}

// Bar height as a percentage of the tallest day, so the chart always fills the
// vertical space regardless of the absolute number of hours.
function barHeightPercent(ms: number, maxMs: number) {
  if (maxMs === 0) return 0
  return (ms / maxMs) * 100
}

export default function DashboardPage() {
  return (
    <SessionProvider>
      <Dashboard />
    </SessionProvider>
  )
}

function Dashboard() {
  const { status } = useSession()
  const router = useRouter()

  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const fetchActivities = useCallback(async () => {
    const res = await fetch("/api?resource=activities")
    if (res.ok) setActivities(await res.json())
  }, [])

  useEffect(() => {
    // setState happens asynchronously after the fetch resolves, so this is not a cascading render
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (status === "authenticated") fetchActivities()
  }, [status, fetchActivities])

  if (status === "loading" || status === "unauthenticated") return null

  const users = topUsers(activities)
  const days = lastSevenDays(activities)
  const maxMs = Math.max(...days.map((d) => d.ms), 0)

  return (
    <div>
      {/* Header: return button on the left, logo centered */}
      <div className="relative flex items-center p-4 sm:p-6 border-b border-gray-200">
        <button
          type="button"
          onClick={() => router.push("/main")}
          className="px-4 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
        >
          retornar
        </button>
        <img
          src="/logorema.jpg"
          alt="logo"
          className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-2 border-gray-300 object-cover"
        />
      </div>

      {/* Panels: top 5 users + 7-day chart (side by side on desktop, stacked on mobile) */}
      <div className="p-4 sm:p-6 grid gap-4 md:grid-cols-2">
        {/* Top 5 users panel */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
          <h2 className="text-center text-sm font-semibold text-gray-700 mb-4">
            top 5 usuários
          </h2>
          {users.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              nenhuma hora registrada
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-xs text-gray-400 font-normal pb-2">usuário</th>
                  <th className="text-right text-xs text-gray-400 font-normal pb-2">horas</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.username} className="border-t border-gray-100">
                    <td className="py-2 text-gray-700">{u.username}</td>
                    <td className="py-2 text-gray-700 text-right tabular-nums">
                      {formatHoursMinutes(u.ms)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 7-day hours chart panel */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
          <div className="flex gap-3">
            {/* Rotated y-axis label */}
            <div className="flex items-center">
              <span className="text-xs text-gray-400 -rotate-90 whitespace-nowrap">
                horas registradas
              </span>
            </div>

            {/* Bars */}
            <div className="flex-1">
              <div className="flex items-end justify-between gap-2 h-48 border-l border-b border-gray-300 pl-2">
                {days.map((d) => (
                  <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-[10px] text-gray-500 mb-1 tabular-nums">
                      {d.ms > 0 ? formatHoursMinutes(d.ms) : ""}
                    </span>
                    <div
                      className="w-full max-w-8 bg-sky-400 rounded-t transition-all"
                      style={{ height: `${barHeightPercent(d.ms, maxMs)}%` }}
                    />
                  </div>
                ))}
              </div>
              {/* X-axis date labels */}
              <div className="flex justify-between gap-2 pl-2 mt-2">
                {days.map((d) => (
                  <span
                    key={d.key}
                    className="flex-1 text-center text-[10px] text-gray-500 -rotate-45 origin-center"
                  >
                    {d.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
