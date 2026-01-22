import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendUp, accentColor = "bg-amber-500" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">{title}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
              <span>{trendUp ? '↑' : '↓'} {trend}</span>
            </div>
          )}
        </div>
        <div className={`${accentColor} bg-opacity-10 p-3 rounded-xl`}>
          <Icon className={`w-6 h-6 ${accentColor.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </motion.div>
  );
}