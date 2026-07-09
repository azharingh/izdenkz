import { readFileSync } from "fs"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

const envPath = resolve(process.cwd(), ".env")
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, "")
}

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

for (const table of ["comments", "likes", "articles"]) {
  const { data, error } = await sb.from(table).select("id").limit(1)
  console.log(table, error ? `ERR: ${error.message}` : `ok (${data?.length ?? 0} rows sampled)`)
}
