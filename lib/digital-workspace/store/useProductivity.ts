import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bookmark, PomodoroState, WatchStats, WatchHistory } from '@/lib/digital-workspace/types';

interface ProductivityState {
  // Pomodoro
  pomodoro: PomodoroState;
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;
  setPomodoroType: (type: PomodoroState['type']) => void;

  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (videoId: string, videoTitle: string, timestamp: number, note: string) => void;
  removeBookmark: (id: string) => void;

  // History & Statistics
  history: WatchHistory[];
  stats: WatchStats;
  addHistoryLog: (title: string, url: string, duration: number) => void;
  trackWatchSeconds: (seconds: number, category?: string) => void;
}

const DEFAULT_STATS: WatchStats = {
  totalTime: 0,
  videoCount: 0,
  categories: {
    'Coding & Dev': 0,
    'Music / Lofi': 0,
    'Education': 0,
    'Entertainment': 0,
    'Other': 0
  },
  peakHours: {},
  streak: 0,
  lastWatchedDate: ''
};

export const useProductivityStore = create<ProductivityState>()(
  persist(
    (set) => ({
      // Pomodoro States
      pomodoro: {
        isActive: false,
        type: 'focus',
        duration: 25 * 60,
        totalDuration: 25 * 60
      },

      startPomodoro: () => set((state) => ({
        pomodoro: { ...state.pomodoro, isActive: true }
      })),

      pausePomodoro: () => set((state) => ({
        pomodoro: { ...state.pomodoro, isActive: false }
      })),

      resetPomodoro: () => set((state) => {
        let duration = 25 * 60;
        if (state.pomodoro.type === 'shortBreak') duration = 5 * 60;
        if (state.pomodoro.type === 'longBreak') duration = 15 * 60;
        return {
          pomodoro: {
            ...state.pomodoro,
            isActive: false,
            duration,
            totalDuration: duration
          }
        };
      }),

      tickPomodoro: () => set((state) => {
        if (!state.pomodoro.isActive) return {};
        const nextDuration = state.pomodoro.duration - 1;
        
        if (nextDuration <= 0) {
          // Play a native sound trigger on completion
          try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);
            osc.frequency.value = 880; // High frequency beep
            gain.gain.setValueAtTime(0, context.currentTime);
            gain.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);
            osc.start(context.currentTime);
            osc.stop(context.currentTime + 0.5);
          } catch (e) {
            console.warn("Audio Context playback not allowed by policy yet");
          }

          // Trigger screen notification
          if (Notification.permission === 'granted') {
            new Notification(
              state.pomodoro.type === 'focus' 
                ? 'Time to Rest!' 
                : 'Back to Work!',
              { body: state.pomodoro.type === 'focus' ? 'Take a 5-minute break.' : 'Start your focus block.' }
            );
          } else {
            alert(state.pomodoro.type === 'focus' ? 'Focus block finished! Take a break.' : 'Break finished! Back to focus.');
          }

          // Cycle Pomodoro Types automatically
          let nextType: PomodoroState['type'] = 'focus';
          let duration = 25 * 60;
          if (state.pomodoro.type === 'focus') {
            nextType = 'shortBreak';
            duration = 5 * 60;
          }

          return {
            pomodoro: {
              isActive: false,
              type: nextType,
              duration,
              totalDuration: duration
            }
          };
        }

        return {
          pomodoro: {
            ...state.pomodoro,
            duration: nextDuration
          }
        };
      }),

      setPomodoroType: (type) => set(() => {
        let duration = 25 * 60;
        if (type === 'shortBreak') duration = 5 * 60;
        if (type === 'longBreak') duration = 15 * 60;
        return {
          pomodoro: {
            isActive: false,
            type,
            duration,
            totalDuration: duration
          }
        };
      }),

      // Clip Bookmarks
      bookmarks: [],

      addBookmark: (videoId, videoTitle, timestamp, note) => set((state) => {
        const newBookmark: Bookmark = {
          id: `bookmark-${Date.now()}`,
          videoId,
          videoTitle,
          timestamp,
          note,
          createdAt: Date.now()
        };
        return { bookmarks: [newBookmark, ...state.bookmarks] };
      }),

      removeBookmark: (id) => set((state) => ({
        bookmarks: state.bookmarks.filter((b) => b.id !== id)
      })),

      // Watch History and Analytics
      history: [],
      stats: DEFAULT_STATS,

      addHistoryLog: (title, url, duration) => set((state) => {
        const log: WatchHistory = {
          id: `history-${Date.now()}`,
          title,
          url,
          watchedAt: Date.now(),
          duration
        };
        return {
          history: [log, ...state.history].slice(0, 50), // Cap at 50 logs
          stats: {
            ...state.stats,
            videoCount: state.stats.videoCount + 1
          }
        };
      }),

      trackWatchSeconds: (seconds, category = 'Other') => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const currentHour = new Date().getHours();
        
        // Calculate Streak
        let nextStreak = state.stats.streak;
        if (state.stats.lastWatchedDate === '') {
          nextStreak = 1;
        } else {
          const lastDate = new Date(state.stats.lastWatchedDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            nextStreak += 1;
          } else if (diffDays > 1) {
            nextStreak = 1; // Reset streak if missed a day
          }
        }

        // Peak Hours map
        const nextHours = { ...state.stats.peakHours };
        nextHours[currentHour] = (nextHours[currentHour] || 0) + seconds;

        // Categories map
        const nextCategories = { ...state.stats.categories };
        nextCategories[category] = (nextCategories[category] || 0) + seconds;

        return {
          stats: {
            ...state.stats,
            totalTime: state.stats.totalTime + seconds,
            categories: nextCategories,
            peakHours: nextHours,
            streak: nextStreak,
            lastWatchedDate: today
          }
        };
      })
    }),
    {
      name: 'aetherdeck-productivity-storage'
    }
  )
);
