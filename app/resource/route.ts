import { NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/ratelimit/ratelimit'
 
export async function POST(request: Request) {
  const { rateLimited } = await checkRateLimit(request)
 
  if (rateLimited) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
 
  return new Response(null, { status: 204 })
}