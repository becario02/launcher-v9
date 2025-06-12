import { NextResponse } from "next/server";

export async function POST(req) {
  const authorization = req.headers.get("authorization");
  const accept = req.headers.get("accept") || "*/*";

  const response = await fetch(`${process.env.API_BASE_URL}/mslauncher/api/v1/integrator/upload`, {
    method: "POST",
    headers: {
      'x-api-key': process.env.API_KEY,
      'accept': accept,
      'authorization': authorization,
    },
    body: req.body
  });

  const data = await response.json();
  return NextResponse.json(data);
}

