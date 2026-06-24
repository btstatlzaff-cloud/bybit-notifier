export const metadata = {
  title: 'Claude Trading Bot',
  description: 'Feed de actividad en tiempo real',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, background: '#0a0a0f', color: '#e2e8f0', fontFamily: "'Courier New', monospace" }}>
        {children}
      </body>
    </html>
  )
}
