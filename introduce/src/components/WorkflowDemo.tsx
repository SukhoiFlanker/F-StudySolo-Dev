import { useState, useEffect, useRef } from 'react';
import { useInView } from '../hooks/useInView';

/* DAG execution steps based on real system architecture */
const DAG_STEPS = [
  {
    id: 'trigger',
    label: 'trigger_input',
    type: 'INPUT',
    color: '#00ff88',
    desc: '接收自然语言学习目标，解析 constraint 参数',
    output: '{ goal: "学习华科大学", depth: 4, style: "summary" }',
    lines: ['Parsing user intent...', 'Extracting constraints...', 'Building context payload...', 'DONE ✓'],
    duration: '12ms',
  },
  {
    id: 'analyzer',
    label: 'ai_analyzer',
    type: 'AI',
    color: '#00d4ff',
    desc: '调用 DeepSeek-V3 进行学习目标意图分析',
    output: '{ chapters: 6, topics: ["起源","建设","科研","荣誉"...], style: "academic" }',
    lines: ['→ DeepSeek-V3 API call', 'Streaming response...', 'Parsing structured output...', 'DONE ✓'],
    duration: '841ms',
  },
  {
    id: 'outline',
    label: 'outline_gen',
    type: 'AI',
    color: '#7c3aed',
    desc: '生成包含 4-8 个高质量章节的学习大纲',
    output: '{ outline: [...6 chapters with subtopics...], word_target: 12000 }',
    lines: ['Activating Qwen-MAX...', 'Generating structured outline...', 'Validating chapter depth...', 'DONE ✓'],
    duration: '1.2s',
  },
  {
    id: 'parallel_exec',
    label: '⎇ parallel_group',
    type: 'PARALLEL',
    color: '#ff6b35',
    desc: '并行组：为每个章节同时启动内容推导任务',
    output: '6 concurrent tasks spawned → [task_0, task_1, task_2, task_3, task_4, task_5]',
    lines: ['Spawning 6 parallel tasks...', 'Line 1: RUNNING...', 'Line 2: RUNNING...', 'Joining all results...', 'DONE ✓'],
    duration: '3.4s (parallel)',
  },
  {
    id: 'flashcard',
    label: 'flashcard_pkg',
    type: 'PROCESSING',
    color: '#00d4ff',
    desc: '从各章节内容提取关键概念，构建记忆闪卡包',
    output: '[{ front: "Q: ...", back: "A: ..." }, ...28 cards]',
    lines: ['Processing chapter outputs...', 'Extracting key concepts...', 'Building card index...', 'DONE ✓'],
    duration: '234ms',
  },
  {
    id: 'export',
    label: 'export_file',
    type: 'OUTPUT',
    color: '#00ff88',
    desc: '整合所有输出，生成 Markdown 学习文档并归档',
    output: '/exports/学习华科大学_2025.md (12,847 tokens, ~9,600 words)',
    lines: ['Merging all chapter outputs...', 'Formatting Markdown...', 'Uploading to storage...', 'DONE ✓'],
    duration: '89ms',
  },
];

/* Animated terminal-style log output */
function LogLines({ lines, active }: { lines: string[]; active: boolean }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!active) { setVisibleCount(0); return; }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= lines.length) clearInterval(interval);
    }, 350);
    return () => clearInterval(interval);
  }, [active, lines]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.slice(0, visibleCount).map((line, idx) => (
        <div key={idx} style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: line.includes('DONE') ? 'var(--accent-green)' : 'var(--text-secondary)',
          opacity: 1,
          animation: 'fadeIn 0.2s ease',
        }}>
          {line}
        </div>
      ))}
      {active && visibleCount < lines.length && (
        <div className="cursor" style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent-green)' }} />
      )}
    </div>
  );
}

export default function WorkflowDemo() {
  const [ref, inView] = useInView<HTMLDivElement>(0.2);
  const [activeStep, setActiveStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startExecution = () => {
    if (isRunning) return;
    setIsRunning(true);
    setCompletedSteps([]);
    setActiveStep(0);
    let step = 0;
    intervalRef.current = setInterval(() => {
      setCompletedSteps(prev => [...prev, step]);
      step++;
      if (step < DAG_STEPS.length) {
        setActiveStep(step);
      } else {
        clearInterval(intervalRef.current!);
        setIsRunning(false);
      }
    }, 2200);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setCompletedSteps([]);
    setActiveStep(0);
  };

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <section id="workflow-demo" ref={ref} style={{
      background: 'var(--bg-void)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '120px 0',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="label-green" style={{ marginBottom: 20 }}>
              LIVE DAG EXECUTION
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(32px, 4vw, 48px)',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}>
              工作流实况演示
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={startExecution}
              disabled={isRunning}
              className="btn-primary"
              style={{ opacity: isRunning ? 0.5 : 1 }}
            >
              {isRunning ? '▶ 执行中...' : '▶ 运行工作流'}
            </button>
            <button onClick={reset} className="btn-secondary">
              ↺ 重置
            </button>
          </div>
        </div>

        {/* Main Canvas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 380px',
          gap: 1,
          background: 'var(--border-subtle)',
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>

          {/* Left: DAG Node Timeline */}
          <div style={{ background: 'var(--bg-surface)' }}>
            {/* Canvas Header */}
            <div style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                WORKFLOW CANVAS
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                {isRunning
                  ? <span style={{ color: 'var(--accent-orange)' }}>● EXECUTING</span>
                  : completedSteps.length === DAG_STEPS.length
                  ? <span style={{ color: 'var(--accent-green)' }}>● COMPLETED</span>
                  : <span style={{ color: 'var(--text-dim)' }}>○ IDLE</span>
                }
              </span>
            </div>

            {/* Node List */}
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              {DAG_STEPS.map((step, index) => {
                const isDone = completedSteps.includes(index);
                const isActive = activeStep === index && isRunning;

                return (
                  <div key={step.id} style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
                    {/* Timeline Line + Node */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, marginRight: 16, flexShrink: 0 }}>
                      {/* Connector Top */}
                      {index > 0 && (
                        <div style={{
                          width: 2,
                          flex: '0 0 20px',
                          background: completedSteps.includes(index - 1) ? step.color : 'var(--border-subtle)',
                          transition: 'background 0.4s ease',
                        }} />
                      )}
                      {index === 0 && <div style={{ flex: '0 0 20px' }} />}

                      {/* Node Dot */}
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        border: `2px solid ${isDone || isActive ? step.color : 'var(--text-dim)'}`,
                        background: isDone ? step.color : isActive ? `${step.color}33` : 'var(--bg-void)',
                        boxShadow: isActive ? `0 0 10px ${step.color}` : 'none',
                        transition: 'all 0.3s ease',
                        flexShrink: 0,
                      }} />

                      {/* Connector Bottom */}
                      {index < DAG_STEPS.length - 1 && (
                        <div style={{
                          width: 2,
                          flex: 1,
                          minHeight: 20,
                          background: isDone ? step.color : 'var(--border-subtle)',
                          transition: 'background 0.4s ease 0.5s',
                        }} />
                      )}
                    </div>

                    {/* Node Card */}
                    <div
                      onClick={() => setActiveStep(index)}
                      style={{
                        flex: 1,
                        padding: '16px 20px',
                        marginBottom: 8,
                        background: isActive ? 'var(--bg-hover)' : 'var(--bg-panel)',
                        border: `1px solid ${isActive ? step.color + '55' : 'var(--border-subtle)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? `0 0 20px ${step.color}11` : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          color: isDone || isActive ? step.color : 'var(--text-dim)',
                          letterSpacing: '0.08em',
                          fontWeight: 600,
                        }}>
                          {step.type}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 13,
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                        }}>
                          {step.label}
                        </span>
                        <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
                          {isDone ? `✓ ${step.duration}` : step.duration}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Live Output Panel */}
          <div style={{ background: 'var(--bg-panel)', display: 'flex', flexDirection: 'column' }}>
            {/* Panel Header */}
            <div style={{
              padding: '12px 20px',
              borderBottom: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--text-dim)',
              letterSpacing: '0.1em',
            }}>
              NODE OUTPUT — {DAG_STEPS[activeStep].label}
            </div>

            <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Node Type Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 12px',
                background: `${DAG_STEPS[activeStep].color}11`,
                border: `1px solid ${DAG_STEPS[activeStep].color}44`,
                width: 'fit-content',
              }}>
                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: DAG_STEPS[activeStep].color,
                  boxShadow: `0 0 6px ${DAG_STEPS[activeStep].color}`,
                }} />
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: DAG_STEPS[activeStep].color,
                  letterSpacing: '0.1em',
                }}>
                  {DAG_STEPS[activeStep].type}
                </span>
              </div>

              {/* Log Stream */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 12 }}>
                  EXECUTION LOG
                </div>
                <div style={{
                  background: 'var(--bg-void)',
                  border: '1px solid var(--border-subtle)',
                  padding: 16,
                  minHeight: 120,
                }}>
                  <LogLines
                    lines={DAG_STEPS[activeStep].lines}
                    active={activeStep === activeStep && isRunning && completedSteps[completedSteps.length - 1] !== activeStep}
                  />
                  {!isRunning && (
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>
                      → Click "运行工作流" to see live output
                    </div>
                  )}
                </div>
              </div>

              {/* Output Preview */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em', marginBottom: 12 }}>
                  OUTPUT PAYLOAD
                </div>
                <div style={{
                  background: 'var(--bg-void)',
                  border: '1px solid var(--border-subtle)',
                  padding: 16,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--accent-cyan)',
                  lineHeight: 1.7,
                  wordBreak: 'break-all',
                }}>
                  {completedSteps.includes(activeStep)
                    ? DAG_STEPS[activeStep].output
                    : <span style={{ color: 'var(--text-dim)' }}>awaiting execution...</span>
                  }
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
                    WORKFLOW PROGRESS
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent-green)' }}>
                    {completedSteps.length}/{DAG_STEPS.length}
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--border-subtle)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    background: 'var(--accent-green)',
                    width: `${(completedSteps.length / DAG_STEPS.length) * 100}%`,
                    transition: 'width 0.5s ease',
                    boxShadow: '0 0 8px var(--accent-green)',
                  }} />
                </div>
              </div>
            </div>
          </div>

        </div>

        <style>{`@keyframes fadeIn { from { opacity:0; transform: translateX(-4px); } to { opacity:1; transform:translateX(0); } }`}</style>
      </div>
    </section>
  );
}
