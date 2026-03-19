import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center space-y-4">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              An unexpected error occurred. You can try again or reload the page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 max-h-32 overflow-auto rounded-md bg-muted p-3 text-left text-xs text-destructive">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={this.handleRetry} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" /> Try Again
              </Button>
              <Button onClick={this.handleReload}>Reload Page</Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
