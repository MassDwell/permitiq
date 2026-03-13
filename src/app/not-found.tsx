export default function NotFound() {
  return (
    <div style={{ background: '#0F172A', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F1F5F9' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 800, color: '#14B8A6', lineHeight: 1 }}>404</h1>
        <p style={{ color: '#94A3B8', marginTop: '1rem', marginBottom: '2rem' }}>Page not found</p>
        <a href="/" style={{ background: '#14B8A6', color: '#0F172A', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>Go Home</a>
      </div>
    </div>
  );
}
