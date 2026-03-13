import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#0F172A' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(20,184,166,0.1)', boxShadow: '0 0 40px rgba(20,184,166,0.1)' }}
      >
        <span className="text-3xl">📡</span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">You&apos;re offline</h1>
      <p className="text-[#64748B] text-sm mb-8 max-w-xs">
        Your project data will sync automatically when you reconnect to the internet.
      </p>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        style={{
          background: 'rgba(20,184,166,0.15)',
          border: '1px solid rgba(20,184,166,0.3)',
          color: '#14B8A6',
        }}
      >
        View Cached Projects
      </Link>
    </div>
  );
}
