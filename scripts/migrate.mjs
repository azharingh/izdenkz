import { readFileSync } from "fs"
import { resolve } from "path"

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env")
    const content = readFileSync(envPath, "utf8")
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim().replace(/^"|"$/g, "")
        if (!process.env[key]) process.env[key] = value
      }
    }
  } catch {
    // ignore
  }
}

loadEnv()

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.error("DATABASE_URL not set")
  process.exit(1)
}

const { Client } = await import("pg")
const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
})

const statements = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth TIMESTAMPTZ`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS region TEXT`,
  `CREATE TABLE IF NOT EXISTS article_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'CHECKING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (article_id, admin_id)
  )`,
  `CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(id),
    author_name TEXT,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, article_id)
  )`,
]

try {
  await client.connect()
  for (const sql of statements) {
    await client.query(sql)
    console.log("OK:", sql.slice(0, 60) + "...")
  }
  console.log("Migration complete")
} catch (err) {
  console.error("Migration failed:", err)
  process.exit(1)
} finally {
  await client.end()
}
