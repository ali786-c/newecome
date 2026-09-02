import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageSquare, Clock, Shield, CheckCircle2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { contactSchema } from '@/lib/schemas/contact.schema';
import { z } from 'zod';

const SUBJECTS = [
  { value: 'order', label: 'Order Issue' },
  { value: 'delivery', label: 'Delivery Problem' },
  { value: 'refund', label: 'Refund Request' },
  { value: 'account', label: 'Account Issue' },
  { value: 'billing', label: 'Billing & Payments' },
  { value: 'reseller', label: 'Bulk / Reseller Inquiry' },
  { value: 'general', label: 'General Question' },
  { value: 'abuse', label: 'Report Abuse' },
];

export default function Contact() {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', orderId: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast({ title: 'Validation error', description: 'Please fix the highlighted fields.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    // POST /api/support/tickets — Laravel
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="container max-w-lg py-16 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-xl font-bold text-foreground">Ticket Submitted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We've received your request and will get back to you within 24 hours.
          You'll receive a confirmation email at <strong className="text-foreground">{form.email}</strong>.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Ticket reference: <strong className="text-foreground">#{Date.now().toString(36).toUpperCase()}</strong>
        </p>
        <Button className="mt-6" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', orderId: '', subject: '', message: '' }); setErrors({}); }}>
          Submit Another Ticket
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8 sm:py-12">
      <PageScaffold title="Open a Support Ticket" description="Describe your issue and we'll get back to you quickly.">
        <div className="grid gap-8 md:grid-cols-[1fr_280px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Send className="h-4 w-4" /> Submit a Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={errors.name ? 'border-destructive' : ''} />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={errors.email ? 'border-destructive' : ''} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                      <SelectTrigger className={errors.subject ? 'border-destructive' : ''}><SelectValue placeholder="Select a topic" /></SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID (optional)</Label>
                    <Input id="orderId" placeholder="#ORD-XXXX" value={form.orderId} onChange={(e) => setForm({ ...form, orderId: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" placeholder="Describe your issue in detail..." rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={errors.message ? 'border-destructive' : ''} />
                  {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Card>
              <CardContent className="pt-5 flex items-start gap-3">
                <MessageSquare className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Live Chat</h3>
                  <p className="text-xs text-muted-foreground">24/7 via Telegram & Discord</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 flex items-start gap-3">
                <Mail className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Email</h3>
                  <p className="text-xs text-muted-foreground">support@upgradercx.com</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 flex items-start gap-3">
                <Clock className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Response Time</h3>
                  <p className="text-xs text-muted-foreground">Usually under 1 hour</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5 flex items-start gap-3">
                <Shield className="h-6 w-6 text-primary shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Security</h3>
                  <p className="text-xs text-muted-foreground">security@upgradercx.com</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageScaffold>
    </div>
  );
}
