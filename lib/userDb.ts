export type ClientUser = {
  id: string
  name: string
  email: string
  role?: string
  interests?: string[]
  created_at?: string
  firstName?: string
  lastName?: string
  username?: string | null
  dateOfBirth?: string | null
  region?: string | null
}

export function toClientUser(row: Record<string, unknown>): ClientUser {
  const name = String(row.name || "")
  const parts = name.trim().split(/\s+/)
  const firstName = (row.firstName ?? row.first_name ?? parts[0] ?? "") as string
  const lastName = (row.lastName ?? row.last_name ?? parts.slice(1).join(" ") ?? "") as string
  const rawDob = row.dateOfBirth ?? row.date_of_birth

  return {
    id: String(row.id),
    name,
    email: String(row.email),
    role: row.role ? String(row.role) : "USER",
    interests: Array.isArray(row.interests) ? row.interests : [],
    created_at: row.created_at ? String(row.created_at) : undefined,
    firstName,
    lastName,
    username: (row.username as string | null) ?? null,
    dateOfBirth: rawDob ? String(rawDob) : null,
    region: (row.region as string | null) ?? null,
  }
}

export function signupPayload(input: {
  email: string
  password: string
  firstName?: string
  lastName?: string
  name?: string
  interests?: string[]
}) {
  const firstName = input.firstName?.trim() || ""
  const lastName = input.lastName?.trim() || ""
  const name =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : input.name?.trim() || input.email.split("@")[0]

  return {
    name,
    email: input.email.trim().toLowerCase(),
    password: input.password,
    role: "USER",
    interests: input.interests || [],
    ...(firstName ? { first_name: firstName } : {}),
    ...(lastName ? { last_name: lastName } : {}),
  }
}

export function profileUpdatePayload(input: {
  firstName: string
  lastName: string
  username?: string
  dateOfBirth?: string
  region?: string
}) {
  const firstName = input.firstName.trim()
  const lastName = input.lastName.trim()

  const payload: Record<string, unknown> = {
    name: `${firstName} ${lastName}`,
    first_name: firstName,
    last_name: lastName,
    username: input.username?.trim() || null,
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
