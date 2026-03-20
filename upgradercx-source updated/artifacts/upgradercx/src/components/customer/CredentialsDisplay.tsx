import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Eye, EyeOff, Key } from 'lucide-react';

interface CredentialToken {
  code?: string;
  pin?: string;
  cardNumber?: string;
  pinCode?: string;
  expiry?: string;
  instructions?: string;
  [key: string]: any;
}

interface CredentialsDisplayProps {
  credentials: CredentialToken[] | any;
  productName?: string;
}

export function CredentialsDisplay({ credentials, productName }: CredentialsDisplayProps) {
  const [showPass, setShowPass] = useState(false);
  const { toast } = useToast();

  if (!credentials) return null;

  const credsArray = Array.isArray(credentials) ? credentials : [credentials];

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 px-1">
        <Key className="h-3.5 w-3.5 text-primary" />
        {productName ? `${productName} Access` : 'Access Credentials'}
      </p>

      {credsArray.map((token, idx) => (
        <div key={idx} className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3 shadow-sm">
          {(token.code || token.cardNumber) && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground font-medium">License / Code</span>
              <div className="flex items-center gap-1.5 overflow-hidden">
                <code className="text-xs font-mono text-foreground bg-background px-2.5 py-1.5 rounded border shadow-sm truncate max-w-[150px] sm:max-w-none">
                  {token.code || token.cardNumber}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 shrink-0 hover:bg-primary/10 hover:text-primary" 
                  onClick={() => { 
                    const codeToCopy = token.code || token.cardNumber || '';
                    navigator.clipboard.writeText(codeToCopy); 
                    toast({ title: 'Code Copied!' }); 
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {(token.pin || token.pinCode) && (
            <div className="flex items-center justify-between gap-4 border-t border-primary/10 pt-3">
              <span className="text-xs text-muted-foreground font-medium">Security PIN</span>
              <div className="flex items-center gap-1.5">
                <code className="text-xs font-mono text-foreground tracking-wider font-bold">
                  {showPass ? (token.pin || token.pinCode) : '••••'}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary" 
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-primary/10 hover:text-primary" 
                  onClick={() => { 
                    const pinToCopy = token.pin || token.pinCode || '';
                    navigator.clipboard.writeText(pinToCopy); 
                    toast({ title: 'PIN Copied!' }); 
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {token.expiry && (
            <div className="border-t border-primary/10 pt-2 flex justify-end">
               <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground border-muted">
                Expires: {new Date(token.expiry).toLocaleDateString()}
              </Badge>
            </div>
          )}

          {token.instructions && (
            <div className="mt-2 text-[10px] text-muted-foreground bg-white/40 dark:bg-black/20 p-2.5 rounded italic leading-normal border border-dashed border-primary/10">
              <span className="font-bold not-italic block mb-0.5 text-foreground/70">Instructions:</span>
              {token.instructions}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
