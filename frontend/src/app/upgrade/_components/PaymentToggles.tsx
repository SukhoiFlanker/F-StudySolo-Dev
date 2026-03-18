'use client';

import type { PaymentRegion, BillingCycle } from '../_data/plans';

interface PaymentTogglesProps {
  region: PaymentRegion;
  cycle: BillingCycle;
  onRegionChange: (r: PaymentRegion) => void;
  onCycleChange: (c: BillingCycle) => void;
}

export default function PaymentToggles({
  region,
  cycle,
  onRegionChange,
  onCycleChange,
}: PaymentTogglesProps) {
  const activeBtn = 'bg-white border border-[#e2e2d5] shadow-sm font-bold';
  const inactiveBtn = 'text-[#4a5568] hover:text-[#1a202c] transition-colors';
  const activeBlueFilled = 'bg-[#2c5282] text-white shadow-sm font-bold';

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 mb-16">
      {/* Region toggle */}
      <div className="pressed-toggle p-1 rounded-sm border border-[#e2e2d5] flex text-xs font-mono">
        <button
          type="button"
          onClick={() => onRegionChange('domestic')}
          className={`px-4 py-1.5 rounded-sm transition-all duration-200 ${region === 'domestic' ? `${activeBtn} text-[#2c5282]` : inactiveBtn}`}
        >
          国内支付
        </button>
        <button
          type="button"
          onClick={() => onRegionChange('overseas')}
          className={`px-4 py-1.5 rounded-sm transition-all duration-200 ${region === 'overseas' ? `${activeBtn} text-[#2c5282]` : inactiveBtn}`}
        >
          海外支付
        </button>
      </div>

      {/* Billing cycle toggle */}
      <div className="pressed-toggle p-1 rounded-sm border border-[#e2e2d5] flex text-xs font-mono">
        <button
          type="button"
          onClick={() => onCycleChange('monthly')}
          className={`px-4 py-1.5 rounded-sm transition-all duration-200 ${cycle === 'monthly' ? `${activeBtn} text-[#2c5282]` : inactiveBtn}`}
        >
          按月付
        </button>
        <button
          type="button"
          onClick={() => onCycleChange('yearly')}
          className={`px-4 py-1.5 rounded-sm flex items-center gap-2 transition-all duration-200 ${cycle === 'yearly' ? activeBlueFilled : inactiveBtn}`}
        >
          按年付
          <span className={`text-[9px] px-1.5 py-0.5 rounded-sm ${cycle === 'yearly' ? 'bg-white/20' : 'bg-[#2c5282]/10 text-[#2c5282]'}`}>
            立省 15% 以上
          </span>
        </button>
      </div>
    </div>
  );
}
