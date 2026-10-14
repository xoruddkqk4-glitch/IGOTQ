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

export const QAFilterBar: React.FC<QAFilterBarProps> = ({
  currentTab,
  onTabChange,
  currentSort,
  onSortChange,
  counts,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/10 mb-4">
      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={() => onTabChange('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentTab === 'all'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>전체</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10">{counts.all}</span>
        </button>

        <button
          onClick={() => onTabChange('pending')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentTab === 'pending'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>미답변 질문</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20">{counts.pending}</span>
        </button>

        <button
          onClick={() => onTabChange('answered')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentTab === 'answered'
              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>답변 완료</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10">{counts.answered}</span>
        </button>
      </div>

      {/* Sort selector */}
      <div className="flex items-center gap-1.5 self-end sm:self-auto">
        <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
        >
          <option value="latest" className="bg-slate-900 text-white">
            최신순 정렬
          </option>
          <option value="oldest" className="bg-slate-900 text-white">
            오래된순 정렬
          </option>
          <option value="pendingFirst" className="bg-slate-900 text-white">
            미답변 질문 우선
          </option>
        </select>
      </div>
    </div>
  );
};
