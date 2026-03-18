'use client';

import { ArrowLeft, Check, Compass, Pencil, Lightbulb, BookOpen, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const TIERS = [
  {
    id: 'free',
    name: '基础学徒',
    title: '基石',
    description: '独立学习者的学术起点。构建基础的知识图谱与笔记连结。',
    price: '0',
    currency: '¥',
    interval: '/月',
    features: [
      '基础 AI 节点与分析模型权限',
      '每周 50 次基础工作流推理',
      '最高支持 3MB 文档精简解析',
      '标准互助社区答疑响应'
    ],
    theme: 'bg-white/80 dark:bg-black/40 text-foreground border-border/60 shadow-sm hover:shadow-md',
    buttonTheme: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50',
    icon: Compass
  },
  {
    id: 'pro',
    name: '专业学者',
    title: '进阶',
    description: '深度求知者的核心生产力。解锁高阶思维导图与长文综述解析能力。',
    price: '28',
    currency: '¥',
    interval: '/月',
    features: [
      '全线进阶分析节点与自定义插件扩展',
      '每月专享 10,000 次深度推理配额',
      '支持 50MB 超大期刊论文与财报解析',
      '个人专属记忆树空间（5GB 知识存储）',
      '高智商前沿模型优先调度 (GPT-4o, Claude 3.5)'
    ],
    theme: 'bg-primary/5 dark:bg-primary/10 text-foreground border-primary/30 shadow-md ring-1 ring-primary/20 relative',
    buttonTheme: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    icon: Pencil,
    popular: true
  },
  {
    id: 'plus',
    name: '架构宗师',
    title: '突破',
    description: '打破认知边界，探索复杂交叉学科课题，建立个人的思想智库。',
    price: '68',
    currency: '¥',
    interval: '/月',
    features: [
      '囊括【专业学者】一切核心权益',
      '独家多路图灵运算引擎（支持复杂循环网络）',
      'VIP 专属推理通道，高峰期免排队直连',
      '沉浸式全域知识图谱（100GB 时空胶囊）',
      '团队级流式协作，学术观点无缝流转',
      '主创团队 7×24 优先客服与应用指导'
    ],
    theme: 'bg-[#f4efe6]/80 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100 border-emerald-600/30 dark:border-emerald-800/50 shadow-lg',
    buttonTheme: 'bg-emerald-700 dark:bg-emerald-600 text-white hover:bg-emerald-800 dark:hover:bg-emerald-500 shadow-sm',
    icon: Lightbulb
  },
  {
    id: 'ultra',
    name: '造物主',
    title: '极致',
    description: '绝对自由的思想演化容器。为极端复杂的长周期研究而生。',
    price: '198',
    currency: '¥',
    interval: '/月',
    features: [
      '彻底解开功能矩阵的绝对限制',
      '商业级 API 密钥无上限透明接驳',
      '部署您专属的私有化定制运算节点',
      '专属学术语料与私有数据集微调训练',
      '核心架构师 1V1 全天候深度技术支持'
    ],
    theme: 'bg-zinc-900 text-amber-50 dark:bg-black dark:text-amber-100 border-amber-900/60 dark:border-amber-700/50 shadow-xl',
    buttonTheme: 'bg-amber-600 text-black font-bold hover:bg-amber-500 shadow-md',
    icon: BookOpen
  }
];

export default function MembershipUpgradePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fcfcfb] dark:bg-background text-foreground flex flex-col font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* 纸张噪点纹理材质 */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.03)_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0.02)_100%)]" />

      {/* Top Nav (极简连线风) */}
      <header className="sticky top-0 z-50 flex items-center justify-between p-6 bg-[#fcfcfb]/80 dark:bg-background/80 backdrop-blur-md border-b border-border/40">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[13px] font-serif font-semibold tracking-widest uppercase transition-colors hover:text-primary group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 stroke-[1.5]" />
          返回案台
        </button>
        <div className="flex items-center gap-3">
          <span className="font-serif text-lg tracking-tight font-black italic pr-3 border-r-[1.5px] border-border/60">StudySolo</span>
          <span className="text-xs font-serif font-bold tracking-[0.2em] text-muted-foreground/80">会员序列</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center py-24 px-4 md:px-8 relative">
        
        {/* 背景辅助手绘装饰 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[80vh] border-[1.5px] border-dashed border-border/20 rounded-full -z-10 mix-blend-multiply dark:mix-blend-screen opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[40vh] border-[1.5px] border-dashed border-border/30 rounded-[100%] rotate-12 -z-10 mix-blend-multiply dark:mix-blend-screen opacity-40 animate-[spin_120s_linear_infinite]" />

        {/* Typographic Hero (手写笔记风) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center mb-24 relative"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-[1.1] text-foreground z-10 relative px-4">
            重塑思维维度
            <br />
            <span className="text-6xl md:text-7xl lg:text-8xl text-muted-foreground/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap -z-10 pointer-events-none italic font-serif">
              REDEFINE
            </span>
          </h1>
          
          <p className="mt-8 text-lg font-serif text-muted-foreground max-w-2xl mx-auto tracking-widest leading-relaxed border-t-[1.5px] border-dashed border-border/40 pt-6">
            打破算力与分析纵深的固有边界。<br className="md:hidden" />
            选择真正适配您学术野心与认知广度的网络引擎。
          </p>
        </motion.div>

        {/* Asymmetrical Staggered Cards (手账排版风) */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 items-start lg:items-end relative z-20">
          {TIERS.map((tier, index) => {
            const Icon = tier.icon;
            const isPopular = tier.popular;
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className={`flex flex-col h-full rounded-2xl p-7 border-[1.5px] ${tier.theme} ${isPopular ? 'lg:-translate-y-6 z-10' : 'z-0 lg:scale-95'} transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[11px] font-serif uppercase tracking-widest font-bold py-1.5 px-4 rounded shadow-sm border border-primary-foreground/20">
                    核心研究者之选
                  </div>
                )}
                
                <div className="mb-8 border-b-[1.5px] border-dashed border-current/20 pb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-serif font-black tracking-[0.2em] opacity-80 border border-current/20 px-2 py-0.5 rounded-sm">
                      {tier.name}
                    </span>
                    <Icon className="w-5 h-5 opacity-60 stroke-[1.5]" />
                  </div>
                  
                  <h3 className="text-3xl font-serif font-bold mb-3 tracking-wide">{tier.title}</h3>
                  <p className="text-[13px] font-serif opacity-75 min-h-[60px] leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="mb-10 flex items-baseline justify-center">
                  <span className="text-5xl font-mono font-bold tracking-tighter">
                    {tier.price}
                  </span>
                  <div className="ml-1.5 flex flex-col font-serif font-bold text-[11px] uppercase tracking-widest opacity-60">
                    <span>{tier.currency}</span>
                    <span>{tier.interval}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start text-[13px] font-serif leading-snug">
                      <Check className="w-4 h-4 mr-3 shrink-0 opacity-60 mt-0.5 stroke-[2]" />
                      <span className="opacity-90">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 text-[13px] font-serif font-bold tracking-[0.2em] rounded-xl transition-all duration-300 flex items-center justify-center group ${tier.buttonTheme}`}
                >
                  签署协议
                  <ChevronRight className="w-4 h-4 ml-1 opacity-60 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </motion.div>
            );
          })}
        </div>
        
        {/* Anti-Cliche Minimal Footer Note (钢笔注释风) */}
        <div className="mt-40 text-center text-[12px] text-muted-foreground/60 font-serif italic flex items-center justify-center gap-6">
          <span className="w-16 h-[1.5px] rounded-full bg-border/40" />
          « 翻阅至笔记末页 »
          <span className="w-16 h-[1.5px] rounded-full bg-border/40" />
        </div>
      </main>
    </div>
  );
}
