"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class CameraErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-black p-6 text-center text-white">
          <h2 className="text-lg font-semibold">Camera unavailable</h2>
          <p className="max-w-sm text-sm text-white/60">
            {this.state.message ||
              "The camera could not start. Check permissions and reload."}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, message: "" })}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
