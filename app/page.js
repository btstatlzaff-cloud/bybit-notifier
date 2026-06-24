'use client'
import { useState, useEffect, useRef } from 'react'

const TYPE_CONFIG = {
  trade_open:  { icon: '🟢', label: 'TRADE ABIERTO',  color: '#22c55e', bg: '#052e16' },
  trade_close: { icon: '🔴', label: 'POSICION CERRADA', color: '#ef4444', bg: '#2d0707' },
  thinking:    { icon: '🧠', label: 'ANALIZANDO',      color: '#a78bfa', bg: '#1e1030' },
  analysis:    { icon: '📊', label: 'ANÁLISIS',         color: '#38bdf8', bg: '#082038' },
  decision:    { icon: '⚡', label: 'DECISIÓN',         color: '#fbbf24', bg: '#1c1000' },
  tp_sl:       { icon: '🎯', label: 'TP/SL',            color: '#fb923c', bg: '#1c0a00' },
  warning:     { icon: '⚠️', label: 'ADVERTENCIA',     color: '#facc15', bg: '#1a1500' },
  info:        { icon: '📋', label: 'INFO',             color: '#94a3b8', bg: '#111827' },
  error:       { icon: '❌', label: 'ERROR',            color: '#f87171', bg: '#2d0707' },
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch { return '' }
}

function ActivityCard({ item }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.info
  return (
    <div style={{
      borderLeft: `3px solid ${cfg.color}`,
      background: cfg.bg,
      borderRadius: '6px',
      padding: '12px 16px',
      marginBottom: '8px',
      animation: 'fadeIn 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ color: cfg.color, fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>
          {cfg.icon} {cfg.label}
        </span>
        <span style={{ color: '#475569', fontSize: '11px' }}>{formatTime(item.timestamp)}</span>
      </div>
      <div style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.5' }}>
        {item.message}
      </div>
      {(item.pnl !== null && item.pnl !== undefined) && (
        <div style={{ marginTop: '6px', fontSize: '13px', color: item.pnl >= 0 ? '#22c55e' : '#ef4444' }}>
          PnL: {item.pnl >= 0 ? '+' : ''}{item.pnl} USDT
        </div>
      )}
      {item.price && (
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
          Precio: ${parseFloat(item.price).toLocaleString()}
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const [items, setItems] = useState([])
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [filter, setFilter] = useState('all')
  const intervalRef = useRef(null)

  async function fetchActivity() {
    try {
      const res = await fetch('/api/activity')
      const data = await res.json()
      if (data.items) {
        setItems(data.items)
        setLastUpdate(new Date())
        setConnected(true)
      }
    } catch {
      setConnected(false)
    }
  }

  useEffect(() => {
    fetchActivity()
    intervalRef.current = setInterval(fetchActivity, 3000)
    return () => clearInterval(intervalRef.current)
  }, [])

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter ||
    (filter === 'trades' && (i.type === 'trade_open' || i.type === 'trade_close')))

  const tradeCount = items.filter(i => i.type === 'trade_open').length
  const lastTrade = items.find(i => i.type === 'trade_open' || i.type === 'trade_close')

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '28px', marginBottom: '4px' }}>₿</div>
        <h1 style={{ margin: '0 0 4px', fontSize: '20px', color: '#f1f5f9', letterSpacing: '2px' }}>
          CLAUDE TRADING BOT
        </h1>
        <p style={{ margin: '0 0 12px', color: '#475569', fontSize: '12px', letterSpacing: '1px' }}>
          FEED DE ACTIVIDAD EN TIEMPO REAL
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: connected ? '#22c55e' : '#ef4444',
            animation: connected ? 'pulse 2s infinite' : 'none',
          }} />
          <span style={{ color: connected ? '#22c55e' : '#ef4444', fontSize: '12px', letterSpacing: '1px' }}>
            {connected ? 'EN VIVO' : 'OFFLINE'}
          </span>
          {lastUpdate && (
            <span style={{ color: '#334155', fontSize: '11px' }}>
              · actualizado {lastUpdate.toLocaleTimeString('es-AR')}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'TOTAL ACTIVIDAD', value: items.length, color: '#38bdf8' },
          { label: 'TRADES HOY', value: tradeCount, color: '#22c55e' },
          { label: 'ÚLTIMO EVENTO', value: lastTrade ? formatTime(lastTrade.timestamp) : '—', color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} style={{ background: '#111827', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
            <div style={{ color: s.color, fontSize: '20px', fontWeight: 'bold' }}>{s.value}</div>
            <div style={{ color: '#475569', fontSize: '10px', letterSpacing: '1px', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'TODO' },
          { key: 'trades', label: '🟢 TRADES' },
          { key: 'thinking', label: '🧠 ANÁLISIS' },
          { key: 'decision', label: '⚡ DECISIONES' },
          { key: 'info', label: '📋 INFO' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            background: filter === f.key ? '#1e293b' : 'transparent',
            border: `1px solid ${filter === f.key ? '#38bdf8' : '#1e293b'}`,
            color: filter === f.key ? '#38bdf8' : '#475569',
            padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
            fontSize: '11px', letterSpacing: '1px',
          }}>{f.label}</button>
        ))}
        <button onClick={fetchActivity} style={{
          marginLeft: 'auto', background: 'transparent', border: '1px solid #1e293b',
          color: '#475569', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px',
        }}>↻ Actualizar</button>
      </div>

      {/* Feed */}
      <div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#334155' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🤖</div>
            <div style={{ fontSize: '14px' }}>Sin actividad todavía.</div>
            <div style={{ fontSize: '12px', marginTop: '8px', color: '#1e293b' }}>
              Claude te avisará acá cuando analice el mercado o ejecute trades.
            </div>
          </div>
        ) : (
          filtered.map(item => <ActivityCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  )
}
