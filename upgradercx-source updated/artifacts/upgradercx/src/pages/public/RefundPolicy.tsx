import { PageScaffold } from '@/components/PageScaffold';
import { SeoHead } from '@/components/shared/SeoHead';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Clock, CheckCircle, XCircle, Shield } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="container max-w-4xl py-12">
      <SeoHead
        title="Refund Policy — UpgraderCX"
        description="Our refund policy for shared subscription plans. Learn when you're eligible for a refund or replacement."
        canonical="https://upgradercx.com/refund-policy"
      />
      <PageScaffold title="Refund Policy" description="Last updated: March 15, 2025 · Effective immediately">
        <div className="space-y-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                We want you to be satisfied with every purchase. Because our products are seats on shared family or team subscriptions, refund eligibility depends on the nature of the issue. This policy explains when and how you can request a refund or replacement.
              </p>
            </CardContent>
          </Card>

          {/* Replacement-first guarantee */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-bold text-foreground mb-1">Replacement-First Guarantee</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    If your shared plan seat stops working for any reason, we will provide a free replacement before considering a refund. Most issues are resolved with a new seat within minutes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border-success/20">
              <CardContent className="pt-6">
                <CheckCircle className="h-6 w-6 text-success" />
                <h3 className="mt-2 font-semibold text-foreground">Eligible for Refund</h3>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Undelivered orders within 48 hours</li>
                  <li>Seat that cannot be replaced after 2 attempts</li>
                  <li>Duplicate charges or billing errors</li>
                  <li>Service permanently discontinued by provider</li>
                  <li>Subscription not matching advertised features</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-destructive/20">
              <CardContent className="pt-6">
                <XCircle className="h-6 w-6 text-destructive" />
                <h3 className="mt-2 font-semibold text-foreground">Not Eligible</h3>
                <ul className="mt-2 text-sm text-muted-foreground space-y-1 list-disc pl-4">
                  <li>Successfully delivered and activated seats</li>
                  <li>Requests after 48-hour window</li>
                  <li>Buyer's remorse or change of mind</li>
                  <li>Account violations or misuse leading to suspension</li>
                  <li>Issues caused by customer's device or network</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><Clock className="h-5 w-5 text-primary" /> Refund Process</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <ol className="list-decimal pl-6 space-y-2">
                <li><strong className="text-foreground">Report the issue</strong> — contact support on Telegram, Discord, or through your dashboard. Include your order ID.</li>
                <li><strong className="text-foreground">Replacement attempt</strong> — we'll provide a new seat at no cost. Most issues are resolved at this step.</li>
                <li><strong className="text-foreground">Refund review</strong> — if replacement fails, our team reviews the refund request within 24 hours.</li>
                <li><strong className="text-foreground">Resolution</strong> — approved refunds are credited to your wallet within 1–3 business days, or to your original payment method within 5–10 business days.</li>
              </ol>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary" /> Chargebacks & Disputes</h2>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>
                We strongly encourage you to contact our support team before initiating a chargeback with your bank or payment provider. Chargebacks filed without prior contact may result in account suspension.
              </p>
              <p>
                If you disagree with a refund decision, you may escalate by emailing <strong className="text-foreground">disputes@upgradercx.com</strong> with your order ID. We aim to resolve all disputes within 7 business days.
              </p>
            </div>
          </section>

          <Card className="border-muted">
            <CardContent className="pt-5">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Note:</strong> Our products are seats on shared family/team subscriptions. Because access is activated immediately upon delivery, digital products are generally non-refundable under EU consumer protection law (Directive 2011/83/EU, Article 16(m)). We go beyond legal requirements by offering our replacement guarantee.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageScaffold>
    </div>
  );
}
