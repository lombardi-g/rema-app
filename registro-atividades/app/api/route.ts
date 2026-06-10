import { NextRequest, NextResponse } from "next/server"
import { Pool } from "pg"

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    maxLifetimeSeconds: 60
})

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const resource = searchParams.get("resource")

  if (resource === "activities") {
    const { rows } = await pool.query(`SELECT a.*, u.username FROM "Activity" a JOIN "User" u ON a."userId" = u.id ORDER BY a.id DESC`)
    return NextResponse.json(rows, { status: 200 })
  }

  if (resource === "users") {
    const { rows } = await pool.query("SELECT * FROM \"User\" ORDER BY id DESC")
    return NextResponse.json(rows, { status: 200 })
  }

  return NextResponse.json(
    { error: "resource query param must be 'activities' or 'users'" },
    { status: 400 }
  )
}

export async function POST(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const resource = searchParams.get("resource")
  const body = await request.json()

  if (resource === "activities") {
    const { title, description, userId, startTime, endTime } = body
    if (!description || !userId) {
      return NextResponse.json(
        { error: "'description' and 'userId' are required" },
        { status: 400 }
      )
    }
    const { rows } = await pool.query(
      `INSERT INTO "Activity" (title, description, "userId", "startTime", "endTime", "createdAt")
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [title ?? null, description, userId, startTime ?? null, endTime ?? null]
    )
    return NextResponse.json(rows[0], { status: 201 })
  }

  if (resource === "users") {
    const { username, password } = body
    if (!username || !password) {
      return NextResponse.json(
        { error: "'username' and 'password' are required" },
        { status: 400 }
      )
    }
    const { rows } = await pool.query(
      "INSERT INTO \"User\" (username, password) VALUES ($1, $2) RETURNING *",
      [username, password]
    )
    return NextResponse.json(rows[0], { status: 201 })
  }

  return NextResponse.json(
    { error: "resource query param must be 'activities' or 'users'" },
    { status: 400 }
  )
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const resource = searchParams.get("resource")
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "'id' query param is required" }, { status: 400 })
  }

  if (resource === "activities") {
    await pool.query("DELETE FROM \"Activity\" WHERE id = $1", [id])
    return NextResponse.json({ message: "activity deleted" }, { status: 200 })
  }

  if (resource === "users") {
    await pool.query("DELETE FROM \"User\" WHERE id = $1", [id])
    return NextResponse.json({ message: "user deleted" }, { status: 200 })
  }

  return NextResponse.json(
    { error: "resource query param must be 'activities' or 'users'" },
    { status: 400 }
  )
}
