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
  ShieldCheck,
  Clock,
  User as UserIcon,
  Flame,
  Boxes,
  Shield
} from 'lucide-react';
import { User, GameHighScore } from '@/lib/types';
import { getHighScores, getUserPersonalBests } from '@/lib/db';

interface HighScoresViewProps {
  currentUser: User;
  onLaunchGame: (stationId: string) => void;
  playTacticalSound: (type: 'click' | 'menu' | 'launch' | 'switch' | 'success' | 'alert') => void;
}

type GameFilter = 'all' | 'rpg-game' | 'block-drop' | 'code-pressed' | 'slots-up';

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
  const [personalBests, setPersonalBests] = useState<{ codePressed: number; slotsUp: number; blockDrop: number; rpgGame: number }>(() => {
    if (typeof window !== 'undefined' && currentUser) {
      return getUserPersonalBests(currentUser.id);
    }
    return { codePressed: 0, slotsUp: 0, blockDrop: 0, rpgGame: 0 };
  });

  const loadData = React.useCallback(() => {
    setScores(getHighScores());
    if (currentUser) {
      setPersonalBests(getUserPersonalBests(currentUser.id));
    }
  }, [currentUser]);

  useEffect(() => {
    const handleDbUpdate = () => {
      loadData();
    };
    window.addEventListener('firestorm_db_updated', handleDbUpdate);
    return () => window.removeEventListener('firestorm_db_updated', handleDbUpdate);
  }, [loadData]);

  const filteredScores = useMemo(() => {
    const list = scores
      .filter((s) => {
        if (selectedFilter === 'rpg-game' && s.gameId !== 'rpg-game') return false;
        if (selectedFilter === 'block-drop' && s.gameId !== 'block-drop') return false;
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

    // Enforce strictly 1 high score record per user
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
    <div id="high-scores-page-container" className="w-full space-y-6 font-sans">
      {/* Header Banner */}
      <div
        id="leaderboard-header"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 md:p-8 border border-blue-700/50 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboards</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              High Scores
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Official player rankings for Realm of Champions 3D, Block Drop Matrix, Reaction Challenge, and Supply Grid. Scores sync automatically when you finish a game.
            </p>
          </div>

          {/* User Personal Stat Card */}
          <div
            id="personal-best-card"
            className="flex items-center gap-4 bg-slate-900 border border-slate-750 p-4 rounded-xl shadow-md min-w-[320px]"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-slate-400">Personal Bests</div>
              <div className="flex flex-wrap items-center gap-2.5 mt-1 text-xs font-semibold">
                <span className="text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> {personalBests.rpgGame} pts
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-cyan-400 flex items-center gap-1">
                  <Boxes className="w-3.5 h-3.5" /> {personalBests.blockDrop} pts
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-orange-400 flex items-center gap-1">
                  <Swords className="w-3.5 h-3.5" /> {personalBests.codePressed} pts
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Dices className="w-3.5 h-3.5" /> {personalBests.slotsUp} cr
                </span>
              </div>
              <div className="text-xs text-blue-400 mt-1 font-bold">
                Player: {currentUser.callsign} ({currentUser.id})
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {filteredScores.length >= 1 && (
        <div id="leaderboard-podium" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((item, index) => {
            const isRank1 = index === 0;
            const isRank2 = index === 1;
            const isRank3 = index === 2;

            let badgeColor = 'from-amber-500/20 to-amber-900/40 border-amber-500/50 text-amber-300';
            let iconColor = 'text-amber-400';
            let medalText = '1st Place';

            if (isRank2) {
              badgeColor = 'from-slate-700/30 to-slate-800/40 border-slate-500/50 text-slate-200';
              iconColor = 'text-slate-300';
              medalText = '2nd Place';
            } else if (isRank3) {
              badgeColor = 'from-orange-700/20 to-orange-950/40 border-orange-600/40 text-orange-300';
              iconColor = 'text-orange-400';
              medalText = '3rd Place';
            }

            const isUser = currentUser && (item.userId === currentUser.id || item.userUid === currentUser.id);

            return (
              <div
                key={item.id}
                id={`podium-card-${index + 1}`}
                className={`relative overflow-hidden rounded-2xl p-5 border bg-gradient-to-b ${badgeColor} transition-all shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Medal className={`w-5 h-5 ${iconColor}`} />
                    <span className="text-xs font-bold uppercase tracking-wider">{medalText}</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300">
                    {item.gameId === 'rpg-game' ? '3D Action RPG' : item.gameId === 'block-drop' ? 'Block Drop' : item.gameId === 'code-pressed' ? 'Reaction' : 'Supply'}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-base">
                    {item.userCallsign.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base">{item.userCallsign}</span>
                      {isUser && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{item.userUid || item.userId}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-end justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Score Record</div>
                    <div className="text-2xl font-bold text-white tracking-tight">
                      {item.score.toLocaleString()} <span className="text-xs font-normal text-slate-400">pts</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatDate(item.createdAt)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        id="leaderboard-controls"
        className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md"
      >
        {/* Game Type Filter Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            id="filter-all-btn"
            type="button"
            onClick={() => {
              setSelectedFilter('all');
              playTacticalSound('switch');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-755'
            }`}
          >
            All Games
          </button>

          <button
            id="filter-rpg-btn"
            type="button"
            onClick={() => {
              setSelectedFilter('rpg-game');
              playTacticalSound('switch');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedFilter === 'rpg-game'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Realm of Champions 3D</span>
          </button>

          <button
            id="filter-block-drop-btn"
            type="button"
            onClick={() => {
              setSelectedFilter('block-drop');
              playTacticalSound('switch');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedFilter === 'block-drop'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Block Drop</span>
          </button>

          <button
            id="filter-reaction-btn"
            type="button"
            onClick={() => {
              setSelectedFilter('code-pressed');
              playTacticalSound('switch');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedFilter === 'code-pressed'
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Reaction Challenge</span>
          </button>

          <button
            id="filter-supply-btn"
            type="button"
            onClick={() => {
              setSelectedFilter('slots-up');
              playTacticalSound('switch');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedFilter === 'slots-up'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-750'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Supply Grid</span>
          </button>
        </div>

        {/* Search Field */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="score-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div
        id="leaderboard-table-container"
        className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-850 text-slate-400 uppercase font-bold text-[11px] tracking-wider">
                <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                <th className="py-3.5 px-4">Player</th>
                <th className="py-3.5 px-4">Game</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Details</th>
                <th className="py-3.5 px-4 text-right">Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredScores.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    No scores recorded yet. Be the first to play and set a record!
                  </td>
                </tr>
              ) : (
                filteredScores.map((item, idx) => {
                  const rank = idx + 1;
                  const isUser = currentUser && (item.userId === currentUser.id || item.userUid === currentUser.id);

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isUser
                          ? 'bg-blue-950/40 hover:bg-blue-900/40'
                          : 'hover:bg-slate-800/60'
                      }`}
                    >
                      {/* Rank Number */}
                      <td className="py-3.5 px-4 text-center font-bold">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-black text-xs font-bold">
                            1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-400 text-black text-xs font-bold">
                            2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-600 text-white text-xs font-bold">
                            3
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">{rank}</span>
                        )}
                      </td>

                      {/* Player Username & ID */}
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>{item.userCallsign}</span>
                          {isUser && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-normal">
                          {item.userUid || item.userId}
                        </div>
                      </td>

                      {/* Game Name */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-200">
                          {item.gameId === 'rpg-game' ? (
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          ) : item.gameId === 'block-drop' ? (
                            <Boxes className="w-3.5 h-3.5 text-cyan-400" />
                          ) : item.gameId === 'code-pressed' ? (
                            <Swords className="w-3.5 h-3.5 text-orange-400" />
                          ) : (
                            <Dices className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                          <span>{item.gameName}</span>
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4 font-bold text-white text-sm">
                        <span className="text-blue-400">{item.score.toLocaleString()}</span>
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-4 text-slate-300 hidden md:table-cell text-xs">
                        {item.details || 'Standard match completion'}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right text-slate-400 text-xs">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Launch CTA Banner */}
      <div
        id="leaderboard-cta-banner"
        className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Ready to climb the ranks?
            </h3>
            <p className="text-xs text-slate-300">
              Jump into Block Drop Matrix, Reaction Challenge, or Supply Grid to record your new high score.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          <button
            id="cta-launch-block-drop"
            type="button"
            onClick={() => onLaunchGame('block-drop')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Block Drop</span>
          </button>

          <button
            id="cta-launch-reaction"
            type="button"
            onClick={() => onLaunchGame('code-pressed')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Reaction</span>
          </button>

          <button
            id="cta-launch-supply"
            type="button"
            onClick={() => onLaunchGame('slots-up')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Play Supply</span>
          </button>
        </div>
      </div>
    </div>
  );
}
