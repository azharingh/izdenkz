import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { ADMIN_REVIEWER_EMAILS } from "@/lib/adminConfig";

const DEFAULT_ADMIN_PASSWORD = "Admin123!";
const SECRET_HEADER = "x-admin-setup-secret";

export async function POST(request: Request) {
  const secret = request.headers.get(SECRET_HEADER);
  const setupSecret = process.env.ADMIN_SETUP_SECRET;

  if (!setupSecret || secret !== setupSecret) {
    return NextResponse.json(
      { error: "Unauthorized. Missing or invalid setup secret." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const defaultPassword = typeof body?.defaultPassword === "string" && body.defaultPassword.trim().length > 0
    ? body.defaultPassword.trim()
    : DEFAULT_ADMIN_PASSWORD;

  const results = [];

  for (const email of ADMIN_REVIEWER_EMAILS) {
    const name = email.split("@")[0] || email;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (fetchError) {
      results.push({ email, success: false, error: fetchError.message });
      continue;
    }

    if (existingUser) {
      const { error: updateError } = await supabaseAdmin
        .from("users")
        .update({ role: "ADMIN", name })
        .eq("email", email);

      results.push({ email, success: !updateError, error: updateError?.message || null });
      continue;
    }

    const { error: insertError } = await supabaseAdmin
      .from("users")
      .insert({ email, name, role: "ADMIN", password: hashedPassword });

    results.push({ email, success: !insertError, error: insertError?.message || null });
  }

  return NextResponse.json({ results, defaultPassword });
}
