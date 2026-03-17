'use client';

/**
 * NodeSkeleton — hand-drawn paper skeleton loading placeholder for workflow nodes.
 * Shows a paper card with shimmer lines matching the notebook aesthetic.
 *
 * Reusable across all node types via dynamic import fallback.
 */
export default function NodeSkeleton() {
  return (
    <div className="wf-node-skeleton node-paper-bg">
      {/* Header shimmer */}
      <div className="wf-skel-header">
        <div className="wf-skel-tag wf-skel-shimmer" />
        <div className="wf-skel-badge wf-skel-shimmer" />
      </div>

      {/* Title area */}
      <div className="wf-skel-title wf-skel-shimmer" />
      <div className="wf-skel-subtitle wf-skel-shimmer" />

      {/* Divider (dashed line) */}
      <hr className="wf-skel-divider" />

      {/* Body lines */}
      <div className="wf-skel-line wf-skel-shimmer" style={{ width: '88%' }} />
      <div className="wf-skel-line wf-skel-shimmer" style={{ width: '72%', animationDelay: '0.15s' }} />
      <div className="wf-skel-line wf-skel-shimmer" style={{ width: '60%', animationDelay: '0.3s' }} />

      {/* Trace bar at bottom */}
      <div className="wf-skel-trace">
        <div className="wf-skel-trace-bar" />
      </div>

      {/* Loading text */}
      <div className="wf-skel-loading">
        <span className="wf-skel-loading-text">loading</span>
        <span className="wf-skel-dots">…</span>
      </div>
    </div>
  );
}
