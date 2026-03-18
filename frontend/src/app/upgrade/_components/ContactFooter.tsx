import { HeadphonesIcon } from 'lucide-react';

export default function ContactFooter() {
  return (
    <div className="mt-20 flex flex-col items-center">
      <p className="text-[#4a5568] text-xs mb-4 font-mono uppercase tracking-widest">
        如有定制需求或批量采购疑问
      </p>
      <button className="text-[#2c5282] hover:text-[#1a202c] transition-colors flex items-center gap-2 text-sm font-bold border-b border-[#2c5282] pb-1 font-serif">
        <HeadphonesIcon className="w-[18px] h-[18px]" />
        联系学术支持团队 / 咨询企业方案
      </button>
    </div>
  );
}
