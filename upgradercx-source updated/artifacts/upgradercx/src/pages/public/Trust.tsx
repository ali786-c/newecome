import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Server, FileCheck, AlertTriangle, Users, Clock, Star, Package, ShoppingBag, Award } from 'lucide-react';

const STATS = [
  { icon: ShoppingBag, value: '254+', label: 'Products Sold' },
  { icon: Star, value: '5/5', label: 'Average Rating' },
  { icon: Users, value: '120+', label: 'Active Customers' },
  { icon: Clock, value: '<5 min', label: 'Avg. Delivery Time' },
  { icon: Package, value: '48+', label: 'Products Available' },
  { icon: Award, value: '2024', label: 'Operating Since' },
];

const TRUST_CARDS = [
  { icon: Shield, title: 'Data Protection', desc: 'GDPR-compliant data handling with encrypted storage at rest and TLS 1.3 in transit across all connections.' },
  { icon: Lock, title: 'Secure Payments', desc: 'PCI-DSS compliant payment processing. We accept crypto (BTC, ETH, USDT, LTC), cards, and wallet balance. Card data never touches our servers.' },
  { icon: Eye, title: 'Transparency', desc: 'Full order history, real-time delivery status, and a public feedback page with verified purchase reviews.' },
  { icon: Server, title: 'Reliable Infrastructure', desc: '99.9% uptime with automated monitoring, daily encrypted backups, and instant failover for uninterrupted service.' },
  { icon: Users, title: 'Verified Reviews', desc: 'All reviews on our feedback page come from verified purchases. We never remove negative reviews — transparency is our priority.' },
  { icon: Clock, title: '24/7 Support', desc: 'Real human support available around the clock via Telegram, Discord, and our ticket system. Average response time under 1 hour.' },
];

const certifications = [
  { name: 'PCI-DSS Compliant', status: 'Active' },
  { name: 'GDPR Compliant', status: 'Active' },
  { name: 'SSL/TLS Secured', status: 'Active' },
  { name: 'Cloudflare Protected', status: 'Active' },
];

export default function Trust() {
  return (
    <div className="container max-w-4xl py-8 sm:py-12">
      <PageScaffold title="Trusted Advisor" description="Why thousands of customers trust UpgraderCX for their digital needs.">
        <div className="space-y-10">

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {STATS.map((s) => (
              <Card key={s.label}>
                <CardContent className="pt-5 pb-4 text-center">
                  <s.icon className="mx-auto h-6 w-6 text-primary" />
                  <p className="mt-2 text-lg font-extrabold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Entrepreneur badge */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Award className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Independent Entrepreneur</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  UpgraderCX is built and operated by an independent entrepreneur committed to quality, speed, and customer satisfaction. Every product is personally verified before listing, and every support ticket gets a real human response.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security overview */}
          <div className="grid gap-4 sm:grid-cols-2">
            {TRUST_CARDS.map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-6">
                  <item.icon className="h-7 w-7 text-primary" />
                  <h3 className="mt-3 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Certifications */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><FileCheck className="h-5 w-5 text-primary" /> Security & Compliance</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {certifications.map((cert) => (
                <Card key={cert.name}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{cert.name}</span>
                    <Badge variant={cert.status === 'Active' ? 'default' : 'secondary'}>{cert.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Report */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-primary" /> Report a Vulnerability</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">We welcome responsible security disclosures. If you discover a vulnerability, please email <strong className="text-foreground">security@upgradercx.com</strong> with details. We commit to acknowledging reports within 24 hours and providing updates within 72 hours.</p>
              </CardContent>
            </Card>
          </section>
        </div>
      </PageScaffold>
    </div>
  );
}
