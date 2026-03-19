import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MailOpen, Loader2, CheckCircle2 } from 'lucide-react';

export default function EmailVerification() {
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setIsResending(true);
    // TODO: call Laravel POST /auth/email/resend
    await new Promise((r) => setTimeout(r, 1000));
    setResent(true);
    setIsResending(false);
  };

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <MailOpen className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">Verify your email</CardTitle>
        <CardDescription className="leading-relaxed">
          We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground space-y-2">
          <p>Didn't receive the email? Check your spam folder or click below to resend.</p>
        </div>

        {resent && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Verification email resent successfully.
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button variant="outline" className="w-full" onClick={handleResend} disabled={isResending || resent}>
          {isResending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {resent ? 'Email Sent' : 'Resend Verification Email'}
        </Button>
        <Link to="/login" className="text-sm text-primary hover:underline">Back to login</Link>
      </CardFooter>
    </Card>
  );
}
