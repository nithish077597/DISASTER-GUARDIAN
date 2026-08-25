import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Catches any uncaught runtime error in the component tree below it and
 * shows a friendly recovery screen instead of a white/blank page.
 *
 * Usage: wrap the app (or any subtree) once:
 *   <ErrorBoundary><App /></ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Surface in console for debugging without breaking the UI
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { error } = this.state;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-slate-900 border border-red-500/30 rounded-3xl shadow-2xl shadow-red-950/40 p-8 space-y-5 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-extrabold uppercase tracking-wider">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-400">
              An unexpected error occurred on this screen. Your data is safe &mdash;
              try reloading or going back to the dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={this.handleReload}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload App
            </button>
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <Home className="w-4 h-4" />
              Try Again
            </button>
          </div>

          {error && (
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={this.toggleDetails}
                className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
              >
                {this.state.showDetails ? (
                  <>
                    Hide technical details <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Show technical details <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
              {this.state.showDetails && (
                <pre className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-left text-[11px] leading-relaxed text-red-300 overflow-auto max-h-48 whitespace-pre-wrap break-words">
                  {error.message}
                  {'\n\n'}
                  {error.stack || ''}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
