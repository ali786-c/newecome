import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, Copy, Check } from 'lucide-react';
import { authApi } from '@/api/auth.api';

interface TwoFactorSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (recoveryCodes: string[]) => void;
}

export function TwoFactorSetupModal({ isOpen, onClose, onSuccess }: TwoFactorSetupModalProps) {
    const { toast } = useToast();
    const [step, setStep] = useState<'loading' | 'setup' | 'confirm'>('loading');
    const [data, setData] = useState<{ secret: string; qr_code_url: string } | null>(null);
    const [code, setCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadSetup();
        } else {
            setStep('loading');
            setCode('');
        }
    }, [isOpen]);

    async function loadSetup() {
        try {
            const response = await authApi.setup2fa();
            setData(response.data);
            setStep('setup');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to initialize 2FA setup.', variant: 'destructive' });
            onClose();
        }
    }

    const handleCopySecret = () => {
        if (data?.secret) {
            navigator.clipboard.writeText(data.secret);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleConfirm = async () => {
        if (code.length !== 6) return;
        setVerifying(true);
        try {
            const response = await authApi.confirm2fa(code);
            toast({ title: 'Success', description: 'Two-factor authentication enabled!' });
            onSuccess(response.data.recovery_codes);
        } catch (error: any) {
            toast({
                title: 'Verification Failed',
                description: error.response?.data?.message || 'Invalid 2FA code.',
                variant: 'destructive'
            });
        } finally {
            setVerifying(false);
        }
    };

    const qrImageUrl = data?.qr_code_url
        ? `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=${encodeURIComponent(data.qr_code_url)}`
        : '';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Enable Two-Factor Authentication
                    </DialogTitle>
                    <DialogDescription>
                        Secure your account by adding an extra layer of security using Google Authenticator or Authy.
                    </DialogDescription>
                </DialogHeader>

                {step === 'loading' ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Initializing secure setup...</p>
                    </div>
                ) : (
                    <div className="space-y-6 py-4">
                        {step === 'setup' && (
                            <div className="space-y-4">
                                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border">
                                    {qrImageUrl && (
                                        <img src={qrImageUrl} alt="2FA QR Code" className="h-48 w-48" />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm font-medium">1. Scan the QR code</p>
                                    <p className="text-xs text-muted-foreground">
                                        Open your authenticator app and scan the image above. If you can't scan it, use the manual key:
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                                            {data?.secret}
                                        </code>
                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={handleCopySecret}>
                                            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-sm font-medium">2. Enter verification code</p>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="code">6-digit Authenticator Code</Label>
                                        <Input
                                            id="code"
                                            placeholder="000000"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            className="text-center tracking-[0.5em] font-mono text-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="sm:justify-between">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={verifying || code.length !== 6}
                        className="min-w-[100px]"
                    >
                        {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Activate 2FA
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
