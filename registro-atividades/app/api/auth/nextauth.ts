import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { rows } = await pool.query(
          `SELECT * FROM "User" WHERE username = $1`,
          [credentials?.username]
        )
        const user = rows[0]
        if (!user) return null
        if (user.password !== credentials?.password) return null
        return { id: String(user.id), name: user.username }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
})
