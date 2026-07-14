import type { SupabaseClient } from "@supabase/supabase-js"

export type ClientUser = {
  id: string
  name: string
  email: string
  role: string
  username?: string | null
  region?: string | null
  first_name?: string | null
  last_name?: string | null
  date_of_birth?: string | null
  interests?: unknown
}

export function toClientUser(row: Record<string, any>): ClientUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    username: row.username ?? null,
    region: row.region ?? null,
    firstName: row.first_name ?? null,
    lastName: row.last_name ?? null,
    dateOfBirth: row.date_of_birth ?? null,
    avatarUrl: row.avatar_url ?? null,
    interests: row.interests ?? null,
  } as ClientUser
}

export type SignupInput = {
  email: string
  password: string
  firstName: string
  lastName: string
  interests?: unknown
}

export function signupPayload(input: SignupInput) {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()

  return {
    name: `${firstName} ${lastName}`,
    first_name: firstName,
    last_name: lastName,
    email: input.email,
    password: input.password,
    role: "USER",
    interests: input.interests ?? null,
  }
}

export type ProfileInput = {
  firstName: string
  lastName: string
  username?: string
  dateOfBirth?: string
  region?: string
}

function normalizeUsername(value?: string): string | null {
  if (!value?.trim()) return null
  return value.trim().replace(/^@+/, "")
}

export function profileUpdatePayload(input: ProfileInput) {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()

  const payload: Record<string, unknown> = {
    name: `${firstName} ${lastName}`,
    first_name: firstName,
    last_name: lastName,
    username: normalizeUsername(input.username),
    region: input.region || null,
  }

  if (input.dateOfBirth) {
    const parsed = new Date(input.dateOfBirth)
    if (!Number.isNaN(parsed.getTime())) {
      payload.date_of_birth = parsed.toISOString()
    }
  } else {
    payload.date_of_birth = null
  }

  return payload
}

export async function applyUserProfileUpdate(
  supabase: SupabaseClient,
  userId: string,
  input: ProfileInput
): Promise<{ user: ClientUser; error?: string }> {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()
  const username = normalizeUsername(input.username)
  const name = `${firstName} ${lastName}`

  const { data: baseRow, error: baseError } = await supabase
    .from("users")
    .update({ name })
    .eq("id", userId)
    .select()
    .maybeSingle()

  if (baseError || !baseRow) {
    return { user: null as unknown as ClientUser, error: baseError?.message || "Пайдаланушы табылмады." }
  }

  let row: Record<string, unknown> = { ...baseRow }

  const fullPayload = profileUpdatePayload(input)
  const { data: fullRow, error: fullError } = await supabase
    .from("users")
    .update(fullPayload)
    .eq("id", userId)
    .select()
    .maybeSingle()

  if (!fullError && fullRow) {
    row = fullRow
  } else if (fullError?.message?.includes("column")) {
    const { data: usernameRow, error: usernameError } = await supabase
      .from("users")
      .update({ username })
      .eq("id", userId)
      .select()
      .maybeSingle()

    if (!usernameError && usernameRow) {
      row = { ...row, ...usernameRow }
    } else if (username && usernameError?.message?.includes("column")) {
      return {
        user: toClientUser(row),
        error: "username бағаны жоқ. Supabase SQL Editor-де supabase/schema.sql орындаңыз.",
      }
    }

    for (const [field, value] of Object.entries({
      region: input.region || null,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: fullPayload.date_of_birth ?? null,
    })) {
      const { data: partialRow, error: partialError } = await supabase
        .from("users")
        .update({ [field]: value })
        .eq("id", userId)
        .select()
        .maybeSingle()

      if (!partialError && partialRow) {
        row = { ...row, ...partialRow }
      }
    }
  } else if (fullError) {
    return { user: toClientUser(row), error: fullError.message }
  }

  const user = toClientUser(row)
  if (username && !user.username) {
    user.username = username
  }

  return { user }
}