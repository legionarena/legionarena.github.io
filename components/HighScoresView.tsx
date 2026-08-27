'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Swords,
  Dices,
  Medal,
  Crown,
  Search,
  Zap,
  Play,
  Filter,
  Sparkles,
  Flame,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { User, GameHighScore } from '@/lib/types';
import { getHighScores, getUserPersonalBests } from '@/lib/db';

interface HighScoresViewProps {
  currentUser: User;
  onLaunchGame: (stationId: string) => void;
  playTacticalSound: (type: 'click' | 'menu' | 'launch' | 'switch' | 'success' | 'alert') => void;
}

type GameFilter = 'all' | 'code-pressed' | 'slots-up';

export default function HighScoresView({
  currentUser,
  onLaunchGame,
  playTacticalSound
}: HighScoresViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<GameFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [scores, setScores] = useState<GameHighScore[]>(() => {
    if (typeof window !== 'undefined') {
      return getHighScores();
    }
    return [];
  });
  const [personalBests, setPersonalBests] = useState<{ codePressed: number; slotsUp: number }>(() => {
    if (typeof window !== 'undefined' && currentUser) {
      return getUserPersonalBests(currentUser.id);
    }
    return { codePressed: 0, slotsUp: 0 };
  });

  const loadData = React.useCallback(() => {
    setScores(getHighScores());
    if (currentUser) {
      setPersonalBests(getUserPersonalBests(currentUser.id));
    }
  }, [currentUser]);

  useEffect(() => {
    // Listen for real-time score additions
    const handleDbUpdate = () => {
      loadData();
    };
    window.addEventListener('firestorm_db_updated', handleDbUpdate);
    return () => window.removeEventListener('firestorm_db_updated', handleDbUpdate);
  }, [loadData]);

  const filteredScores = useMemo(() => {
    const list = scores
      .filter((s) => {
        if (selectedFilter === 'code-pressed' && s.gameId !== 'code-pressed') return false;
        if (selectedFilter === 'slots-up' && s.gameId !== 'slots-up') return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            s.userCallsign.toLowerCase().includes(q) ||
            s.userUid.toLowerCase().includes(q) ||
            s.gameName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => b.score - a.score);

    // Enforce strictly 1 high score per user
    const seenUsers = new Set<string>();
    const uniquePerUser: GameHighScore[] = [];
    for (const item of list) {
      const userKey = selectedFilter === 'all'
        ? (item.userId || item.userUid)
        : `${item.userId || item.userUid}_${item.gameId}`;
      if (!seenUsers.has(userKey)) {
        seenUsers.add(userKey);
        uniquePerUser.push(item);
      }
    }
    return uniquePerUser;
  }, [scores, selectedFilter, searchQuery]);

  const topThree = filteredScores.slice(0, 3);

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div id="high-scores-page-container" className="w-full space-y-6">
      {/* Header Banner */}
      <div
        id="leaderboard-header"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950/40 p-6 md:p-8 border border-amber-500/30 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              GLOBAL COMBAT LEADERBOARD
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              HALL OF CHAMPIONS
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Verified high scores across Cold Pressed Combat and the 7x7 Supply Drop Matrix. Earn tactical rating by breaking records.
            </p>
          </div>

          {/* User Personal Stat Card */}
          <div
            id="personal-best-card"
            className="flex items-center gap-4 bg-slate-950/80 border border-slate-700/80 p-4 rounded-xl shadow-inner min-w-[280px]"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400">OPERATIVE BESTS ({currentUser.callsign})</div>
              <div className="flex items-center gap-3 mt-1 text-xs font-medium">
                <span className="text-orange-400 flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5" /> {personalBests.codePressed} pts
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <Dices className="w-3.5 h-3.5" /> {personalBests.slotsUp} cr
                </span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                Rating: {currentUser.rating || 1000} ({currentUser.rank || 'Operative'})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div
        id="leaderboard-controls"
        className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-3 md:p-4 rounded-xl border border-slate-800"
      >
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            id="tab-filter-all"
            onClick={() => {
              playTacticalSound('switch');
              setSelectedFilter('all');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            ALL OPERATIONS
          </button>
          <button
            id="tab-filter-cold-pressed"
            onClick={() => {
              playTacticalSound('switch');
              setSelectedFilter('code-pressed');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedFilter === 'code-pressed'
                ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            COLD PRESSED ARENA
          </button>
          <button
            id="tab-filter-slots"
            onClick={() => {
              playTacticalSound('switch');
              setSelectedFilter('slots-up');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              selectedFilter === 'slots-up'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            7x7 SUPPLY MATRIX
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="leaderboard-search-input"
            type="text"
            placeholder="Search oper callsign / UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Top 3 Podium (when available) */}
      {topThree.length >= 3 && !searchQuery && (
        <div id="podium-section" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Silver #2 */}
          <div
            id="podium-rank-2"
            className="relative bg-slate-900/80 border border-slate-700 rounded-xl p-5 flex flex-col items-center text-center order-2 md:order-1"
          >
            <div className="w-10 h-10 rounded-full bg-slate-300/20 border border-slate-300 text-slate-300 flex items-center justify-center font-black text-sm mb-3">
              #2
            </div>
            <div className="text-xs font-mono text-slate-400">{topThree[1].userUid}</div>
            <div className="text-base font-bold text-white mt-1">{topThree[1].userCallsign}</div>
            <div className="text-2xl font-black text-slate-200 mt-2 font-mono">
              {topThree[1].score.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">{topThree[1].gameName}</div>
            <div className="mt-3 text-[11px] text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md w-full truncate">
              {topThree[1].details}
            </div>
          </div>

          {/* Gold #1 */}
          <div
            id="podium-rank-1"
            className="relative bg-gradient-to-b from-amber-950/40 to-slate-900/90 border-2 border-amber-500/70 rounded-xl p-6 flex flex-col items-center text-center order-1 md:order-2 shadow-lg shadow-amber-500/10"
          >
            <div className="absolute -top-3 px-3 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-black tracking-widest rounded-full uppercase flex items-center gap-1 shadow">
              <Crown className="w-3 h-3" /> APEX CHAMPION
            </div>
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 text-amber-400 flex items-center justify-center font-black text-base mb-3 mt-1 shadow-inner">
              #1
            </div>
            <div className="text-xs font-mono text-amber-400/80">{topThree[0].userUid}</div>
            <div className="text-lg font-black text-white mt-1">{topThree[0].userCallsign}</div>
            <div className="text-3xl font-black text-amber-400 mt-2 font-mono">
              {topThree[0].score.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-amber-300 mt-1">{topThree[0].gameName}</div>
            <div className="mt-3 text-[11px] text-amber-200/90 bg-slate-950/90 border border-amber-500/30 px-3 py-1 rounded-md w-full truncate font-mono">
              {topThree[0].details}
            </div>
          </div>

          {/* Bronze #3 */}
          <div
            id="podium-rank-3"
            className="relative bg-slate-900/80 border border-amber-800/40 rounded-xl p-5 flex flex-col items-center text-center order-3"
          >
            <div className="w-10 h-10 rounded-full bg-amber-700/20 border border-amber-600 text-amber-600 flex items-center justify-center font-black text-sm mb-3">
              #3
            </div>
            <div className="text-xs font-mono text-slate-400">{topThree[2].userUid}</div>
            <div className="text-base font-bold text-white mt-1">{topThree[2].userCallsign}</div>
            <div className="text-2xl font-black text-amber-600 mt-2 font-mono">
              {topThree[2].score.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">{topThree[2].gameName}</div>
            <div className="mt-3 text-[11px] text-slate-500 bg-slate-950 px-2.5 py-1 rounded-md w-full truncate">
              {topThree[2].details}
            </div>
          </div>
        </div>
      )}

      {/* Main Leaderboard Table */}
      <div
        id="leaderboard-table-card"
        className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-xl"
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <Medal className="w-4 h-4 text-amber-400" />
            RECORDED BATTLE TRANSMISSIONS ({filteredScores.length})
          </div>
          <div className="text-xs text-slate-500 font-mono">ENCRYPTED CLEARANCE</div>
        </div>

        {filteredScores.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div className="text-base font-bold text-slate-300">No high scores found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Launch a battle station game to record the first high score entry for this sector!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 w-16">Rank</th>
                  <th className="py-3 px-4">Operative</th>
                  <th className="py-3 px-4">Game / Operation</th>
                  <th className="py-3 px-4 text-right">Score / Credits</th>
                  <th className="py-3 px-4">Operation Details</th>
                  <th className="py-3 px-4 text-right">Date Recorded</th>
                  <th className="py-3 px-4 text-center w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredScores.map((scoreItem, idx) => {
                  const isCurrentUser = scoreItem.userId === currentUser.id;
                  return (
                    <tr
                      key={scoreItem.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCurrentUser ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold">
                        {idx === 0 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs">
                            1
                          </span>
                        ) : idx === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-black text-xs">
                            2
                          </span>
                        ) : idx === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-500">#{idx + 1}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {scoreItem.userCallsign}
                            {isCurrentUser && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">{scoreItem.userUid}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {scoreItem.gameId === 'code-pressed' ? (
                            <span className="p-1 rounded bg-orange-500/20 text-orange-400">
                              <Swords className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                              <Dices className="w-3.5 h-3.5" />
                            </span>
                          )}
                          <span className="font-medium text-slate-200">{scoreItem.gameName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-black font-mono text-sm ${
                            scoreItem.gameId === 'code-pressed' ? 'text-orange-400' : 'text-cyan-400'
                          }`}
                        >
                          {scoreItem.score.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-400">
                        {scoreItem.details}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-[11px]">
                        {formatDate(scoreItem.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            playTacticalSound('launch');
                            onLaunchGame(scoreItem.gameId);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-3 h-3" /> Play
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Launch Cards */}
      <div id="leaderboard-quick-launch" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-orange-950/30 to-slate-900 p-5 rounded-xl border border-orange-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-mono text-orange-400 font-bold">ARCADE CHALLENGE</div>
            <div className="text-base font-bold text-white">Cold Pressed Combat Arena</div>
            <p className="text-xs text-slate-400">Test your reaction time, dodge hazard triggers, and set new level records.</p>
          </div>
          <button
            id="challenge-cold-pressed-btn"
            onClick={() => {
              playTacticalSound('launch');
              onLaunchGame('code-pressed');
            }}
            className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer shadow"
          >
            <Swords className="w-4 h-4" /> Deploy
          </button>
        </div>

        <div className="bg-gradient-to-r from-cyan-950/30 to-slate-900 p-5 rounded-xl border border-cyan-500/30 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-mono text-cyan-400 font-bold">SUPPLY RE-ROLL</div>
            <div className="text-base font-bold text-white">7x7 Supply Drop Matrix</div>
            <p className="text-xs text-slate-400">Roll 7x7 reels, trigger multi-line anchors, and unlock the progressive bonus pot.</p>
          </div>
          <button
            id="challenge-slots-btn"
            onClick={() => {
              playTacticalSound('launch');
              onLaunchGame('slots-up');
            }}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 cursor-pointer shadow"
          >
            <Dices className="w-4 h-4" /> Spin
          </button>
        </div>
      </div>
    </div>
  );
}
