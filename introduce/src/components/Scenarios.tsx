import { useState } from 'react';
import { useInView } from '../hooks/useInView';
import {
  BrainCircuit, BookOpenText, GraduationCap, Globe2, MousePointer2, CheckCircle2,
  Zap, Map, FileText, Search, AppWindow, Download, PlayCircle, Loader2,
  BookOpen, Scissors, Microscope, SlidersHorizontal, HelpCircle, Network,
  Database, MessageSquare, Shuffle, Sparkles, ClipboardList
} from 'lucide-react';

const SCENARIOS = [
  {
    id: 'machine-learning',
    title: '系统学习新领�?,
    subtitle: '机器学习入门',
    icon: BrainCircuit,
    input: '帮我制定机器学习入门学习计划',
    color: 'var(--accent-blue)',
    flow: [
      { node: 'Trigger Input', icon: Zap, output: '解析学习目标：机器学习入�?, time: '0.1s' },
      { node: 'AI Planner', icon: Map, output: '生成学习路径：数学基础→监督学习→实践项目', time: '1.2s' },
      { node: 'Outline Gen', icon: FileText, output: '生成 12 章大纲，含子章节与学习时长估�?, time: '2.1s' },
      { node: 'Web Search', icon: Search, output: '检索最�?2025 �?ML 资源与论�?, time: '1.8s' },
      { node: 'Flashcard', icon: AppWindow, output: '生成 45 张核心概念记忆卡片（JSON�?, time: '2.4s' },
      { node: 'Export File', icon: Download, output: '导出学习材料包（Markdown 格式�?, time: '0.3s' },
    ],
    result: '6 分钟内完成系统学习方案，包含结构化大纲�?5 张闪卡、核心资源列�?,
  },
  {
    id: 'paper-reading',
    title: '论文阅读工作�?,
    subtitle: '学术文献分析',
    icon: BookOpenText,
    input: '上传课程 PDF，分析核心内容并生成复习材料',
    color: 'var(--accent-purple)',
    flow: [
      { node: 'Trigger Input', icon: Zap, output: '接收 PDF 上传任务', time: '0.1s' },
      { node: 'Knowledge Base', icon: BookOpen, output: '索引 PDF 内容，向量化关键段落', time: '3.2s' },
      { node: 'Content Extract', icon: Scissors, output: '提炼 6 个核心论点，过滤引用噪音', time: '2.8s' },
      { node: 'AI Analyzer', icon: Microscope, output: '方法论分析：实验设计评估、创新点归纳', time: '4.1s' },
      { node: 'Summary', icon: SlidersHorizontal, output: '生成 500 字精华摘�?批判性评�?, time: '1.9s' },
      { node: 'Quiz Gen', icon: HelpCircle, output: '生成 20 道理解测验题（含答案�?, time: '2.3s' },
    ],
    result: '一�?8000 字论文，15 分钟内完成深度分析、核心提炼、复习材料生�?,
  },
  {
    id: 'exam-prep',
    title: '考前高效复习',
    subtitle: '知识巩固测验',
    icon: GraduationCap,
    input: '基于本学期所有课件，生成高效复习材料',
    color: 'var(--accent-green)',
    flow: [
      { node: 'Trigger Input', icon: Zap, output: '识别复习目标：期末考试冲刺', time: '0.1s' },
      { node: 'Knowledge Base', icon: BookOpen, output: '检索已上传的课件知识库索引', time: '1.5s' },
      { node: 'AI Analyzer', icon: Microscope, output: '识别重难点章节，标注考试频率', time: '3.2s' },
      { node: 'Mind Map', icon: Network, output: '生成 3 个核心章节思维导图', time: '2.1s' },
      { node: 'Flashcard', icon: AppWindow, output: '生成 60 张知识点闪卡，按重要度排�?, time: '3.4s' },
      { node: 'Quiz Gen', icon: HelpCircle, output: '模拟卷：30 题，含难度标注和解析', time: '2.8s' },
    ],
    result: '3 份课�?10 分钟生成完整复习体系，包含思维导图�?0 张闪卡、模拟测�?,
  },
  {
    id: 'community-share',
    title: '社区共享学习�?,
    subtitle: '工作流发布与分叉',
    icon: Globe2,
    input: '发布我的「论文精读」工作流，供他人使用',
    color: 'var(--accent-rose)',
    flow: [
      { node: 'Trigger Input', icon: Zap, output: '工作流创建完成，准备发布', time: '�? },
      { node: 'Write DB', icon: Database, output: '工作流序列化，存入社区数据库', time: '0.5s' },
      { node: 'Chat Response', icon: MessageSquare, output: '生成工作流使用说明文�?, time: '1.2s' },
      { node: 'Logic Switch', icon: Shuffle, output: 'Fork 请求：他人基于此工作流创建变�?, time: '�? },
      { node: 'Merge Polish', icon: Sparkles, output: '社区用户定制化：增加测验节点', time: '2.1s' },
      { node: 'Export File', icon: Download, output: '工作流模板包导出分享', time: '0.2s' },
    ],
    result: '你发布的工作流被社区收藏 23 次，Fork 8 次，持续为他人创造价�?,
  },
];

export default function Scenarios() {
  const [active, setActive] = useState(0);
  const [runningStep, setRunningStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [ref, inView] = useInView<HTMLDivElement>(0.15);

  const scenario = SCENARIOS[active];

  const handleRun = () => {
    setCompletedSteps([]);
    setRunningStep(0);
    scenario.flow.forEach((_, i) => {
      setTimeout(() => {
        setRunningStep(i + 1 < scenario.flow.length ? i + 1 : null);
        setCompletedSteps(prev => [...prev, i]);
      }, (i + 1) * 900);
    });
  };

  const handleScenarioChange = (i: number) => {
    setActive(i);
    setRunningStep(null);
    setCompletedSteps([]);
  };

  return (
    <section id="scenarios" className="grid-bg" style={{ padding: '40px 0 80px', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 64, textAlign: 'center' }}>
          <span className="label label-green" style={{ marginBottom: 20, display: 'inline-flex' }}>
            REAL USE CASES · 应用场景
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(36px, 5vw, 56px)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: 24,
          }}>
            真实学习场景
            <br />
            <span className="marker-highlight" style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}>自动化工作流演示</span>
          </h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
            点击运行，查看工作流逐节点执行的完整过程
          </p>
        </div>

        {/* Scenario Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
          {SCENARIOS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => handleScenarioChange(i)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 24px',
                  borderRadius: 16,
                  border: `1px solid ${active === i ? s.color : 'var(--border-subtle)'}`,
                  background: active === i ? `${s.color}10` : 'var(--bg-surface)',
                  color: active === i ? s.color : 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: active === i ? `0 8px 16px -4px ${s.color}20` : '0 2px 4px rgba(0,0,0,0.02)',
                  opacity: inView ? 1 : 0,
                  transform: inView ? 'translateY(0)' : 'translateY(12px)',
                }}
              >
                <Icon size={24} color={active === i ? s.color : 'var(--text-dim)'} strokeWidth={active === i ? 2.5 : 2} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{s.title}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, fontFamily: 'var(--font-mono)' }}>{s.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Demo Area */}
        <div ref={ref} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.2fr',
          gap: 32,
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>

          {/* Left: Input + Flow Visualization */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* User Input */}
            <div style={{
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid var(--border-subtle)',
              padding: 24,
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--text-dim)',
                letterSpacing: '0.1em',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <MousePointer2 size={12} />
                USER INPUT �?AI PLANNER
              </div>
              <div style={{
                background: 'var(--bg-canvas)',
                borderRadius: 12,
                padding: '16px 20px',
                fontSize: 15,
                color: 'var(--text-primary)',
                fontWeight: 500,
                lineHeight: 1.6,
                border: `1px solid ${scenario.color}30`,
                display: 'flex',
                gap: 12
              }}>
                <span style={{ color: scenario.color, fontSize: 24 }}>�?/span>
                {scenario.input}
              </div>
              <button
                onClick={handleRun}
                style={{
                  marginTop: 16,
                  width: '100%',
                  padding: '14px',
                  borderRadius: 12,
                  border: 'none',
                  background: scenario.color,
                  color: '#ffffff',
                  fontFamily: 'var(--font-display)',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
              >
                <PlayCircle size={20} />
                运行工作流演�?              </button>
            </div>

            {/* Execution Steps */}
            <div style={{
              background: '#ffffff',
              borderRadius: 20,
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-canvas)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                  EXECUTION LOG
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: completedSteps.length === scenario.flow.length ? 'var(--accent-green)' : 'var(--text-dim)',
                }}>
                  {completedSteps.length}/{scenario.flow.length} NODES
                </span>
              </div>
              <div style={{ padding: 4 }}>
                {scenario.flow.map((step, i) => {
                  const isDone = completedSteps.includes(i);
                  const isRunning = runningStep === i;
                  const isPending = !isDone && !isRunning;
                  const NodeIcon = step.icon;

                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '14px 16px',
                        borderRadius: 12,
                        margin: 4,
                        background: isRunning ? `${scenario.color}08` : isDone ? 'var(--bg-canvas)' : 'transparent',
                        border: `1px solid ${isRunning ? scenario.color + '40' : isDone ? 'var(--border-subtle)' : 'transparent'}`,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: isDone ? `${scenario.color}20` : isRunning ? `${scenario.color}30` : 'var(--bg-canvas)',
                        border: `1px solid ${isDone ? scenario.color + '50' : isRunning ? scenario.color : 'var(--border-subtle)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.3s ease',
                        color: isDone || isRunning ? scenario.color : 'var(--text-dim)'
                      }}>
                        {isDone ? <CheckCircle2 size={16} /> : isRunning ? (
                          <span style={{ animation: 'spin 1s linear infinite', display: 'flex' }}><Loader2 size={16} /></span>
                        ) : <NodeIcon size={16} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 11,
                            fontWeight: 700,
                            color: isDone ? scenario.color : isRunning ? scenario.color : 'var(--text-dim)',
                            letterSpacing: '0.05em',
                          }}>{step.node}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>{step.time}</span>
                        </div>
                        <div style={{
                          fontSize: 12,
                          color: isDone ? 'var(--text-secondary)' : isPending ? 'var(--text-dim)' : 'var(--text-secondary)',
                          lineHeight: 1.5,
                          overflow: 'hidden',
                          maxHeight: isDone || isRunning ? '60px' : '0',
                          transition: 'max-height 0.4s ease',
                        }}>
                          {step.output}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Result Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 20,
              border: `2px solid ${scenario.color}30`,
              padding: 40,
              flex: 1,
              boxShadow: `0 20px 40px -8px ${scenario.color}15`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Decorative background glow */}
              <div style={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                background: scenario.color,
                opacity: 0.05,
                filter: 'blur(40px)',
                pointerEvents: 'none'
              }} />

              <div style={{ marginBottom: 20 }}>
                {(() => {
                  const MainIcon = scenario.icon;
                  return <MainIcon size={48} color={scenario.color} strokeWidth={1.5} />;
                })()}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                color: scenario.color,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}>
                {scenario.subtitle}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 28,
                color: 'var(--text-primary)',
                marginBottom: 20,
                lineHeight: 1.3,
              }}>
                {scenario.title}
              </h3>
              <div style={{
                fontSize: 16,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: 32,
                padding: '20px',
                background: `${scenario.color}08`,
                borderRadius: 12,
                borderLeft: `4px solid ${scenario.color}`,
              }}>
                {scenario.result}
              </div>

              {/* Flow Summary */}
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-dim)',
                  letterSpacing: '0.1em',
                  marginBottom: 12,
                }}>
                  WORKFLOW NODES
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {scenario.flow.map((step, i) => {
                    const NodeIcon = step.icon;
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 12px',
                          borderRadius: 999,
                          background: completedSteps.includes(i) ? `${scenario.color}15` : 'var(--bg-canvas)',
                          border: `1px solid ${completedSteps.includes(i) ? scenario.color + '40' : 'var(--border-subtle)'}`,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <NodeIcon size={14} color={completedSteps.includes(i) ? scenario.color : 'var(--text-dim)'} />
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          fontWeight: 600,
                          color: completedSteps.includes(i) ? scenario.color : 'var(--text-dim)',
                        }}>
                          {step.node}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* DocSpec Badge */}
            <div style={{
              background: 'var(--bg-canvas)',
              borderRadius: 16,
              border: '1px solid var(--border-subtle)',
              padding: '16px 20px',
              display: 'flex',
              gap: 16,
              alignItems: 'center',
            }}>
              <ClipboardList size={24} color={'var(--text-secondary)'} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  工作流社区共�?                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  完成的工作流可一键发布至社区，支�?Fork 分叉和个性化定制
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (max-width: 900px) {
            #scenarios > div > div:last-child {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
