import React from 'react';
import { useProductivityStore } from '@/lib/digital-workspace/store/useProductivity';
import { formatTime } from '@/lib/digital-workspace/utils/urlHelper';
import { 
  BarChart2, Flame, Clock, X, Calendar, MonitorPlay 
} from 'lucide-react';

interface StatsPanelProps {
  onClose: () => void;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ onClose }) => {
  const { stats, history } = useProductivityStore();

  const totalHrs = Math.floor(stats.totalTime / 3600);
  const totalMins = Math.floor((stats.totalTime % 3600) / 60);

  // Category percentage calculation helper
  const getCategoryPercent = (seconds: number) => {
    if (stats.totalTime === 0) return '0%';
    return `${Math.round((seconds / stats.totalTime) * 100)}%`;
  };

  // Find peak hour
  const getPeakHourLabel = () => {
    let peakHour = -1;
    let maxSeconds = 0;
    
    Object.entries(stats.peakHours).forEach(([hourStr, val]) => {
      const valNumber = val as number;
      if (valNumber > maxSeconds) {
        maxSeconds = valNumber;
        peakHour = parseInt(hourStr);
      }
    });

    if (peakHour === -1) return 'No watch data';
    const ampm = peakHour >= 12 ? 'PM' : 'AM';
    const hr = peakHour % 12 || 12;
    return `${hr} ${ampm} (${Math.round(maxSeconds / 60)} mins)`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 select-none">
      
      {/* Modal Container */}
      <div className="w-full max-w-2xl bg-aether-surface border border-aether-border/30 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-aether-border/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-aether-primary" />
            <h2 className="text-sm font-bold text-aether-primary tracking-widest uppercase">
              Productivity Watch Stats
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-aether-muted hover:text-aether-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin select-text">
          
          {/* Top Quick Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Total Duration */}
            <div className="bg-black/20 border border-aether-border/10 p-3 rounded-lg flex flex-col items-center justify-center text-center">
              <Clock className="w-5 h-5 text-aether-primary mb-1 stroke-1" />
              <span className="text-[10px] text-aether-muted uppercase font-mono tracking-wider">Total Time</span>
              <span className="text-sm font-bold text-aether-text mt-0.5">
                {totalHrs > 0 ? `${totalHrs}h ` : ''}{totalMins}m
              </span>
            </div>

            {/* Daily Streak */}
            <div className="bg-black/20 border border-aether-border/10 p-3 rounded-lg flex flex-col items-center justify-center text-center">
              <Flame className="w-5 h-5 text-orange-400 mb-1 stroke-1 animate-pulse" />
              <span className="text-[10px] text-aether-muted uppercase font-mono tracking-wider">Watch Streak</span>
              <span className="text-sm font-bold text-orange-400 mt-0.5">{stats.streak} Days</span>
            </div>

            {/* Video counts */}
            <div className="bg-black/20 border border-aether-border/10 p-3 rounded-lg flex flex-col items-center justify-center text-center">
              <MonitorPlay className="w-5 h-5 text-aether-primary mb-1 stroke-1" />
              <span className="text-[10px] text-aether-muted uppercase font-mono tracking-wider">Videos Played</span>
              <span className="text-sm font-bold text-aether-text mt-0.5">{stats.videoCount}</span>
            </div>
          </div>

          {/* Charts area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-aether-border/10">
            {/* Category breakdown list */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-bold text-aether-primary uppercase tracking-wider">
                Category Distribution
              </h3>
              <div className="space-y-2.5">
                {Object.entries(stats.categories).map(([cat, val]) => {
                  const percent = getCategoryPercent(val);
                  return (
                    <div key={cat} className="space-y-1 text-xs">
                      <div className="flex justify-between font-medium">
                        <span className="text-aether-text/80">{cat}</span>
                        <span className="font-mono text-[10px] text-aether-muted">
                          {percent} ({Math.round(val / 60)} mins)
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div
                          style={{ width: percent }}
                          className="h-full bg-aether-primary rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Peak Hour indicators */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-aether-primary uppercase tracking-wider mb-2">
                  Peak Watching Hour
                </h3>
                <div className="p-3 bg-black/25 rounded-lg border border-aether-border/10 flex items-center gap-3">
                  <Calendar className="w-7 h-7 text-aether-primary stroke-1" />
                  <div>
                    <div className="text-[10px] text-aether-muted font-semibold uppercase tracking-wider">Hour block</div>
                    <div className="text-xs font-bold text-aether-text mt-0.5">{getPeakHourLabel()}</div>
                  </div>
                </div>
              </div>

              {/* Peak Hour Bar chart preview */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-aether-muted uppercase tracking-wider">
                  24-Hour Activity Map
                </span>
                <div className="h-16 flex items-end gap-1.5 px-2 bg-black/15 rounded-lg border border-aether-border/10 pt-4">
                  {Array.from({ length: 24 }).map((_, hour) => {
                    const val = stats.peakHours[hour] || 0;
                    const maxVal = Math.max(...Object.values(stats.peakHours).concat([1]));
                    const pct = (val / maxVal) * 100;
                    
                    return (
                      <div
                        key={hour}
                        style={{ height: `${Math.max(5, pct)}%` }}
                        title={`${hour % 12 || 12} ${hour >= 12 ? 'PM' : 'AM'}: ${Math.round(val / 60)} mins`}
                        className={`flex-1 rounded-t-sm transition-all duration-300 ${
                          val > 0 ? 'bg-aether-primary' : 'bg-white/5'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[9px] text-aether-muted font-mono px-1">
                  <span>12 AM</span>
                  <span>12 PM</span>
                  <span>11 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Watch History List */}
          <div className="space-y-3 pt-4 border-t border-aether-border/10">
            <h3 className="text-xs font-bold text-aether-primary uppercase tracking-wider">
              Recent Watch History (Last 10)
            </h3>
            <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
              {history.length === 0 ? (
                <div className="text-center py-4 text-xs text-aether-muted italic">
                  No video playback history logged yet.
                </div>
              ) : (
                history.slice(0, 10).map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center p-2.5 rounded bg-black/25 border border-aether-border/5 hover:border-aether-border/20 transition-colors text-xs"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="font-semibold text-aether-text truncate">{log.title}</div>
                      <div className="text-[10px] text-aether-muted mt-0.5 truncate">{log.url}</div>
                    </div>
                    <div className="text-right flex-shrink-0 font-mono text-[10px] text-aether-muted">
                      <div>{formatTime(log.duration)}</div>
                      <div className="mt-0.5">{new Date(log.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
