"use client"

import { SessionProvider, useSession, signOut } from "next-auth/react"
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

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function formatDateLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function dateGroupKey(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

function formatDuration(startTime: string, endTime: string) {
  const ms = new Date(endTime).getTime() - new Date(startTime).getTime()
  if (ms <= 0) return null
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h > 0) return `${h}h${m > 0 ? ` ${m}min` : ""}`
  return `${m}min`
}

function totalDuration(activities: Activity[]) {
  const ms = activities
    .filter((a) => a.startTime && a.endTime)
    .reduce((sum, a) => {
      const diff = new Date(a.endTime!).getTime() - new Date(a.startTime!).getTime()
      return sum + (diff > 0 ? diff : 0)
    }, 0)
  if (ms === 0) return null
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return `${h}h ${m}min`
}

export default function MainPage() {
  return (
    <SessionProvider>
      <Dashboard />
    </SessionProvider>
  )
}

function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [activities, setActivities] = useState<Activity[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [submitting, setSubmitting] = useState(false)

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

  async function handleSubmit() {
    if (!description.trim()) return
    setSubmitting(true)

    const usersRes = await fetch("/api?resource=users")
    const users: { id: string; username: string }[] = await usersRes.json()
    const me = users.find((u) => u.username === session?.user?.name)
    if (!me) { setSubmitting(false); return }

    await fetch("/api?resource=activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim() || undefined,
        description: description.trim(),
        userId: me.id,
        startTime: startTime ? new Date(startTime).toISOString() : undefined,
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
      }),
    })

    setTitle("")
    setDescription("")
    setStartTime("")
    setEndTime("")
    setSubmitting(false)
    fetchActivities()
  }

  // Group activities by date (descending)
  const grouped = activities.reduce<Record<string, Activity[]>>((acc, activity) => {
    const key = dateGroupKey(activity.createdAt)
    if (!acc[key]) acc[key] = []
    acc[key].push(activity)
    return acc
  }, {})
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  if (status === "loading" || status === "unauthenticated") return null

  return (
    <div>

        {/* Header */}
        <div className="flex items-start gap-4 p-4 sm:p-6 border-b border-gray-200">
          <img
            src="/logorema.jpg"
            alt="logo"
            className="shrink-0 w-14 h-14 rounded-full border-2 border-gray-300 object-cover"
          />

          <form className="flex-1 flex flex-col gap-2">
            {/* Title row */}
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-0.5">
                <label className="text-xs text-gray-400">título</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>

            {/* Description row */}
            <div className="flex gap-2">
              <div className="flex-1 flex flex-col gap-0.5">
                <label className="text-xs text-gray-400">descrição</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>

            {/* Time row */}
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-0.5">
                <label className="text-xs text-gray-400">início</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-xs text-gray-400">fim</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-gray-500"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                registrar
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 py-1.5 transition-colors"
              >
                sair
              </button>
            </div>
          </form>
        </div>

        {/* Activity log */}
        <div className="p-4 sm:p-6 bg-[#c7f1c2]">
          {sortedDates.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">
              nenhuma atividade registrada
            </p>
          ) : (
            sortedDates.map((dateKey) => {
              const dayActivities = grouped[dateKey]
              const total = totalDuration(dayActivities)

              return (
                <div key={dateKey} className="mb-8">
                  <div className="flex items-baseline justify-between mb-2">
                    <h2 className="text-sm font-semibold text-gray-700">
                      {formatDateLabel(dayActivities[0].createdAt)}
                    </h2>
                    {total && (
                      <span className="text-xs text-gray-400">total: {total}</span>
                    )}
                  </div>

                  {/* Desktop table */}
                  <table className="w-full text-sm hidden sm:table">
                    <thead>
                      <tr>
                        <th className="text-left text-xs text-gray-400 font-normal pb-1 w-20">hora</th>
                        <th className="text-left text-xs text-gray-400 font-normal pb-1 w-36">usuário</th>
                        <th className="text-left text-xs text-gray-400 font-normal pb-1 w-20">início</th>
                        <th className="text-left text-xs text-gray-400 font-normal pb-1 w-20">término</th>
                        <th className="text-left text-xs text-gray-400 font-normal pb-1 w-24">duração</th>
                        <th className="text-left text-xs text-gray-400 font-normal pb-1 w-40">título</th>
                        <th className="text-left text-xs text-gray-400 font-normal pb-1">log</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayActivities.map((activity) => {
                        const duration =
                          activity.startTime && activity.endTime
                            ? formatDuration(activity.startTime, activity.endTime)
                            : null
                        return (
                          <tr key={activity.id} className="border-t border-gray-100">
                            <td className="py-2 text-gray-500 align-top">
                              • {formatTime(activity.createdAt)}
                            </td>
                            <td className="py-2 text-gray-600 align-top">{activity.username}</td>
                            <td className="py-2 text-gray-600 align-top">
                              {activity.startTime ? formatTime(activity.startTime) : ""}
                            </td>
                            <td className="py-2 text-gray-600 align-top">
                              {activity.endTime ? formatTime(activity.endTime) : ""}
                            </td>
                            <td className="py-2 text-gray-600 align-top">{duration ?? ""}</td>
                            <td className="py-2 text-gray-700 align-top">
                              {activity.title ?? ""}
                            </td>
                            <td className="py-2 text-gray-800 align-top">
                              {activity.description}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {/* Mobile list */}
                  <ul className="sm:hidden flex flex-col gap-2">
                    {dayActivities.map((activity) => {
                      const duration =
                        activity.startTime && activity.endTime
                          ? formatDuration(activity.startTime, activity.endTime)
                          : null
                      return (
                        <li key={activity.id} className="border-t border-gray-100 pt-2">
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-500 mb-0.5">
                            <span>• {formatTime(activity.createdAt)}</span>
                            <span className="text-gray-400">{activity.username}</span>
                            {(activity.startTime || activity.endTime) && (
                              <span className="text-gray-400">
                                {activity.startTime ? formatTime(activity.startTime) : "—"}
                                {" → "}
                                {activity.endTime ? formatTime(activity.endTime) : "—"}
                              </span>
                            )}
                            {duration && <span className="text-gray-400">{duration}</span>}
                          </div>
                          {activity.title && (
                            <p className="text-sm font-medium text-gray-700">{activity.title}</p>
                          )}
                          <p className="text-sm text-gray-800">{activity.description}</p>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })
          )}
        </div>
    </div>
  )
}
