import { useState } from 'react';
import { PageScaffold } from '@/components/PageScaffold';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Globe, CreditCard, Bot, Shield, Palette, Bell, Wrench, Mail, Lock, QrCode, Key, AlertTriangle } from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();

  /* General */
  const [siteName, setSiteName] = useState('UpgraderCX');
  const [supportEmail, setSupportEmail] = useState('support@upgradercx.com');
  const [currency, setCurrency] = useState('EUR');
  const [defaultMarkup, setDefaultMarkup] = useState('30');

  /* Links */
  const [telegramLink, setTelegramLink] = useState('https://t.me/upgradercx');
  const [discordLink, setDiscordLink] = useState('https://discord.gg/kNfrGy5gFD');
  const [telegramBot, setTelegramBot] = useState('');
  const [discordWebhook, setDiscordWebhook] = useState('');

  /* Toggles */
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [autoDelivery, setAutoDelivery] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [priceApprovalGate, setPriceApprovalGate] = useState(true);
  const [cookieConsent, setCookieConsent] = useState(true);

  /* SEO */
  const [metaTitle, setMetaTitle] = useState('UpgraderCX — Premium Shared Subscriptions');
  const [metaDescription, setMetaDescription] = useState('Access premium software, streaming, AI tools & VPN through authorized shared plans. Save up to 80%.');

  const handleSave = () => {
    toast({ title: 'Settings saved', description: 'All changes have been applied.' });
  };

  return (
    <PageScaffold title="Admin Settings" description="Platform configuration, integrations, and preferences.">
      <div className="space-y-6 max-w-2xl">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> General</CardTitle>
            <CardDescription>Basic platform configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Support Email</Label>
                <Input type="email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Markup (%)</Label>
                <Input type="number" min={0} max={100} value={defaultMarkup} onChange={(e) => setDefaultMarkup(e.target.value)} />
                <p className="text-[10px] text-muted-foreground">Applied to supplier import prices</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> Community & Integrations</CardTitle>
            <CardDescription>Telegram, Discord, and bot configuration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Telegram Community Link</Label>
                <Input value={telegramLink} onChange={(e) => setTelegramLink(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Discord Invite Link</Label>
                <Input value={discordLink} onChange={(e) => setDiscordLink(e.target.value)} />
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">Bot tokens are managed via Laravel .env — these fields are for reference only (read from API).</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Telegram Bot Token</Label>
                <Input type="password" placeholder="Set in Laravel .env" value={telegramBot} onChange={(e) => setTelegramBot(e.target.value)} disabled />
              </div>
              <div className="space-y-2">
                <Label>Discord Webhook URL</Label>
                <Input type="password" placeholder="Set in Laravel .env" value={discordWebhook} onChange={(e) => setDiscordWebhook(e.target.value)} disabled />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Wrench className="h-4 w-4" /> Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Maintenance Mode</p>
                <p className="text-xs text-muted-foreground">Show maintenance page to non-admin visitors</p>
              </div>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Open Registration</p>
                <p className="text-xs text-muted-foreground">Allow new customer registrations</p>
              </div>
              <Switch checked={registrationOpen} onCheckedChange={setRegistrationOpen} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto Delivery</p>
                <p className="text-xs text-muted-foreground">Automatically deliver digital products after payment</p>
              </div>
              <Switch checked={autoDelivery} onCheckedChange={setAutoDelivery} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Price Approval Gate</p>
                <p className="text-xs text-muted-foreground">Require admin approval for price changes {'>'} 20%</p>
              </div>
              <Switch checked={priceApprovalGate} onCheckedChange={setPriceApprovalGate} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Cookie Consent Banner</p>
                <p className="text-xs text-muted-foreground">Show GDPR cookie consent to visitors</p>
              </div>
              <Switch checked={cookieConsent} onCheckedChange={setCookieConsent} />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Send order confirmation and status emails</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> SEO & Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default Meta Title</Label>
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Default Meta Description</Label>
              <Textarea rows={2} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Email Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> Email Delivery (SMTP)</CardTitle>
            <CardDescription>Configure the email server for order confirmations, delivery notifications, and alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>SMTP Host</Label>
                <Input placeholder="smtp.sendgrid.net" defaultValue="smtp.sendgrid.net" />
              </div>
              <div className="space-y-1.5">
                <Label>Port</Label>
                <Input type="number" placeholder="587" defaultValue="587" />
              </div>
              <div className="space-y-1.5">
                <Label>Username / API Key</Label>
                <Input placeholder="apikey" />
              </div>
              <div className="space-y-1.5">
                <Label>Password / Secret</Label>
                <Input type="password" placeholder="SG.xxxxxxxx..." />
              </div>
              <div className="space-y-1.5">
                <Label>From Name</Label>
                <Input placeholder="UpgraderCX" defaultValue="UpgraderCX" />
              </div>
              <div className="space-y-1.5">
                <Label>From Email</Label>
                <Input placeholder="noreply@upgradercx.com" defaultValue="noreply@upgradercx.com" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({ title: 'Test email sent!', description: 'Check support@upgradercx.com inbox.' })}>
                Send Test Email
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-medium">Email Templates</Label>
              <div className="grid gap-2 text-sm">
                {[
                  { label: 'Order Confirmation', enabled: true },
                  { label: 'Delivery Notification', enabled: true },
                  { label: 'Subscription Renewal Reminder', enabled: true },
                  { label: 'Abandoned Cart Recovery', enabled: false },
                  { label: 'Refund Processed', enabled: true },
                  { label: 'Referral Commission Paid', enabled: true },
                ].map((t) => (
                  <div key={t.label} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-sm text-foreground">{t.label}</span>
                    <Switch defaultChecked={t.enabled} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2FA / MFA */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Two-Factor Authentication (2FA)</CardTitle>
            <CardDescription>Require admin accounts to verify identity with a second factor.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enforce 2FA for all admins</p>
                <p className="text-xs text-muted-foreground">Admins without 2FA set up will be prompted on next login.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <p className="text-sm font-medium">Allowed 2FA Methods</p>
              {[
                { label: 'Authenticator App (TOTP — Google Auth, Authy)', icon: <QrCode className="h-4 w-4" />, enabled: true },
                { label: 'Email OTP (6-digit code)', icon: <Mail className="h-4 w-4" />, enabled: true },
                { label: 'Backup Codes', icon: <Key className="h-4 w-4" />, enabled: true },
              ].map((m) => (
                <div key={m.label} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="flex items-center gap-2">
                    {m.icon}
                    <span className="text-sm text-foreground">{m.label}</span>
                  </div>
                  <Switch defaultChecked={m.enabled} />
                </div>
              ))}
            </div>
            <Separator />
            <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>Your account does not have 2FA enabled. <button className="underline font-medium">Set up now →</button></p>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Session Timeout (minutes)</Label>
              <Input type="number" defaultValue="60" className="max-w-[120px]" />
              <p className="text-xs text-muted-foreground">Admin sessions expire after this period of inactivity.</p>
            </div>
          </CardContent>
        </Card>

        {/* Renewal Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Subscription Renewal Reminders</CardTitle>
            <CardDescription>Automatically email customers before their subscription expires.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: '7 days before expiry', enabled: true },
              { label: '3 days before expiry', enabled: true },
              { label: '1 day before expiry',  enabled: true },
              { label: 'Day of expiry',        enabled: false },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between rounded-md border px-3 py-2.5">
                <span className="text-sm text-foreground">{r.label}</span>
                <Switch defaultChecked={r.enabled} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Abandoned Cart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Abandoned Cart Recovery</CardTitle>
            <CardDescription>Email logged-in customers who leave items in their cart without purchasing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Enable abandoned cart emails</p>
                <p className="text-xs text-muted-foreground">Requires customer to be logged in and have a cart.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First reminder (hours after abandon)</Label>
                <Input type="number" defaultValue="1" />
              </div>
              <div className="space-y-1.5">
                <Label>Second reminder (hours after abandon)</Label>
                <Input type="number" defaultValue="24" />
              </div>
              <div className="space-y-1.5">
                <Label>Discount offer (%)</Label>
                <Input type="number" defaultValue="10" />
              </div>
              <div className="space-y-1.5">
                <Label>Discount code prefix</Label>
                <Input defaultValue="CART" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="gap-1.5">
          <Save className="h-4 w-4" /> Save All Settings
        </Button>
      </div>
    </PageScaffold>
  );
}
