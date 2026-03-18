import { GraduationCap } from 'lucide-react';

export default function StudentVerification() {
  return (
    <div className="max-w-4xl w-full mb-16 paper-card stitched-border p-8 border-[#065f46]/20 bg-[#065f46]/[0.02]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-5 h-5 text-[#065f46]" />
            <h3 className="text-xl font-bold text-[#065f46] font-serif">学生认证中心</h3>
          </div>
          <div className="space-y-2 text-sm text-[#4a5568] font-medium leading-relaxed">
            <p className="flex items-center gap-2">
              <span className="w-1 h-1 bg-[#065f46] rounded-full shrink-0" />
              免费版用户认证后每日可享 <span className="text-[#065f46] font-bold">5 次</span> 满血模型调用
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1 h-1 bg-[#065f46] rounded-full shrink-0" />
              学期付专享套餐：<span className="font-bold">Pro ¥99/5月</span> (省 ¥26),{' '}
              <span className="font-bold">Pro+ ¥299/5月</span> (省 ¥96)
            </p>
          </div>
        </div>

        {/* Right CTA */}
        <button className="px-8 py-3 bg-[#065f46] text-white font-bold text-sm tracking-widest hover:bg-emerald-900 transition-colors flex items-center gap-2 shadow-md font-serif shrink-0">
          🎓 立即认证学生身份
        </button>
      </div>
    </div>
  );
}
