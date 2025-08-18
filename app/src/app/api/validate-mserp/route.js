import { NextResponse } from "next/server";

export async function POST(req) { 
  const { url } = await req.json();
  const base = (url || "").trim().replace(/\/+$/, "");
  const full = `${base}/mserpservice/api/v1/version`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(full, {
      method: "GET",
      headers: { Accept: "application/json" },
      redirect: "manual",
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText || "",
      finalUrl: full,
    });
  } catch (e) {
    clearTimeout(timeout);
    return NextResponse.json({
      ok: false,
      status: 0,
      statusText: e?.message || "Failed to fetch",
      finalUrl: full,
    });
  }
}
