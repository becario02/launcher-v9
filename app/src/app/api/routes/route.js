// src/app/api/routes/route.js
import { NextResponse } from 'next/server'
import { getAppRoutes } from '@/utils/getAppRoutes.server'

export async function GET() {
  try {
    const routes = getAppRoutes()
    return NextResponse.json(routes)
  } catch {
    return NextResponse.json({ error: 'No se pudieron obtener rutas' }, { status: 500 })
  }
}
