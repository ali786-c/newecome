import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent } from '@/components/ui/card';
import { Ban, AlertTriangle, Scale } from 'lucide-react';

export default function AcceptableUse() {
  return (
    <div className="container max-w-4xl py-12">
      <PageScaffold title="Acceptable Use Policy" description="Last updated: March 14, 2025 · Effective immediately">
        <div className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">This Acceptable Use Policy ("AUP") governs your use of the UpgraderCX platform. Violations may result in immediate suspension or termination of your account.</p>
            </CardContent>
          </Card>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Ban className="h-5 w-5 text-destructive" /> Prohibited Activities</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Fraud & Deception', items: ['Identity theft or impersonation', 'Providing false account information', 'Chargeback fraud or manipulation'] },
                { title: 'Security Violations', items: ['Unauthorized access to accounts or systems', 'Distribution of malware or exploits', 'Attempting to bypass platform security'] },
                { title: 'Content Violations', items: ['Distributing illegal or harmful content', 'Spam, phishing, or social engineering', 'Harassment or threatening behavior'] },
                { title: 'Commercial Misuse', items: ['Unauthorized reselling of services', 'Automated scraping or data harvesting', 'Circumventing usage limits or quotas'] },
              ].map((cat) => (
                <Card key={cat.title}>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-foreground text-sm">{cat.title}</h3>
                    <ul className="mt-2 text-sm text-muted-foreground list-disc pl-4 space-y-1">
                      {cat.items.map((i) => <li key={i}>{i}</li>)}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary" /> Enforcement</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Violations are handled based on severity:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong className="text-foreground">Warning:</strong> First minor offense — written notice and corrective guidance</li>
                <li><strong className="text-foreground">Suspension:</strong> Repeated or moderate offenses — temporary account restriction</li>
                <li><strong className="text-foreground">Termination:</strong> Severe or criminal violations — permanent ban and legal referral</li>
              </ul>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Scale className="h-5 w-5 text-primary" /> Reporting</h2>
            <p className="text-sm text-muted-foreground">To report a violation, email <strong className="text-foreground">abuse@upgradercx.com</strong> with relevant details. All reports are reviewed within 24 hours.</p>
          </section>
        </div>
      </PageScaffold>
    </div>
  );
}
