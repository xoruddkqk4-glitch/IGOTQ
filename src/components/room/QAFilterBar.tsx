'use client';

import React from 'react';
import { ArrowUpDown, HelpCircle, CheckCircle2, ListFilter } from 'lucide-react';

export type FilterTab = 'all' | 'pending' | 'answered';
export type SortOption = 'latest' | 'oldest' | 'pendingFirst';

interface QAFilterBarProps {
  currentTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  counts: {
    all: number;
    pending: number;
    answered: number;
  };
}

export const QAFilterBar = React.memo<QAFilterBarProps>(({
  currentTab,
  onTabChange,
  currentSort,
  onSortChange,
  counts,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/[0.08] mb-5">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#e8e8ed] rounded-full self-start">
        <button
          onClick={() => onTabChange('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] transition-all ${
            currentTab === 'all'
              ? 'bg-white text-[#1d1d1f] font-normal shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
              : 'text-[#86868b] hover:text-[#1d1d1f] font-normal'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>전체</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/[0.06] font-normal">{counts.all}</span>
        </button>

        <button
          onClick={() => onTabChange('pending')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] transition-all ${
            currentTab === 'pending'
              ? 'bg-white text-[#1d1d1f] font-normal shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
              : 'text-[#86868b] hover:text-[#1d1d1f] font-normal'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#ff9500]" />
          <span>미답변</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/[0.06] font-normal">{counts.pending}</span>
        </button>

        <button
          onClick={() => onTabChange('answered')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] transition-all ${
            currentTab === 'answered'
              ? 'bg-white text-[#1d1d1f] font-normal shadow-[0_1px_3px_rgba(0,0,0,0.12)]'
              : 'text-[#86868b] hover:text-[#1d1d1f] font-normal'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34c759]" />
          <span>답변 완료</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-black/[0.06] font-normal">{counts.answered}</span>
        </button>
      </div>

      {/* Sort selector */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <ArrowUpDown className="w-3.5 h-3.5 text-[#86868b]" />
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-white border border-black/[0.1] rounded-full px-3.5 py-1.5 text-[13px] font-normal text-[#1d1d1f] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
        >
          <option value="latest">최신순 정렬</option>
          <option value="oldest">오래된순 정렬</option>
          <option value="pendingFirst">미답변 질문 우선</option>
        </select>
      </div>
    </div>
  );
});

QAFilterBar.displayName = 'QAFilterBar';
