import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent } from '@/components/ui/card';

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'accounts', title: '2. Account Responsibilities' },
  { id: 'products', title: '3. Products & Delivery' },
  { id: 'payments', title: '4. Payments & Pricing' },
  { id: 'refunds', title: '5. Refunds & Replacements' },
  { id: 'usage', title: '6. Acceptable Use' },
  { id: 'ip', title: '7. Intellectual Property' },
  { id: 'termination', title: '8. Termination' },
  { id: 'liability', title: '9. Limitation of Liability' },
  { id: 'governing', title: '10. Governing Law' },
  { id: 'changes', title: '11. Changes to Terms' },
];

export default function Terms() {
  return (
    <div className="container max-w-4xl py-8 sm:py-12">
      <PageScaffold title="Terms of Service" description="Last updated: March 14, 2026 · Effective immediately">
        <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
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

          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">By accessing or using UpgraderCX services, you agree to be bound by these Terms of Service. UpgraderCX is a digital product marketplace offering subscription-based software and service accounts. All sales are final once delivery is confirmed unless stated otherwise in our Refund Policy.</p>
              </CardContent>
            </Card>

            <section id="acceptance" className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p className="text-sm text-muted-foreground">By creating an account, placing an order, or browsing UpgraderCX, you confirm that you are at least 18 years of age and agree to comply with these terms, our Privacy Policy, Acceptable Use Policy, and all applicable laws. If you do not agree, you must stop using the service immediately.</p>
            </section>

            <section id="accounts" className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">2. Account Responsibilities</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use a strong, unique password</li>
                  <li>Notify us immediately of unauthorized access</li>
                  <li>Do not share or resell your account unless you hold a reseller license</li>
                  <li>One account per individual — multi-accounting may result in suspension</li>
                  <li>Sharing purchased product credentials with unauthorized third parties is prohibited</li>
                </ul>
              </div>
            </section>

            <section id="products" className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">3. Products & Delivery</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>UpgraderCX sells digital product subscriptions and service accounts. All products are delivered digitally — there are no physical shipments. Delivery is typically instant (within minutes) after payment confirmation. Delivery timelines may vary for manual-fulfillment products, but we aim to deliver within 24 hours maximum.</p>
                <p>Product availability and stock are displayed on each product page. "∞" stock indicates unlimited availability. Products marked "On Hold" are temporarily unavailable.</p>
                <p><strong className="text-foreground">Product warranty periods</strong> vary by product and tier. The warranty duration is clearly displayed at time of purchase. Replacement or credit will be provided for products that fail within warranty, subject to our verification.</p>
              </div>
            </section>

            <section id="payments" className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">4. Payments & Pricing</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>All prices are listed in EUR (€) unless otherwise stated. We accept the following payment methods:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Credit / debit cards (Visa, Mastercard, AMEX)</li>
                  <li>Cryptocurrency (BTC, ETH, USDT, LTC)</li>
                  <li>Wallet balance (top-up via any accepted method)</li>
                </ul>
                <p>Payments are processed through secure, PCI-compliant gateways. Wallet balances are non-transferable and non-refundable. Prices may be adjusted at any time without prior notice; however, orders already placed will not be affected.</p>
              </div>
            </section>

            <section id="refunds" className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">5. Refunds & Replacements</h2>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Due to the digital nature of our products, all sales are considered final once the product credentials have been delivered. However, we offer:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong className="text-foreground">Replacement:</strong> If a product stops working within the warranty period, we will provide a free replacement</li>
                  <li><strong className="text-foreground">Credit:</strong> Store credit may be issued at our discretion for products that cannot be replaced</li>
                  <li><strong className="text-foreground">Refund:</strong> Only applicable if we fail to deliver the product within 72 hours of payment</li>
                </ul>
                <p>To request a refund or replacement, open a support ticket with your order ID and description of the issue. See our full <a href="/refund-policy" className="text-primary underline">Refund Policy</a> for details.</p>
              </div>
            </section>

            <section id="usage" className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">6. Acceptable Use</h2>
              <p className="text-sm text-muted-foreground">Products purchased through UpgraderCX are for personal use unless a reseller license is purchased. You agree not to use our platform or products for illegal activities, spamming, fraud, credential stuffing, or any activity that violates the terms of the underlying service provider. See our <a href="/acceptable-use" className="text-primary underline">Acceptable Use Policy</a>.</p>
            </section>

            <section id="ip" className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">7. Intellectual Property</h2>
              <p className="text-sm text-muted-foreground">All content, trademarks, branding, and technology on the UpgraderCX platform are owned by us or our licensors. Product names and logos belong to their respective owners. UpgraderCX is an independent marketplace and is not affiliated with, endorsed by, or sponsored by any of the brands whose products we sell.</p>
            </section>

            <section id="termination" className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">8. Termination</h2>
              <p className="text-sm text-muted-foreground">We reserve the right to suspend or terminate your account for violations of these terms, fraudulent activity, chargebacks, or abuse of the platform. You may close your account at any time via account settings. Upon termination, any remaining wallet balance will be forfeited unless a refund is authorized.</p>
            </section>

            <section id="liability" className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">9. Limitation of Liability</h2>
              <p className="text-sm text-muted-foreground">UpgraderCX is not liable for indirect, incidental, special, or consequential damages arising from use of our services or products. Our total liability is limited to the amount paid by you for the specific product or order in question. We do not guarantee uninterrupted access to third-party services delivered through our platform.</p>
            </section>

            <section id="governing" className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">10. Governing Law</h2>
              <p className="text-sm text-muted-foreground">These terms are governed by applicable international e-commerce law. Any disputes will be resolved through good-faith negotiation first, followed by binding arbitration if necessary.</p>
            </section>

            <section id="changes" className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">11. Changes to Terms</h2>
              <p className="text-sm text-muted-foreground">We may update these terms periodically. Material changes will be communicated via email or platform notification at least 7 days before taking effect. Continued use of the platform after changes take effect constitutes acceptance of the updated terms.</p>
            </section>
          </div>
        </div>
      </PageScaffold>
    </div>
  );
}
