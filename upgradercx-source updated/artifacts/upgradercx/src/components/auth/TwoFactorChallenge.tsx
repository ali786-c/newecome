import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/api/auth.api';

interface TwoFactorChallengeProps {
    email: string;
    onSuccess: (data: any) => void;
    onCancel: () => void;
}

export function TwoFactorChallenge({ email, onSuccess, onCancel }: TwoFactorChallengeProps) {
    const { toast } = useToast();
    const [code, setCode] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [useRecovery, setUseRecovery] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.length < 6) return;

        setIsVerifying(true);
        try {
            const response = await authApi.verify2fa(email, code);
            onSuccess(response.data);
        } catch (error: any) {
            toast({
                title: 'Verification Failed',
                description: error.response?.data?.message || 'Invalid 2FA code.',
                variant: 'destructive'
            });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center space-y-1">
                <div className="flex justify-center mb-2">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">Two-Factor Auth</CardTitle>
                <CardDescription>
                    {useRecovery
                        ? 'Enter one of your emergency recovery codes.'
                        : 'Enter the 6-digit code from your authenticator app.'}
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="2fa-code">{useRecovery ? 'Recovery Code' : 'Authentication Code'}</Label>
                        <Input
                            id="2fa-code"
                            placeholder={useRecovery ? 'XXXXX-XXXXX' : '000000'}
                            value={code}
                            onChange={(e) => setCode(useRecovery ? e.target.value : e.target.value.replace(/\D/g, '').slice(0, 6))}
                            className="text-center tracking-widest font-mono text-lg"
                            autoFocus
                            autoComplete="one-time-code"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => { setUseRecovery(!useRecovery); setCode(''); }}
                        className="text-xs text-primary hover:underline w-full text-center"
                    >
                        {useRecovery ? 'Use authenticator app instead' : 'Lost access? Use a recovery code'}
                    </button>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    <Button type="submit" className="w-full" disabled={isVerifying || code.length < (useRecovery ? 8 : 6)}>
                        {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify & Sign In
                    </Button>
                    <Button type="button" variant="ghost" className="w-full" onClick={onCancel} disabled={isVerifying}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
