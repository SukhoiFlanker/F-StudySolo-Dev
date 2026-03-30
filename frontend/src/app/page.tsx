"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain,
  Workflow,
  Network,
  ArrowRight,
  BookOpen,
  PenTool,
  Sparkles,
  Users,
  Layers,
  Info,
  LogIn,
  UserPlus,
} from 'lucide-react';

/* ─── 核心能力卡片 ─── */
const features = [
  {
    icon: Sparkles,
    id: '01',
    title: '自然语言生成工作流',
    description: '用一句话描述学习目标，AI 自动生成包含多步骤的可视化工作流，无需理解 DAG 或连线逻辑。',
  },
  {
    icon: Workflow,
    id: '02',
    title: '可视化编排与执行',
    description: '拖拽画布自由编辑节点与连线，分步流式执行全程可观测，输入输出状态实时可见。',
  },
  {
    icon: Brain,
    id: '03',
    title: '18 种智能体节点',
    description: '涵盖大纲生成、知识提炼、闪卡记忆、测验评估等学习全流程，每个节点即一个独立智能体。',
  },
  {
    icon: Users,
    id: '04',
    title: '社区共享与节点共建',
    description: '发布工作流至社区供他人 Fork 复用，自定义提示词节点上架节点商店，共建学习生态。',
  },
  {
    icon: Layers,
    id: '05',
    title: '多模型智能路由',
    description: '对接 8 大 AI 平台、17+ 模型 SKU，自动选择最优模型并支持多级容灾降级。',
  },
  {
    icon: Network,
    id: '06',
    title: 'DAG 执行引擎',
    description: '自研拓扑排序执行引擎，支持条件分支、循环容器，通过 SSE 流式推送节点执行进度。',
  },
];

/* ─── 应用场景 ─── */
const scenarios = [
  {
    title: '系统化学习新领域',
    desc: '输入"机器学习入门"，自动生成目标拆解 → 大纲生成 → 内容提取 → 总结归纳 → 闪卡 → 测验的完整工作流。',
  },
  {
    title: '课后复习与知识巩固',
    desc: '上传课程 PDF 至知识库节点，连接内容提取与闪卡生成，快速将课件转化为记忆卡片。',
  },
  {
    title: '社区共享学习流程',
    desc: '构建论文阅读工作流并发布社区，其他用户直接 Fork 使用，无需从零设计。',
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#fcfbf9] text-slate-800 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden antialiased font-sans">

      {/* ─── 网格背景 (笔记本风格) ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.6]">
        <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', backgroundSize: '1.5rem 1.5rem' }} />
      </div>

      {/* ─── 红线装饰 ─── */}
      <div className="fixed top-0 bottom-0 left-6 md:left-12 w-[2px] bg-red-400/20 z-0" />
      <div className="fixed top-0 bottom-0 left-[28px] md:left-[52px] w-px bg-red-400/20 z-0" />

      {/* ─── 导航栏 ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#fcfbf9]/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6 md:px-12 lg:px-24">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-600" />
            <span className="text-lg font-bold tracking-tight text-slate-900 font-serif">
              StudySolo
            </span>
          </div>

          <div className="flex items-center h-full gap-3 md:gap-6">
            <a
              href="https://StudyFlow.1037solo.com/introduce"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              <Info className="w-4 h-4" />
              项目介绍
            </a>
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              登录
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-1.5 text-sm font-medium bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              注册
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero 区域 ─── */}
      <section className="relative z-10 pt-40 pb-24 md:pt-48 md:pb-32 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto">
        <div className="flex flex-col items-start gap-8">
          {/* 标签 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-slate-200 bg-white text-xs font-medium text-slate-500 shadow-sm"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>面向学习场景的智能体可视化编排平台</span>
          </motion.div>

          {/* 主标题 */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-slate-900 leading-[1.15] font-serif"
          >
            用自然语言<br />
            <span className="text-blue-600 relative">
              编排学习工作流
              <svg className="absolute w-full h-3 -bottom-2 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="transparent" />
              </svg>
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex flex-col gap-4 max-w-2xl font-serif text-lg md:text-xl text-slate-600 leading-relaxed"
          >
            <p>
              StudySolo 是一个让学习智能体可以被任何人创建、执行、分享和持续进化的开放平台。
            </p>
            <p>
              描述你的学习目标，AI 自动生成多步骤工作流。18 种智能体节点覆盖从大纲生成到测验评估的完整学习链路，全程可视化、可编辑、可复用。
            </p>
          </motion.div>

          {/* CTA 按钮组 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap items-center gap-4 mt-8"
          >
            <Link
              href="/register"
              className="group flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>免费注册</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://StudyFlow.1037solo.com/introduce"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-xl font-medium border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>项目介绍</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-slate-600 px-6 py-4 rounded-xl font-medium hover:text-blue-600 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>已有账号？登录</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── 核心能力 ─── */}
      <section className="relative z-10 py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto border-t border-slate-200/60 bg-white/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif tracking-tight">平台核心能力</h2>
          <p className="mt-3 text-slate-500 font-serif text-lg">不是单一智能体，而是让你创建、运行、共享智能体流程的完整平台</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="group bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                  <feature.icon className="w-5 h-5 stroke-[1.5]" />
                </div>
                <span className="text-2xl font-light text-slate-300 font-mono group-hover:text-blue-200 transition-colors">
                  {feature.id}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight font-serif">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-serif">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 应用场景 ─── */}
      <section className="relative z-10 py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto border-t border-slate-200/60">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif tracking-tight">应用场景</h2>
          <p className="mt-3 text-slate-500 font-serif text-lg">面向大学生及终身学习者，覆盖学习全流程</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarios.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-3 font-serif">{s.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-serif">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 技术栈概览 ─── */}
      <section className="relative z-10 py-20 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto border-t border-slate-200/60 bg-white/50">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif tracking-tight">技术架构</h2>
          <p className="mt-3 text-slate-500 font-serif text-lg">生产级全栈架构，已上线运行</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: '前端', value: 'Next.js 15 + React 19' },
            { label: '后端', value: 'Python FastAPI' },
            { label: '画布引擎', value: 'React Flow' },
            { label: '数据库', value: 'Supabase PostgreSQL' },
            { label: '节点类型', value: '18 种' },
            { label: 'AI 平台', value: '8 个' },
            { label: '模型 SKU', value: '17+' },
            { label: '管理模块', value: '10 个' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="text-xl font-bold text-blue-600 font-mono">{item.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-serif">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative z-10 py-24 px-6 md:px-12 lg:px-24 max-w-7xl mx-auto border-t border-slate-200/60 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif tracking-tight mb-4">
            开始构建你的学习工作流
          </h2>
          <p className="text-slate-500 font-serif text-lg mb-10 max-w-xl mx-auto">
            免费注册，用自然语言描述学习目标，让 AI 为你编排智能体工作流
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="group flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-medium hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <UserPlus className="w-4 h-4" />
              免费注册
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 text-slate-600 px-8 py-4 rounded-xl font-medium border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all"
            >
              <LogIn className="w-4 h-4" />
              登录
            </Link>
            <a
              href="https://StudyFlow.1037solo.com/introduce"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-500 px-6 py-4 rounded-xl font-medium hover:text-blue-600 transition-colors"
            >
              <Info className="w-4 h-4" />
              了解更多
            </a>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-4">
            <span>{new Date().getFullYear()} © StudySolo</span>
            <span className="text-slate-300">|</span>
            <span>华中科技大学首届 AI 智能体大赛参赛项目</span>
          </div>
          <div className="flex gap-8 mt-4 md:mt-0 font-medium">
            <a
              href="https://StudyFlow.1037solo.com/introduce"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              项目介绍
            </a>
            <a
              href="https://github.com/AIMFllys/StudySolo"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              开源仓库
            </a>
            <a
              href="https://docs.1037solo.com/#/docs/studysolo-terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
            >
              服务条款
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
