'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Radio,
  Send,
  Image as ImageIcon,
  X,
  Flame,
  Crosshair,
  Shield,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Upload,
  Maximize2,
  MessageSquare,
  Sparkles,
  Info,
  Clock,
  Layers,
  Terminal,
  ZoomIn
} from 'lucide-react';
import { User, IntelThread, IntelPost } from '@/lib/types';
import {
  getIntelThreads,
  getPostsForThread,
  getAllPosts,
  getUserPostInThread,
  createOrUpdateIntelPost,
  deleteIntelPost,
  togglePostReaction
} from '@/lib/db';

interface IntelPostsViewProps {
  currentUser: User;
  playTacticalSound: (type: 'click' | 'menu' | 'launch' | 'switch' | 'success' | 'alert') => void;
}

export default function IntelPostsView({
  currentUser,
  playTacticalSound
}: IntelPostsViewProps) {
  const [threads, setThreads] = useState<IntelThread[]>(() => {
    if (typeof window !== 'undefined') {
      return getIntelThreads();
    }
    return [];
  });
  const [activeThreadId, setActiveThreadId] = useState<string>('verdansk-intel-drop');
  const [allPosts, setAllPosts] = useState<IntelPost[]>(() => {
    if (typeof window !== 'undefined') {
      return getAllPosts();
    }
    return [];
  });
  
  // New Post Form
  const [postContent, setPostContent] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Image Modal / Lightbox
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; callsign: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = React.useCallback(() => {
    setThreads(getIntelThreads());
    setAllPosts(getAllPosts());
  }, []);

  useEffect(() => {
    const handleDbUpdate = () => {
      loadData();
    };
    window.addEventListener('firestorm_db_updated', handleDbUpdate);
    return () => window.removeEventListener('firestorm_db_updated', handleDbUpdate);
  }, [loadData]);

  const activeThread = useMemo(() => {
    return threads.find((t) => t.id === activeThreadId) || threads[0];
  }, [threads, activeThreadId]);

  const threadPosts = useMemo(() => {
    return allPosts.filter((p) => p.threadId === activeThreadId);
  }, [allPosts, activeThreadId]);

  // Check if current user already has a post in this active thread (1 post per thread rule)
  const existingUserPostInActiveThread = useMemo(() => {
    if (!currentUser) return null;
    return threadPosts.find((p) => p.userId === currentUser.id) || null;
  }, [threadPosts, currentUser]);

  // Auto-fill editor if user is editing their existing post
  const handleEditExistingPost = (post: IntelPost) => {
    playTacticalSound('click');
    setPostContent(post.content);
    if (post.imageBase64) {
      setImageBase64(post.imageBase64);
      setImageName(post.imageName || 'attached_intel.png');
    } else {
      setImageBase64(null);
      setImageName('');
    }
    setFormFeedback({
      type: 'success',
      message: 'Editing your active transmission in this thread. Updating will replace your briefing.'
    });
  };

  // Convert File to Base64 String
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormFeedback({
        type: 'error',
        message: 'Invalid file format. Only image files (PNG, JPG, SVG, WebP) are authorized.'
      });
      return;
    }

    // Limit image size to 2.5MB for fast client-side localStorage performance
    if (file.size > 2.5 * 1024 * 1024) {
      setFormFeedback({
        type: 'error',
        message: 'Image size exceeds tactical bandwidth limit (2.5MB max).'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageBase64(result);
        setImageName(file.name);
        setFormFeedback(null);
        playTacticalSound('success');
      }
    };
    reader.onerror = () => {
      setFormFeedback({
        type: 'error',
        message: 'Failed to encode tactical image to Base64 data.'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    setImageName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    playTacticalSound('click');
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!postContent.trim()) {
      setFormFeedback({
        type: 'error',
        message: 'Please write a message for the tactical briefing.'
      });
      playTacticalSound('alert');
      return;
    }

    setIsSubmitting(true);

    const res = createOrUpdateIntelPost(
      activeThreadId,
      postContent,
      imageBase64 || undefined,
      imageName || undefined,
      currentUser
    );

    setIsSubmitting(false);

    if (res.success) {
      playTacticalSound('success');
      setFormFeedback({
        type: 'success',
        message: res.message
      });
      setPostContent('');
      setImageBase64(null);
      setImageName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadData();
    } else {
      playTacticalSound('alert');
      setFormFeedback({
        type: 'error',
        message: res.message
      });
    }
  };

  const handleDeletePost = (postId: string) => {
    if (!currentUser) return;
    playTacticalSound('alert');
    const res = deleteIntelPost(postId, currentUser.id);
    if (res.success) {
      setFormFeedback({
        type: 'success',
        message: res.message
      });
      loadData();
    } else {
      setFormFeedback({
        type: 'error',
        message: res.message
      });
    }
  };

  const handleReaction = (postId: string, reactionType: 'fire' | 'target' | 'shield') => {
    if (!currentUser) return;
    playTacticalSound('click');
    togglePostReaction(postId, reactionType, currentUser.id);
    loadData();
  };

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
      return 'Just now';
    }
  };

  return (
    <div id="intel-posts-page-container" className="w-full space-y-6">
      {/* Header Banner */}
      <div
        id="intel-feed-header"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950/40 p-6 md:p-8 border border-orange-500/30 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-mono font-bold tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            COMMUNITY TACTICAL COMMS
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            TACTICAL INTEL &amp; PUBLIC FEEDS
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            CoD Warzone &amp; Fortnite Battle Royale community threads. Operatives are authorized for <strong>1 transmission per thread</strong> with <strong>1 tactical image attachment</strong>.
          </p>
        </div>
      </div>

      {/* Thread Category Tabs */}
      <div id="threads-tab-bar" className="space-y-2">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-orange-400" />
          SELECT ACTIVE MISSION THREAD
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {threads.map((t) => {
            const isActive = t.id === activeThreadId;
            return (
              <button
                key={t.id}
                id={`thread-tab-${t.id}`}
                onClick={() => {
                  playTacticalSound('switch');
                  setActiveThreadId(t.id);
                  setFormFeedback(null);
                }}
                className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 border-orange-500/80 shadow-lg shadow-orange-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">
                    {t.callsignTag}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700 font-mono text-orange-400">
                    {t.postCount || 0} msgs
                  </span>
                </div>
                <div className={`font-bold text-sm mt-1.5 ${isActive ? 'text-orange-400' : 'text-white'}`}>
                  {t.title}
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{t.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout: Active Thread Posts + Transmission Dispatch Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Posts Feed (8 Cols) */}
        <div id="thread-messages-column" className="lg:col-span-7 space-y-4">
          {/* Active Thread Banner */}
          {activeThread && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-mono text-orange-400 font-bold tracking-wider">
                  CURRENT CHANNEL: {activeThread.badge}
                </div>
                <div className="text-base font-bold text-white mt-0.5">{activeThread.title}</div>
                <div className="text-xs text-slate-400 mt-1">{activeThread.briefing}</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {threadPosts.length} Transmission{threadPosts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Posts List */}
          {threadPosts.length === 0 ? (
            <div
              id="empty-posts-state"
              className="bg-slate-900/60 border border-dashed border-slate-800 rounded-xl p-12 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-slate-300">No intel transmissions yet</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Be the first operative to dispatch recon info, weapon tuning, or screenshot debriefs in this thread!
              </p>
            </div>
          ) : (
            <div id="posts-list-wrapper" className="space-y-4">
              {threadPosts.map((post) => {
                const isOwnPost = currentUser && post.userId === currentUser.id;
                const hasReactedFire = post.reactions.usersReacted?.fire?.includes(currentUser.id);
                const hasReactedTarget = post.reactions.usersReacted?.target?.includes(currentUser.id);
                const hasReactedShield = post.reactions.usersReacted?.shield?.includes(currentUser.id);

                return (
                  <div
                    key={post.id}
                    id={`post-card-${post.id}`}
                    className={`bg-slate-900/90 border rounded-xl p-5 space-y-4 shadow-lg transition-all ${
                      isOwnPost
                        ? 'border-amber-500/60 bg-gradient-to-b from-amber-950/20 to-slate-900/90'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Post Header */}
                    <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center font-black text-xs text-orange-400 font-mono">
                          {post.userCallsign.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{post.userCallsign}</span>
                            {isOwnPost && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono">
                                YOUR BRIEFING
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 font-mono">
                              ({post.userRank || 'Operative'})
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                            UID: {post.userUid} • {formatDate(post.createdAt)}
                            {post.updatedAt && ' (Edited)'}
                          </div>
                        </div>
                      </div>

                      {/* Own Post Actions */}
                      {isOwnPost && (
                        <div className="flex items-center gap-1">
                          <button
                            id={`edit-post-btn-${post.id}`}
                            onClick={() => handleEditExistingPost(post)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs transition-all cursor-pointer"
                            title="Edit your single transmission in this thread"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-post-btn-${post.id}`}
                            onClick={() => handleDeletePost(post.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500 hover:text-white text-slate-400 text-xs transition-all cursor-pointer"
                            title="Delete this transmission"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                      {post.content}
                    </div>

                    {/* Decoded Base64 Image Attachment */}
                    {post.imageBase64 && (
                      <div className="space-y-1.5">
                        <div className="relative rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={post.imageBase64}
                            alt={post.imageName || 'Tactical Attachment'}
                            className="w-full max-h-96 object-contain bg-slate-950 cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() =>
                              setLightboxImage({
                                src: post.imageBase64!,
                                title: post.imageName || 'Tactical Image Preview',
                                callsign: post.userCallsign
                              })
                            }
                          />
                          <button
                            onClick={() =>
                              setLightboxImage({
                                src: post.imageBase64!,
                                title: post.imageName || 'Tactical Image Preview',
                                callsign: post.userCallsign
                              })
                            }
                            className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-slate-950/80 hover:bg-orange-500 hover:text-slate-950 text-white text-[11px] font-mono flex items-center gap-1 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <ZoomIn className="w-3 h-3" /> Zoom Preview
                          </button>
                        </div>
                        {post.imageName && (
                          <div className="text-[11px] font-mono text-slate-500 truncate flex items-center gap-1.5">
                            <ImageIcon className="w-3 h-3 text-orange-400" />
                            {post.imageName} (Base64 Decoded)
                          </div>
                        )}
                      </div>
                    )}

                    {/* Reactions & Engagement HUD */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                      <button
                        id={`react-fire-btn-${post.id}`}
                        onClick={() => handleReaction(post.id, 'fire')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          hasReactedFire
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${hasReactedFire ? 'fill-red-400' : ''}`} />
                        <span>{post.reactions.fire || 0}</span>
                      </button>

                      <button
                        id={`react-target-btn-${post.id}`}
                        onClick={() => handleReaction(post.id, 'target')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          hasReactedTarget
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                        }`}
                      >
                        <Crosshair className="w-3.5 h-3.5" />
                        <span>{post.reactions.target || 0}</span>
                      </button>

                      <button
                        id={`react-shield-btn-${post.id}`}
                        onClick={() => handleReaction(post.id, 'shield')}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          hasReactedShield
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>{post.reactions.shield || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Dispatch Transmission Box (5 Cols) */}
        <div id="dispatch-transmission-column" className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <div
            id="dispatch-form-card"
            className="bg-slate-900/95 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-sm text-white uppercase tracking-wider font-mono">
                  {existingUserPostInActiveThread ? 'UPDATE YOUR BRIEFING' : 'DISPATCH TRANSMISSION'}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
                1 POST / THREAD
              </span>
            </div>

            {/* Operational Rules Info Note */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
              <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <strong>Tactical Protocol:</strong> Each operative may hold <strong>1 active message per thread</strong>. You can attach <strong>1 image</strong> which is stored in Base64 encoding.
              </div>
            </div>

            {/* Feedback message */}
            {formFeedback && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  formFeedback.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/60 border border-red-500/40 text-red-300'
                }`}
              >
                {formFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{formFeedback.message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 flex justify-between">
                  <span>MESSAGE BRIEFING</span>
                  <span className="text-slate-500">{postContent.length}/600 chars</span>
                </label>
                <textarea
                  id="post-content-textarea"
                  rows={4}
                  maxLength={600}
                  placeholder={`Share class setups, drop routes, or clutch strategies for ${activeThread?.title}...`}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
                />
              </div>

              {/* Single Image Attachment (Drag & Drop or Manual Picker) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                    IMAGE ATTACHMENT (1 MAX • BASE64)
                  </span>
                  {imageBase64 && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-[11px] text-red-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </label>

                {imageBase64 ? (
                  <div className="relative p-2 bg-slate-950 border border-slate-700 rounded-lg space-y-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageBase64}
                      alt="Uploaded preview"
                      className="w-full h-36 object-contain rounded bg-slate-900"
                    />
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                      <span className="truncate max-w-[200px]">{imageName}</span>
                      <span className="text-emerald-400 font-bold">BASE64 READY</span>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-slate-700 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-950'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                    <div className="text-xs font-bold text-slate-300">
                      Drop tactical screenshot here or <span className="text-orange-400 underline">browse</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">PNG, JPG, SVG up to 2.5MB</div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                id="submit-intel-post-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-slate-950 text-xs font-black tracking-wider uppercase transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {existingUserPostInActiveThread ? 'Update Thread Briefing' : 'Dispatch Transmission'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Image Modal */}
      {lightboxImage && (
        <div
          id="intel-lightbox-modal"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl p-4 flex flex-col items-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="text-xs font-mono text-slate-300 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-orange-400" />
                <span>{lightboxImage.title}</span>
                <span className="text-slate-500">• Posted by {lightboxImage.callsign}</span>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-full flex items-center justify-center overflow-auto max-h-[75vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
