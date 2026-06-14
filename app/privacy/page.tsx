import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Wuwa Archive",
  description: "Wuwa Archive privacy policy - Your data stays in your browser",
};

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: {lastUpdated}
      </p>

      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Data Collection</h2>
          <p className="text-muted-foreground">
            <strong className="text-foreground">
              Wuwa Archive does NOT collect any personal data.
            </strong>{" "}
            All your pull history data is stored exclusively in your browser using
            IndexedDB. We have no access to your data at any point.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Local Storage</h2>
          <p className="text-muted-foreground">
            All data, including your pull history, player UID, and preferences,
            is stored locally in your browser. This data is never transmitted to
            our servers or any third party.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Proxy Server</h2>
          <p className="text-muted-foreground">
            Our server acts only as a thin proxy to fetch data from the Kuro Games
            API. The server does not store, log, or retain any data after the
            request is completed. Your Convene URL is processed and immediately
            discarded.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Cookies</h2>
          <p className="text-muted-foreground">
            We use only essential cookies for UI preferences such as theme and
            language settings. No tracking cookies or analytics cookies are used.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Third-Party Services</h2>
          <p className="text-muted-foreground">
            Wuwa Archive does not use any third-party analytics, tracking, or
            advertising services. We do not share any data with external parties.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Data Deletion</h2>
          <p className="text-muted-foreground">
            You can delete all your data at any time from the Settings page. Once
            deleted, your data is permanently removed from your browser and cannot
            be recovered.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Open Source</h2>
          <p className="text-muted-foreground">
            Wuwa Archive is open source (GPL-3.0). You can audit our code on GitHub
            to verify that we do not collect any data without your consent.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-border">
        <Link
          href="/"
          className="text-accent hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
