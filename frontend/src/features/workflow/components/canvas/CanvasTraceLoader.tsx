'use client';

/**
 * WorkflowCanvasLoader — hand-drawn circuit-trace loading animation for the canvas.
 * Shown during ReactFlow initialization / data fetch.
 *
 * Reusable: import and render while `isLoading` is true.
 */
export default function CanvasTraceLoader() {
  return (
    <div className="wf-trace-loader">
      <svg
        className="wf-trace-svg"
        viewBox="0 0 460 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── Background traces (hand-drawn wiggly paths) ── */}
        <path
          className="wf-trace-bg"
          d="M30 90 Q60 88 90 90 Q120 92 150 90 L190 90 Q200 90 200 80 L200 50 Q200 40 210 40 L310 40 Q320 40 320 50 L320 80 Q320 90 330 90 L430 90"
        />
        <path
          className="wf-trace-bg"
          d="M30 50 Q50 48 80 50 L140 50 Q150 50 150 60 L150 130 Q150 140 160 140 L290 140 Q300 140 300 130 L300 110 Q300 100 310 100 L430 100"
        />
        <path
          className="wf-trace-bg"
          d="M30 140 Q55 142 90 140 L120 140 Q130 140 130 130 L130 60 Q130 50 140 48 L180 48 Q190 48 190 58 L190 120 Q190 130 200 130 L430 130"
        />

        {/* ── Animated flow traces ── */}
        <path
          className="wf-trace-flow wf-trace-ink"
          d="M30 90 Q60 88 90 90 Q120 92 150 90 L190 90 Q200 90 200 80 L200 50 Q200 40 210 40 L310 40 Q320 40 320 50 L320 80 Q320 90 330 90 L430 90"
        />
        <path
          className="wf-trace-flow wf-trace-ink"
          d="M30 50 Q50 48 80 50 L140 50 Q150 50 150 60 L150 130 Q150 140 160 140 L290 140 Q300 140 300 130 L300 110 Q300 100 310 100 L430 100"
          style={{ animationDelay: '0.6s' }}
        />
        <path
          className="wf-trace-flow wf-trace-ink"
          d="M30 140 Q55 142 90 140 L120 140 Q130 140 130 130 L130 60 Q130 50 140 48 L180 48 Q190 48 190 58 L190 120 Q190 130 200 130 L430 130"
          style={{ animationDelay: '1.2s' }}
        />

        {/* ── Node chip placeholders (hand-drawn rectangles) ── */}
        <rect className="wf-chip-body" x="14" y="36" width="32" height="28" rx="4" ry="4" />
        <rect className="wf-chip-body" x="14" y="76" width="32" height="28" rx="4" ry="4" />
        <rect className="wf-chip-body" x="14" y="126" width="32" height="28" rx="4" ry="4" />
        <rect className="wf-chip-body" x="414" y="76" width="32" height="28" rx="4" ry="4" />

        {/* ── Pin dots ── */}
        <circle className="wf-chip-pin" cx="255" cy="40" r="3" />
        <circle className="wf-chip-pin" cx="225" cy="140" r="3" />
        <circle className="wf-chip-pin" cx="305" cy="100" r="3" />

        {/* ── Center label ── */}
        <text
          className="wf-chip-text"
          x="230"
          y="94"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          initializing…
        </text>
      </svg>
    </div>
  );
}
