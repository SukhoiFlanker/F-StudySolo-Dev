import { COMPARISON_ROWS } from '../_data/plans';

export default function ComparisonTable() {
  return (
    <div className="mt-20 w-full max-w-6xl paper-card stitched-border rounded-none overflow-hidden bg-white/50">
      {/* Title */}
      <div className="p-8 border-b border-[#e2e2d5] text-center">
        <h3 className="text-xl font-bold text-[#2c5282] uppercase tracking-widest font-serif">
          功能详细对比报告
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse comparison-table font-mono text-[11px]">
          <thead>
            <tr className="bg-slate-50">
              <th className="p-5 pl-10 text-[#4a5568] w-1/5 font-bold uppercase tracking-tighter">指标维度</th>
              <th className="p-5 text-center text-[#4a5568] w-1/5 font-bold">免费版</th>
              <th className="p-5 text-center text-[#4a5568] w-1/5 font-bold">Pro版</th>
              <th className="p-5 text-center text-[#2c5282] w-1/5 font-bold bg-[#2c5282]/5">Pro+版</th>
              <th className="p-5 text-center text-[#065f46] w-1/5 font-bold">Ultra版</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => {
              if (row.isHeader) {
                return (
                  <tr key={i} className="bg-[#fdfcf8]/30">
                    <td
                      colSpan={5}
                      className="p-2 pl-10 font-bold text-[#2c5282] uppercase text-[9px]"
                    >
                      {row.headerLabel}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 pl-10 font-medium">{row.label}</td>
                  <td className={`p-4 text-center ${row.label === '模型能力支持' ? 'opacity-60' : ''}`}>
                    {row.free}
                  </td>
                  <td className="p-4 text-center">{row.pro}</td>
                  <td className="p-4 text-center font-bold text-[#2c5282] bg-[#2c5282]/5">
                    {row.proPlus}
                  </td>
                  <td className={`p-4 text-center text-[#065f46] ${
                    ['模型能力支持', '客户支持'].includes(row.label) ? 'font-bold' : ''
                  }`}>
                    {row.ultra}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
