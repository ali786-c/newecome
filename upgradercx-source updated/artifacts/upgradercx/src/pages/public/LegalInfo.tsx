import { PageScaffold } from '@/components/PageScaffold';
import { SeoHead } from '@/components/shared/SeoHead';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Shield, Globe, Scale, HelpCircle, Users } from 'lucide-react';
import { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: 'Is this legal?',
    a: 'Yes. We purchase official family, team, or multi-seat plans directly from providers who explicitly allow multiple users. Each member receives their own private credentials on a legitimately purchased subscription. This is no different from sharing a family plan with household members — except we coordinate it for you.',
  },
  {
    q: 'How is this different from selling cracked or pirated software?',
    a: 'We do not distribute cracked software, unauthorized license keys, or hacked accounts. Every subscription is purchased through official channels at full retail price. We simply split the cost of multi-user plans across verified members, which is explicitly permitted by the providers\' terms of service.',
  },
  {
    q: 'What does "shared plan" mean exactly?',
    a: 'Many providers (Spotify, YouTube, Adobe, Microsoft, etc.) offer family or team plans that include multiple seats. We purchase these plans and allocate individual seats to our customers. You get your own login, your own profile, and your own private access — just at a lower cost because the plan fee is divided.',
  },
  {
    q: 'Will my account get banned?',
    a: 'No. Since we use official family/team seats, your access is fully authorized by the provider. In the unlikely event of any disruption, our replacement guarantee ensures you receive a new seat at no extra cost.',
  },
  {
    q: 'How do you handle payment processor compliance (Stripe, PayPal)?',
    a: 'We operate as a legitimate subscription management service. Our business model — purchasing multi-seat plans and allocating seats — is fully compliant with payment processor terms. We maintain transparent billing descriptors, clear product descriptions, and proper merchant category codes.',
  },
  {
    q: 'Do you have authorization from the brands you list?',
    a: 'We are an independent platform and are not affiliated with or endorsed by the brands listed. However, we use their products within the terms they set for multi-user plans. All trademarks belong to their respective owners.',
  },
  {
    q: 'What about regional pricing differences?',
    a: 'Some savings come from regional pricing — many providers offer lower subscription rates in certain markets. Purchasing plans in regions with lower pricing is legal and is a common practice for cost-conscious consumers. We combine regional pricing with multi-seat splitting for maximum savings.',
  },
  {
    q: 'What happens if a provider changes their family/team plan terms?',
    a: 'We continuously monitor provider policies. If terms change, we adapt our offering accordingly. If a service can no longer be shared compliantly, we discontinue it and offer affected customers a full refund or credit.',
  },
];

export default function LegalInfo() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="container max-w-4xl py-12">
      <SeoHead
        title="Is This Legal? — How Shared Plans Work | UpgraderCX"
        description="Learn how UpgraderCX provides legitimate access to premium subscriptions through authorized shared family and team plans."
        canonical="https://upgradercx.com/legal-info"
      />
      <PageScaffold title="Is This Legal?" description="Understanding our shared subscription model and why it's fully compliant">
        <div className="space-y-8">
          {/* Summary card */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-base font-bold text-foreground mb-1">Short Answer: Yes, It's Legal</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    UpgraderCX purchases official family, team, and multi-seat subscriptions from providers who explicitly support multiple users. We then allocate individual seats to verified members. Each customer receives their own private credentials on a legitimate, provider-authorized plan.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How it works visually */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> How the Model Works
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: Shield, title: 'Official Purchase', desc: 'We buy family/team plans at full retail price through official provider channels.' },
                { icon: Users, title: 'Seat Allocation', desc: 'Individual seats are assigned to verified members with private credentials.' },
                { icon: Globe, title: 'Cost Splitting', desc: 'The subscription cost is divided among members — everyone saves up to 80%.' },
              ].map((item) => (
                <Card key={item.title}>
                  <CardContent className="pt-5">
                    <item.icon className="h-5 w-5 text-primary mb-2" />
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Regional Pricing */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" /> Regional Pricing Explained
            </h2>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Many software and streaming providers set different subscription prices based on the user's country or region. This is known as <strong className="text-foreground">regional pricing</strong> or <strong className="text-foreground">purchasing power parity (PPP)</strong>.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  For example, a streaming service that costs €12.99/month in Europe might cost the equivalent of €3/month in another region. By purchasing plans in regions with lower pricing, we pass those savings on to you.
                </p>
                <div className="rounded-md border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Is regional pricing arbitrage legal?</strong> Yes. Purchasing a subscription in a region where the price is lower is not prohibited by law. Some providers may restrict this in their ToS for individual accounts, but family/team plans purchased and managed from a supported region remain valid.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Compliance pillars */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" /> Our Compliance Standards
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { title: 'Payment Processor Compliance', desc: 'Transparent billing descriptors, proper MCC codes, and clear product descriptions for Stripe/PayPal.' },
                { title: 'No Unauthorized Access', desc: 'We never distribute hacked accounts, cracked software, or stolen credentials.' },
                { title: 'Replacement Guarantee', desc: 'If any issue arises with your seat, we provide a free replacement — no questions asked.' },
                { title: 'Privacy Protection', desc: 'Each member gets individual credentials. We never share your data with other plan members.' },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-2.5 rounded-lg border bg-card p-3">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ accordion */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" /> Frequently Asked Questions
            </h2>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className="w-full text-left rounded-lg border bg-card transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between p-4">
                    <span className="text-sm font-semibold text-foreground pr-4">{item.q}</span>
                    <span className="text-muted-foreground shrink-0 text-xs">{openIndex === idx ? '−' : '+'}</span>
                  </div>
                  {openIndex === idx && (
                    <div className="px-4 pb-4 border-t pt-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Bottom disclaimer */}
          <Card className="border-muted">
            <CardContent className="pt-5">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                <strong className="text-foreground">Disclaimer:</strong> UpgraderCX is an independent platform and is not affiliated with, endorsed by, or sponsored by any of the brands listed on this website. All product names, logos, and trademarks are the property of their respective owners. The information on this page is provided for transparency and does not constitute legal advice.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageScaffold>
    </div>
  );
}
