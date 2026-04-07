import { NextResponse } from "next/server";
import { getCsrfToken, setCsrfCookie } from "@/lib/csrf";

export async function GET() {
  const csrfToken = (await getCsrfToken()) ?? (await setCsrfCookie());
  const csrfToken = await setCsrfCookie();
  return NextResponse.json({ csrfToken });
}
