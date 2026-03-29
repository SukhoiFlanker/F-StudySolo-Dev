import { useState } from 'react';
import { useInView } from '../hooks/useInView';

const FEATURES = [
  {
    id: 'dag',
    title: 'DAG 图结构执行引擎',
    tag: 'CORE ENGINE',
    tagColor: 'var(--accent-green)',
    desc: '系统内部对工作流执行拓扑排序（Topological Sort），严格按照节点依赖关系顺序调度 AI 模型。支持串行、并行、条件分支三种执行策略，任一节点失败将触发全局回滚。',
    detail: '自研 Python DAG Executor，完整支持：\n• 18 种执行节点类型\n• 拓扑排序 + 依赖解析\n• 并行组（Parallel Group）调度\n• 节点执行状态追踪',
    metrics: [
      { label: 'Node Types', value: '18' },
      { label: 'Max Parallel', value: '∞' },
      { label: 'Execution', value: 'SSE' },
    ],
  },
  {
    id: 'router',
    title: '多 AI 模型智能路由',
    tag: 'AI ROUTER',
    tagColor: 'var(--accent-cyan)',
    desc: '不依赖单一模型。根据节点类型和任务复杂度，自动路由至最适合的 AI 模型：分析用 DeepSeek-V3，推导用 Qwen-MAX，长文本用专用模型。',
    detail: '基于注册表驱动的 AI 路由系统：\n• DeepSeek-V3（分析 + 规划节点）\n• Qwen-MAX（内容生成节点）\n• 多模型 Fallback 容错链\n• Token 成本优化路由策略',
    metrics: [
      { label: 'AI Providers', value: '8+' },
      { label: 'Routing', value: 'Auto' },
      { label: 'Fallback', value: 'Yes' },
    ],
  },
  {
    id: 'sse',
    title: '实时 SSE 执行日志流推',
    tag: 'STREAMING',
    tagColor: 'var(--accent-orange)',
    desc: '不是黑盒转圈圈。工作流从触发到完成的每一步：节点状态变更、模型推理输出、分支判定结果，都以毫秒级流式推送至前端实时展现。',
    detail: 'FastAPI StreamingResponse 实现：\n• SSE (Server-Sent Events) 协议\n• 节点 PENDING → RUNNING → DONE 状态机\n• 前端 fetch + ReadableStream 解析\n• 生产环境 Nginx 无缓冲配置',
    metrics: [
      { label: 'Latency', value: '<800ms' },
      { label: 'Protocol', value: 'SSE' },
      { label: 'Format', value: 'NDJSON' },
    ],
  },
  {
    id: 'rls',
    title: 'RLS 行级安全数据隔离',
    tag: 'SECURITY',
    tagColor: '#ff4444',
    desc: '完全基于 Supabase 的 Row Level Security 策略。每个用户只能访问并操作自己的工作流、知识库和导出文件。数据库层强制隔离，绕不过去。',
    detail: 'Supabase RLS 实现方案：\n• JWT 令牌绑定用户身份\n• Policy: auth.uid() = user_id\n• API 层 + DB 层双重防护\n• IP 登录安全锁定（失败 5次封 10min）',
    metrics: [
      { label: 'Auth', value: 'JWT' },
      { label: 'Isolation', value: 'Row-Level' },
      { label: 'Lock', value: '5-attempt' },
    ],
  },
  {
    id: 'canvas',
    title: '工业级 DAG 可视化画布',
    tag: 'UI/UX',
    tagColor: 'var(--accent-cyan)',
    desc: '基于 @xyflow/react 构建的拖拽式工作流编辑器。节点间连线自动布局，支持画布缩放/平移、小地图导航、节点属性面板实时编辑，全程零代码。',
    detail: '@xyflow/react 定制实现：\n• 18 种节点自定义渲染器\n• 拖拽添加/连接/删除\n• 小地图缩略图导航\n• 节点属性侧边栏编辑器',
    metrics: [
      { label: 'Library', value: 'XYFlow' },
      { label: 'Node Types', value: '18' },
      { label: 'Interaction', value: 'Drag & Drop' },
    ],
  },
  {
    id: 'export',
    title: '多格式学习成果导出',
    tag: 'OUTPUT',
    tagColor: '#f59e0b',
    desc: '工作流执行完成后，自动将知识大纲、核心总结、闪卡、思维导图、测验题等内容整合打包，支持 Markdown / TXT / DOCX 格式导出，一键归档。',
    detail: '导出节点能力矩阵：\n• 大纲生成（structured outline）\n• 核心总结（key summary）\n• 闪卡包（flashcard JSON）\n• 思维导图（Markdown structure）\n• 测验题（Q&A pairs）',
    metrics: [
      { label: 'Formats', value: 'MD/TXT/DOCX' },
      { label: 'Auto-merge', value: 'Yes' },
      { label: 'Async', value: 'Background' },
    ],
  },
];

export default function Features() {
  const [active, setActive] = useState(0);
  const [panelRef, panelInView] = useInView<HTMLDivElement>(0.2);
  const current = FEATURES[active];

  return (
    <section id="features" style={{
      background: 'var(--bg-void)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '120px 0',
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 64 }}>
          <div className="label-green" style={{ marginBottom: 20 }}>
            PLATFORM CAPABILITIES
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(36px, 5vw, 56px)',
            letterSpacing: '-0.03em',
            color: 'var(--text-primary)',
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            核心引擎特性
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480 }}>
            不只是调用 API 的聊天工具。我们提供完整的平台级工程架构。
          </p>
        </div>

        {/* Interactive 2-Column Layout */}
        <div ref={panelRef} style={{
          display: 'grid',
          gridTemplateColumns: '340px 1fr',
          gap: 1,
          background: 'var(--border-subtle)',
          minHeight: 520,
          opacity: panelInView ? 1 : 0,
          transform: panelInView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>

          {/* Left: Feature Selector */}
          <div style={{ background: 'var(--bg-panel)', overflow: 'hidden' }}>
            {FEATURES.map((f, i) => (
              <div
                key={f.id}
                onClick={() => setActive(i)}
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  background: active === i ? 'var(--bg-hover)' : 'transparent',
                  borderLeft: active === i ? '2px solid var(--accent-green)' : '2px solid transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: active === i ? f.tagColor : 'var(--text-dim)',
                  letterSpacing: '0.12em',
                  marginBottom: 6,
                  transition: 'color 0.15s',
                }}>
                  {f.tag}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: 14,
                  color: active === i ? 'var(--text-primary)' : 'var(--text-secondary)',
                  lineHeight: 1.4,
                  transition: 'color 0.15s',
                }}>
                  {f.title}
                </div>
              </div>
            ))}
          </div>

          {/* Right: Detail Panel */}
          <div style={{
            background: 'var(--bg-surface)',
            padding: 48,
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
          }}>

            {/* Tag + Title */}
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: current.tagColor,
                letterSpacing: '0.15em',
                marginBottom: 12,
              }}>
                {current.tag}
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 28,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: 16,
              }}>
                {current.title}
              </h3>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
                {current.desc}
              </p>
            </div>

            {/* Metrics */}
            <div style={{ display: 'flex', gap: 1, background: 'var(--border-subtle)' }}>
              {current.metrics.map(m => (
                <div key={m.label} style={{
                  flex: 1,
                  background: 'var(--bg-panel)',
                  padding: '16px 20px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: 20,
                    color: 'var(--accent-green)',
                    marginBottom: 4,
                  }}>
                    {m.value}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-dim)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Tech Detail */}
            <div style={{
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              padding: '20px 24px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--text-dim)',
                letterSpacing: '0.1em',
                marginBottom: 12,
              }}>
                {'>'} TECHNICAL SPEC
              </div>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                color: 'var(--text-secondary)',
                lineHeight: 1.8,
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}>
                {current.detail}
              </pre>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
