//api/integrator/unassign-companies/route.js
import { NextResponse } from "next/server";
import { callApiGateway } from "@/utils/serverApi";

export async function POST(req) {
  const body = await req.json();
  const accept = req.headers.get("accept") || "*/*";

  const data = await callApiGateway({
    endpoint: "/mslauncher/api/v1/integrator/unassign-companies",
    method: "POST",
    body,
    headers: {
      Accept: accept,
      "Content-Type": "application/json",
    },
  });

  return NextResponse.json(data);
}