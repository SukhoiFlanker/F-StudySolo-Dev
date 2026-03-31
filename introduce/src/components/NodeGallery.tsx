import { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { 
  Zap, BookOpen, Search, Microscope, Map, Scissors, Scale, 
  SlidersHorizontal, FileText, AppWindow, HelpCircle, Network, Sparkles, 
  MessageSquare, Download, Database, Shuffle, Repeat 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: '鍏ㄩ儴鑺傜偣', color: 'var(--text-primary)' },
  { id: 'input', label: '杈撳叆绫?, color: 'var(--accent-green)' },
  { id: 'analysis', label: '鍒嗘瀽绫?, color: 'var(--accent-blue)' },
  { id: 'generate', label: '鐢熸垚绫?, color: 'var(--accent-purple)' },
  { id: 'interaction', label: '浜や簰绫?, color: 'var(--accent-rose)' },
  { id: 'output', label: '杈撳嚭绫?, color: 'var(--accent-emerald)' },
  { id: 'control', label: '鎺у埗娴?, color: 'var(--accent-amber)' },
];

const NODES = [
  {
    id: 'trigger_input',
    name: 'Trigger Input',
    label: '宸ヤ綔娴佽Е鍙戝櫒',
    category: 'input',
    icon: Zap,
    desc: '宸ヤ綔娴佸叆鍙ｏ紝鎵胯浇鐢ㄦ埛鍘熷瀛︿範鐩爣锛屾槸鎵€鏈夊伐浣滄祦鐨勮捣鐐?,
    detail: '鎺ュ彈鑷劧璇█鎻忚堪銆佺粨鏋勫寲浠诲姟鎸囦护锛屾敞鍏?ExecutionContext',
  },
  {
    id: 'knowledge_base',
    name: 'Knowledge Base',
    label: '鐭ヨ瘑搴撴绱?,
    category: 'input',
    icon: BookOpen,
    desc: '鏀寔鏂囦欢涓婁紶涓庢枃妗ｅ唴瀹规敞鍏ワ紝瀹炵幇鍚戦噺妫€绱笌璇箟鎼滅储',
    detail: '鏀寔 PDF/TXT/MD 鏂囦欢锛屽悜閲忓寲瀛樺偍锛屽娣卞害妫€绱㈢瓥鐣?,
  },
  {
    id: 'web_search',
    name: 'Web Search',
    label: '鑱旂綉鎼滅储',
    category: 'input',
    icon: Search,
    desc: '澶氭簮骞跺彂妫€绱紝鏉冨▉鏉ユ簮鈫掕鍧涒啋娣卞害鍒嗘瀽澶氱骇鎼滅储绛栫暐',
    detail: '鐧惧害 API + Qwen 鎬荤粨锛屾繁搴︽悳绱娇鐢ㄦ櫤璋?WebSearch',
  },
  {
    id: 'ai_analyzer',
    name: 'AI Analyzer',
    label: '娣卞害鍒嗘瀽',
    category: 'analysis',
    icon: Microscope,
    desc: '澶氱淮搴︽繁搴﹀垎鏋愶紝杩愮敤鎺ㄧ悊妯″瀷鎸栨帢鏍稿績閫昏緫涓庢礊瑙?,
    detail: 'DeepSeek-R1 婊¤鎺ㄧ悊锛屾敮鎸侀摼寮忔€濊€冭緭鍑?,
  },
  {
    id: 'ai_planner',
    name: 'AI Planner',
    label: '瀛︿範瑙勫垝',
    category: 'analysis',
    icon: Map,
    desc: '灏嗗涔犵洰鏍囧垎瑙ｄ负缁撴瀯鍖栨柟妗堬紝鐢熸垚甯︿紭鍏堢骇鐨勪换鍔″簭鍒?,
    detail: 'Qwen-Plus 瑙勫垝锛岃緭鍑虹粨鏋勫寲 JSON 瀛︿範璺緞',
  },
  {
    id: 'content_extract',
    name: 'Content Extract',
    label: '鍐呭鎻愬彇',
    category: 'analysis',
    icon: Scissors,
    desc: '浠庨暱鏂囨湰涓娊鍙栧叧閿俊鎭紝杩囨护鍣煶淇濈暀鏍稿績鐭ヨ瘑鐐?,
    detail: 'Kimi 闀挎枃鏈笓椤癸紝鏀寔 5 涓囧瓧浠ヤ笂鏂囨。鍏ㄦ枃鍒嗘瀽',
  },
  {
    id: 'compare',
    name: 'Compare',
    label: '瀵规瘮鍒嗘瀽',
    category: 'analysis',
    icon: Scale,
    desc: '澶氳搴﹀姣斿垎鏋愶紝缁撴瀯鍖栧憟鐜颁笉鍚岃鐐逛笌鏂规鐨勪紭鍔?,
    detail: '鏀寔澶氳矾杈撳叆鍚堝苟锛屽弻缁村害鐭╅樀杈撳嚭',
  },
  {
    id: 'outline_gen',
    name: 'Outline Gen',
    label: '澶х翰鐢熸垚',
    category: 'generate',
    icon: FileText,
    desc: '鐢熸垚灞傛鍖栫煡璇嗗ぇ绾诧紝鏀寔 2-5 绾ф爣棰樻爲鐘剁粨鏋?,
    detail: 'Qwen-MAX 鐢熸垚锛孭ro 鐗?8-12 瑕佺偣+瀛愰」娣卞害灞曞紑',
  },
  {
    id: 'summary',
    name: 'Summary',
    label: '鎬荤粨褰掔撼',
    category: 'generate',
    icon: SlidersHorizontal,
    desc: '鎻愮偧绮惧崕锛屽皢澶嶆潅鍐呭娴撶缉涓洪珮璐ㄩ噺鐭ヨ瘑鎽樿',
    detail: '鏀寔澶氭簮鍚堝苟褰掔撼锛屼繚鐣欏師濮嬫潵婧愭爣娉?,
  },
  {
    id: 'flashcard',
    name: 'Flashcard',
    label: '闂崱鐢熸垚',
    category: 'generate',
    icon: AppWindow,
    desc: 'JSON 缁撴瀯鍖栬緭鍑鸿蹇嗗崱鐗囷紝閰嶅悎闂撮殧閲嶅绯荤粺浣跨敤',
    detail: '杈撳嚭鏍囧噯 Anki 鍏煎 JSON锛屾闈?鑳岄潰/鏍囩瀹屾暣缁撴瀯',
  },
  {
    id: 'quiz_gen',
    name: 'Quiz Gen',
    label: '娴嬮獙鐢熸垚',
    category: 'generate',
    icon: HelpCircle,
    desc: '鑷姩鐢熸垚閫夋嫨/濉┖/绠€绛旈锛屽甫鍙傝€冪瓟妗堝拰闅惧害鏍囨敞',
    detail: '缁撴瀯鍖?JSON 杈撳嚭锛屾敮鎸佸绉嶉鍨嬫贩鍚堬紝鍚В鏋愯鏄?,
  },
  {
    id: 'mind_map',
    name: 'Mind Map',
    label: '鎬濈淮瀵煎浘',
    category: 'generate',
    icon: Network,
    desc: '鐢熸垚 Markdown 鏍煎紡鐨勬€濈淮瀵煎浘缁撴瀯锛屽彲瀵煎叆鍚勭被宸ュ叿',
    detail: '灞傜骇 Markdown 杈撳嚭锛屽吋瀹?XMind/Obsidian 绛夊伐鍏?,
  },
  {
    id: 'merge_polish',
    name: 'Merge & Polish',
    label: '鍚堝苟娑﹁壊',
    category: 'generate',
    icon: Sparkles,
    desc: '鍚堝苟澶氳矾涓婃父杈撳嚭锛岀粺涓€椋庢牸銆佹秷闄ゅ啑浣欍€佹彁鍗囧彲璇绘€?,
    detail: '鏀寔 N 璺緭鍏ユ眹鑱氾紝Qwen-Plus 缁熶竴椋庢牸杈撳嚭',
  },
  {
    id: 'chat_response',
    name: 'Chat Response',
    label: '瀵硅瘽鍥炲',
    category: 'interaction',
    icon: MessageSquare,
    desc: '鍐呭祵瀵硅瘽鍨嬪洖澶嶈妭鐐癸紝鍦ㄥ伐浣滄祦涓繚鎸佷笂涓嬫枃杩炵画鎬?,
    detail: '娴佸紡杈撳嚭锛屼繚鐣欏伐浣滄祦涓婁笅鏂囷紝鏀寔 Markdown 娓叉煋',
  },
  {
    id: 'export_file',
    name: 'Export File',
    label: '鏂囦欢瀵煎嚭',
    category: 'output',
    icon: Download,
    desc: '灏嗗伐浣滄祦缁撴灉瀵煎嚭涓?Markdown/TXT 鏍煎紡鏂囦欢涓嬭浇',
    detail: '鍓嶇鍗虫椂鐢熸垚锛屾敮鎸佽嚜瀹氫箟鏂囦欢鍚嶅拰鏍煎紡',
  },
  {
    id: 'write_db',
    name: 'Write DB',
    label: '鏁版嵁鎸佷箙鍖?,
    category: 'output',
    icon: Database,
    desc: '灏嗘墽琛岀粨鏋滃啓鍏?Supabase 鏁版嵁搴擄紝鏀寔鍚庣画妫€绱㈠鐢?,
    detail: 'RLS 淇濇姢锛屾暟鎹粎褰掑睘褰撳墠鐢ㄦ埛锛屾敮鎸佺増鏈拷韪?,
  },
  {
    id: 'logic_switch',
    name: 'Logic Switch',
    label: '鏉′欢鍒嗘敮',
    category: 'control',
    icon: Shuffle,
    desc: '鍩轰簬鏉′欢鍒ゆ柇鐨勫垎鏀帶鍒讹紝瀹炵幇鍔ㄦ€佽矾寰勯€夋嫨',
    detail: '鏀寔澶氭潯浠?Expression锛孌AG 鑷姩澶勭悊鍒嗘敮鍚堝苟',
  },
  {
    id: 'loop_group',
    name: 'Loop Group',
    label: '寰幆瀹瑰櫒',
    category: 'control',
    icon: Repeat,
    desc: '灏嗕竴缁勮妭鐐瑰皝瑁呬负寰幆鎵ц鍗曞厓锛屾敮鎸佸杞凯浠?,
    detail: 'Pro+ 鏈€澶?3 杞紝Ultra 鏈€澶?10 杞苟琛岃凯浠?,
  },
];

const CATEGORY_COLOR: Record<string, string> = {
  input: 'var(--accent-green)',
  analysis: 'var(--accent-blue)',
  generate: 'var(--accent-purple)',
  interaction: 'var(--accent-rose)',
  output: 'var(--accent-emerald)',
  control: 'var(--accent-amber)',
};

export default function NodeGallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [ref, inView] = useInView<HTMLDivElement>(0.1);

  const filtered = activeCategory === 'all'
    ? NODES
    : NODES.filter(n => n.category === activeCategory);

  const hovered = NODES.find(n => n.id === hoveredNode);

  return (
    <section id="nodes" className="grid-bg" style={{ padding: '40px 0 80px', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>

        {/* Header */}
        <div className="reveal" style={{ marginBottom: 64, textAlign: 'center' }}>
          <span className="label label-purple" style={{ marginBottom: 20, display: 'inline-flex' }}>
            NODE ECOSYSTEM 路 18 TYPES
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
            姣忎釜鑺傜偣锛岄兘鏄竴涓?            <br />
            <span className="marker-highlight" style={{ fontSize: 'clamp(32px, 4.5vw, 48px)' }}>鐙珛鐨?AI 鏅鸿兘浣?/span>
          </h2>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto', lineHeight: 1.6 }}>
            18 绉嶄笓涓氬寲鑺傜偣瑕嗙洊瀹屾暣瀛︿範娴佺▼鐨勬瘡涓幆鑺傦紝
            閫氳繃 DAG 杩炴帴褰㈡垚澶氭櫤鑳戒綋鍗忎綔绯荤粺銆?          </p>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 20px',
                borderRadius: 999,
                border: `1px solid ${activeCategory === cat.id ? cat.color : 'var(--border-subtle)'}`,
                background: activeCategory === cat.id ? `${cat.color}15` : 'var(--bg-surface)',
                color: activeCategory === cat.id ? cat.color : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.05em',
              }}
            >
              {cat.label}
              {cat.id !== 'all' && (
                <span style={{ marginLeft: 6, opacity: 0.6 }}>
                  {NODES.filter(n => n.category === cat.id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Layout: Grid + Hover Detail */}
        <div ref={ref} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: 32,
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>

          {/* Node Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 12,
            alignContent: 'start',
          }}>
            {filtered.map((node, i) => {
              const color = CATEGORY_COLOR[node.category];
              const isHovered = hoveredNode === node.id;
              const IconComponent = node.icon;
              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: `2px solid ${isHovered ? color : 'var(--border-subtle)'}`,
                    padding: 4,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isHovered ? 'translateY(-4px)' : 'none',
                    boxShadow: isHovered ? `0 12px 24px -4px ${color}25` : '0 2px 4px rgba(0,0,0,0.03)',
                    opacity: inView ? 1 : 0,
                    animation: inView ? `fadeUp 0.4s ease ${i * 0.04}s both` : 'none',
                    position: 'relative',
                  }}
                >
                  {/* Left Handle */}
                  <div style={{
                    position: 'absolute', top: '50%', left: -5, transform: 'translateY(-50%)',
                    width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', border: '1.5px solid #fff',
                    zIndex: 2,
                  }} />
                  {/* Right Handle */}
                  <div style={{
                    position: 'absolute', top: '50%', right: -5, transform: 'translateY(-50%)',
                    width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', border: '1.5px solid #fff',
                    zIndex: 2,
                  }} />

                  {/* Inner Dashed/Solid wrapper (to simulate React Flow node look) */}
                  <div style={{
                    border: `1px dashed ${isHovered ? color : 'var(--border-subtle)'}`,
                    borderRadius: 8,
                    padding: 16,
                    height: '100%',
                    background: isHovered ? `${color}05` : 'transparent',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                  }}>
                    <div style={{ marginBottom: 16 }}>
                      <IconComponent size={24} color={isHovered ? color : 'var(--text-secondary)'} strokeWidth={isHovered ? 2.5 : 2} style={{ transition: 'all 0.2s ease' }} />
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 10,
                      fontWeight: 700,
                      color,
                      letterSpacing: '0.05em',
                      marginBottom: 6,
                      textTransform: 'uppercase',
                    }}>
                      {node.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: 15,
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                    }}>
                      {node.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hover Detail Panel */}
          <div style={{
            position: 'sticky',
            top: 100,
            height: 'fit-content',
          }}>
            {hovered ? (
              <div style={{
                background: '#ffffff',
                borderRadius: 24,
                border: `2px solid ${CATEGORY_COLOR[hovered.category]}`,
                padding: 32,
                boxShadow: `0 20px 40px -8px ${CATEGORY_COLOR[hovered.category]}20`,
                transition: 'all 0.3s ease',
              }}>
                <div style={{ marginBottom: 20 }}>
                  {(() => {
                    const HoveredIcon = hovered.icon;
                    return <HoveredIcon size={48} color={CATEGORY_COLOR[hovered.category]} strokeWidth={2} />;
                  })()}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: CATEGORY_COLOR[hovered.category],
                  letterSpacing: '0.1em',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}>
                  {hovered.name}
                </div>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 24,
                  color: 'var(--text-primary)',
                  marginBottom: 16,
                  lineHeight: 1.3,
                }}>
                  {hovered.label}
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                  {hovered.desc}
                </p>
                <div style={{
                  background: 'var(--bg-canvas)',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  padding: '16px 20px',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-dim)',
                    letterSpacing: '0.1em',
                    marginBottom: 10,
                  }}>
                    TECHNICAL NOTE
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {hovered.detail}
                  </div>
                </div>
                <div style={{
                  marginTop: 16,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: `${CATEGORY_COLOR[hovered.category]}15`,
                  border: `1px solid ${CATEGORY_COLOR[hovered.category]}30`,
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 600,
                    color: CATEGORY_COLOR[hovered.category],
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>
                    {CATEGORIES.find(c => c.id === hovered.category)?.label}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{
                background: 'var(--bg-surface)',
                borderRadius: 24,
                border: '2px dashed var(--border-subtle)',
                padding: 40,
                textAlign: 'center',
                color: 'var(--text-dim)',
              }}>
                <div style={{ marginBottom: 16, opacity: 0.3, display: 'flex', justifyContent: 'center' }}>
                  <Search size={48} strokeWidth={1.5} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.05em' }}>
                  鎮仠浠绘剰鑺傜偣
                  <br />鏌ョ湅璇︾粏璇存槑
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div style={{
              marginTop: 16,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
            }}>
              {[
                { label: '鑺傜偣鎬绘暟', value: '18' },
                { label: '绫诲埆', value: '5+1' },
                { label: '宸蹭笂绾?, value: '100%' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: '#ffffff',
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  padding: '14px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 20,
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                  }}>{stat.value}</div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: 'var(--text-dim)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive */}
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (max-width: 900px) {
            #nodes > div > div:last-child {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}

