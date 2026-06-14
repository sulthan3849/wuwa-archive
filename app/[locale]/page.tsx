import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, BarChart3, Database, Shield } from 'lucide-react';

export default function HomePage() {
  const t = useTranslations('Index');
  return (
    <div className="bg-basis flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 lg:py-32 flex flex-col items-center text-center px-4">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight text-foreground">
            Your Ultimate <span className="text-accent">Wuthering Waves</span> Tracker
          </h1>
          <p className="text-xl text-muted-foreground">
            Local-first, secure, and lightning-fast convene history analysis. No servers. No tracking. Just your data.
          </p>
          <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/import" className="px-8 py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-accent/90 transition flex items-center justify-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/tracker" className="px-8 py-3 border border-border bg-card text-foreground font-semibold rounded-lg hover:bg-muted/50 transition">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-6xl px-4 py-16 grid md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border shadow-sm">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="text-accent w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Local First</h3>
          <p className="text-muted-foreground text-sm">Your data never leaves your device. Everything is processed directly in your browser.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border shadow-sm">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="text-accent w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
          <p className="text-muted-foreground text-sm">Visualize your 50/50 win rates, pity progression, and luck percentiles instantly.</p>
        </div>
        <div className="flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border shadow-sm">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4">
            <Database className="text-accent w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Infinite History</h3>
          <p className="text-muted-foreground text-sm">Bypass the in-game 6-month limit. Keep a permanent archive of your pulls forever.</p>
        </div>
      </section>
    </div>
  );
}
