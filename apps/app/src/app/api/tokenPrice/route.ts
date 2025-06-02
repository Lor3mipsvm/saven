import { NextResponse } from 'next/server'

export function GET(): NextResponse {
  return NextResponse.json(
    { message: 'Missing <chainId> in /api/tokenPrice/<chainId>' },
    { status: 400 }
  )
}
