import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Database, Eye, UserCheck, Globe, Mail } from 'lucide-react';

const sections = [
  { id: 'collect', title: '1. Information We Collect', icon: Database },
  { id: 'use', title: '2. How We Use Your Information', icon: Eye },
  { id: 'share', title: '3. Information Sharing', icon: Globe },
  { id: 'rights', title: '4. Your Rights', icon: UserCheck },
  { id: 'security', title: '5. Data Security', icon: Shield },
  { id: 'contact', title: '6. Contact Us', icon: Mail },
];

export default function Privacy() {
  return (
    <div className="container max-w-4xl py-12">
      <PageScaffold title="Privacy Policy" description="Last updated: March 14, 2025 · Effective immediately">
        <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
          {/* Table of Contents */}
          <nav className="hidden lg:block sticky top-24 self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">On this page</p>
            <ul className="space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-muted-foreground hover:text-foreground transition-colors">{s.title}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  This Privacy Policy describes how UpgraderCX ("we," "us," or "our") collects, uses, and protects your personal information when you use our digital services platform. We are committed to transparency and compliance with applicable data protection regulations including GDPR and CCPA.
                </p>
              </CardContent>
            </Card>

            <section id="collect" className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> 1. Information We Collect</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p><strong className="text-foreground">Account Information:</strong> Name, email address, phone number, and billing details when you create an account or make a purchase.</p>
                <p><strong className="text-foreground">Transaction Data:</strong> Order history, payment method details (tokenized), wallet transactions, and service usage records.</p>
                <p><strong className="text-foreground">Technical Data:</strong> IP address, browser type, device identifiers, and usage analytics collected via cookies and similar technologies.</p>
                <p><strong className="text-foreground">Communications:</strong> Support tickets, chat messages, and feedback you provide to us.</p>
              </div>
            </section>

            <section id="use" className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Eye className="h-5 w-5 text-primary" /> 2. How We Use Your Information</h2>
              <ul className="text-sm text-muted-foreground list-disc pl-6 space-y-1">
                <li>Process and fulfill your orders and wallet transactions</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send transactional notifications (order updates, security alerts)</li>
                <li>Improve our services through aggregated analytics</li>
                <li>Detect and prevent fraud or unauthorized access</li>
                <li>Comply with legal obligations and enforce our Terms of Service</li>
              </ul>
            </section>

            <section id="share" className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> 3. Information Sharing</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>We <strong className="text-foreground">never sell</strong> your personal data. We may share information with:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong className="text-foreground">Payment processors</strong> to complete transactions securely</li>
                  <li><strong className="text-foreground">Infrastructure providers</strong> for hosting and service delivery</li>
                  <li><strong className="text-foreground">Law enforcement</strong> when required by applicable law</li>
                </ul>
              </div>
            </section>

            <section id="rights" className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary" /> 4. Your Rights</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access, correct, or delete your personal data</li>
                  <li>Export your data in a machine-readable format</li>
                  <li>Withdraw consent for marketing communications at any time</li>
                  <li>Lodge a complaint with your local data protection authority</li>
                </ul>
                <p>To exercise any of these rights, contact us at <strong className="text-foreground">privacy@upgradercx.com</strong>.</p>
              </div>
            </section>

            <section id="security" className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> 5. Data Security</h2>
              <p className="text-sm text-muted-foreground">We employ industry-standard encryption (TLS 1.3), secure token-based authentication, and regular security audits. Payment data is processed through PCI-DSS compliant gateways and never stored on our servers.</p>
            </section>

            <section id="contact" className="space-y-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> 6. Contact Us</h2>
              <p className="text-sm text-muted-foreground">For privacy-related inquiries, reach us at <strong className="text-foreground">privacy@upgradercx.com</strong>. We respond within 48 hours on business days.</p>
            </section>
          </div>
        </div>
      </PageScaffold>
    </div>
  );
}
