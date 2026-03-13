"use client";
import { Component, ReactNode } from "react";

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return (
        this.props.fallback ?? (
          <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
            Something went wrong.{" "}
            <button
              className="ml-2 underline text-primary"
              onClick={() => this.setState({ hasError: false })}
            >
              Retry
            </button>
          </div>
        )
      );
    return this.props.children;
  }
}
