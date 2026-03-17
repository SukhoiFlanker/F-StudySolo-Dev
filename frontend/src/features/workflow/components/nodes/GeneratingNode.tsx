'use client';

/**
 * GeneratingNode — A skeleton node showing that the AI is generating the workflow.
 * Uses the custom glassmorphism / paper aesthetic provided by the user.
 */
export default function GeneratingNode() {
  return (
    <div className="uv-browser-loader">
      <div className="uv-topbar">
        <div className="uv-dot" />
        <div className="uv-dot" />
        <div className="uv-dot" />
        <div className="uv-url" />
      </div>

      <div className="uv-body">
        {/* Shimmer skeleton rows */}
        <div className="uv-row uv-h1" />
        <div className="uv-row uv-short" />
        <div className="uv-row" />
        <div className="uv-row" />
        
        {/* Trace animation */}
        <div className="uv-trace" />

        {/* Loading text with animated ellipsis */}
        <div className="uv-loading">
          <span>AI is thinking</span>
          <span className="uv-ell">...</span>
        </div>
      </div>
    </div>
  );
}
