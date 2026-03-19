import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

const CONSENT_KEY = 'ucx_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-lg animate-fade-in">
      <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">We use cookies</p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept", you consent to our use of cookies. Read our{' '}
              <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" className="text-xs" onClick={handleDecline}>
            Decline
          </Button>
          <Button size="sm" className="text-xs" onClick={handleAccept}>
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
