// pages/api/notify.js
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

    const { secret, message, type, pnl, price, action } = req.body;

      if (secret !== process.env.NOTIFY_SECRET) {
          return res.status(401).json({ error: 'Unauthorized' });
            }

              const notification = {
                  id: Date.now(),
                      message,
                          type:   type   || 'info',
                              pnl:    pnl    || null,
                                  price:  price  || null,
                                      action: action || null,
                                          timestamp: new Date().toISOString(),
                                            };

                                              await kv.lpush('bybit:notifications', JSON.stringify(notification));
                                                await kv.ltrim('bybit:notifications', 0, 49);

                                                  return res.status(200).json({ ok: true });
                                                  }
