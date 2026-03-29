'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catch-all ErrorBoundary for critical layout components.
 * Prevents a single failing child (e.g. AuthSessionBridge) from
 * crashing the entire page with a white screen.
 */
export class SafeErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      '[SafeErrorBoundary] Component tree crashed:',
      error.message,
      errorInfo.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
