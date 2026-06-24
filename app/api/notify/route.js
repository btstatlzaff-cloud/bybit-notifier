import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()
const SECRET = process.env.NOTIFY_SECRET || 'bybit-claude-notify-xk9m2024secret'

export async function POST(req) {
  try {
    const body = await req.json()
    if (body.secret !== SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const entry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      message: body.message || '',
      type: body.type || 'info',
      pnl: body.pnl ?? null,
      price: body.price ?? null,
      action: body.action ?? null,
    }

    // Store in list, keep last 200
    await redis.lpush('activity', JSON.stringify(entry))
    await redis.ltrim('activity', 0, 199)

    return Response.json({ ok: true })
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 })
  }
}
