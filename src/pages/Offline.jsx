export default function OfflinePage() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Resonifi • Offline</title>
      </head>
      <body style={{
        margin: 0,
        background: '#0B1524',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'
      }}>
        <main style={{
          padding: 24,
          maxWidth: 560,
          margin: '40px auto',
          minHeight: '100vh'
        }}>
          <div style={{
            border: '1px solid #1f2a44',
            borderRadius: 12,
            padding: 16,
            background: '#0F1A2E'
          }}>
            <h3 style={{
              marginTop: 0,
              color: '#ffffff',
              fontSize: 20,
              fontWeight: 600
            }}>
              Offline
            </h3>
            <p style={{
              color: '#cfd8e3',
              lineHeight: 1.6,
              margin: '12px 0 0 0'
            }}>
              You're offline. Recent pages may still work from cache. Reconnect to sync your latest Resonifi data.
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}