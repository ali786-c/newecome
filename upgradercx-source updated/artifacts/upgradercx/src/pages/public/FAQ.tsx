import { PageScaffold } from '@/components/PageScaffold';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const faqs = [
  { q: 'How does delivery work?', a: 'Most products are delivered automatically within minutes of payment confirmation. You will receive your product credentials via email and in your account dashboard. Some products may require manual delivery (up to 24 hours max).' },
  { q: 'What payment methods do you accept?', a: 'We accept credit/debit cards (Visa, Mastercard, AMEX), cryptocurrency (BTC, ETH, USDT, LTC), and wallet balance. You can top up your wallet using any of these methods.' },
  { q: 'Can I get a refund?', a: 'Due to the digital nature of our products, all sales are final once credentials are delivered. However, we offer free replacements within the warranty period if a product stops working, and store credit when replacements are not possible. See our Refund Policy for full details.' },
  { q: 'How long do the subscriptions last?', a: 'Each product page shows the subscription duration clearly. Most products offer multiple tiers (e.g., 6 months, 12 months). The warranty period is included in the product listing.' },
  { q: 'Do you offer reseller pricing?', a: 'Yes! We offer a dedicated reseller package with volume discounts. Check our UpgraderCX Reseller product or contact us via Telegram/Discord for custom bulk pricing.' },
  { q: 'What if my product stops working?', a: 'Open a support ticket with your order ID and a description of the issue. If the product is within warranty, we will provide a free replacement. Our support team is available 24/7 via Telegram, Discord, and email.' },
  { q: 'Is my data secure?', a: 'Absolutely. We use PCI-DSS compliant payment processing, TLS 1.3 encryption for all connections, and GDPR-compliant data handling. Card data never touches our servers.' },
  { q: 'How do I contact support?', a: 'You can reach us 24/7 through: Telegram (@upgradercx), Discord (discord.gg/kNfrGy5gFD), email (support@upgradercx.com), or by opening a ticket on our Contact page.' },
  { q: 'What does Starting at mean?', a: 'Products showing Starting at have multiple pricing tiers (e.g., different subscription lengths). Click the product to see all available options and choose the one that fits your needs.' },
  { q: 'What does infinite Stock mean?', a: 'Unlimited stock — the product is always available for purchase. We maintain a continuous supply so you can buy anytime without worrying about availability.' },
];

export default function FAQ() {
  return (
    <div className="container max-w-3xl py-8 sm:py-12">
      <PageScaffold title="Frequently Asked Questions" description="Find answers to common questions about our products and services.">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Card className="mt-8">
          <CardContent className="pt-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <MessageSquare className="h-8 w-8 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground">Still have questions?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Our support team is available 24/7 via{' '}
                <a href="https://t.me/upgradercx" target="_blank" rel="noopener noreferrer" className="text-primary underline">Telegram</a>,{' '}
                <a href="https://discord.gg/kNfrGy5gFD" target="_blank" rel="noopener noreferrer" className="text-primary underline">Discord</a>, or{' '}
                <Link to="/contact" className="text-primary underline">open a ticket</Link>.
              </p>
            </div>
          </CardContent>
        </Card>
      </PageScaffold>
    </div>
  );
}
