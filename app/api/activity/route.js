import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export async function GET() {
  try {
    const raw = await redis.lrange('activity', 0, 99)
    const items = raw.map(item => typeof item === 'string' ? JSON.parse(item) : item)
    return Response.json({ items })
  } catch (e) {
    return Response.json({ items: [], error: e.message })
  }
}
