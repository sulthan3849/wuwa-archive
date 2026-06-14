import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Wuwa Archive",
  description: "Wuwa Archive terms of service",
};

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last updated: {lastUpdated}
      </p>

      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Disclaimer</h2>
          <p className="text-muted-foreground">
            <strong className="text-foreground">
              Wuwa Archive is not affiliated with Kuro Games.
            </strong>{" "}
            This is an independent fan-made tool for tracking pull statistics.
            Wuthering Waves is a trademark of Kuro Games.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. No Warranty</h2>
          <p className="text-muted-foreground">
            The service is provided "as is" without warranty of any kind.
            We do not guarantee the accuracy of pull data, uninterrupted service,
            or fitness for any particular purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Data Accuracy</h2>
          <p className="text-muted-foreground">
            While we strive to provide accurate pull statistics, we cannot
            guarantee 100% accuracy due to potential changes in the Kuro Games
            API. Data from the game's Convene History is the source of truth.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Account Safety</h2>
          <p className="text-muted-foreground">
            Our PowerShell script only reads log files to extract the Convene URL.
            It does not modify any game files, inject code, or interact with the
            game in any way. Using Wuwa Archive will not result in any game ban.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Open Source License</h2>
          <p className="text-muted-foreground">
            Wuwa Archive is released under the{" "}
            <strong className="text-foreground">GPL-3.0 license</strong>. You are
            free to use, modify, and distribute this software under the terms of
            that license.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            In no event shall the developers of Wuwa Archive be liable for any
            damages arising from the use of this service, including but not limited
            to data loss, game bans, or any indirect damages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these terms at any time. Continued use
            of the service after changes constitutes acceptance of the new terms.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t border-border">
        <a
          href="/"
          className="text-accent hover:underline"
        >
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
