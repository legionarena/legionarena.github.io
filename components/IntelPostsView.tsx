'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Send,
  Image as ImageIcon,
  X,
  Flame,
  Shield,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Upload,
  Maximize2,
  MessageSquare,
  Sparkles,
  Clock,
  ThumbsUp,
  Award,
  Gamepad2,
  Radio,
  FileImage
} from 'lucide-react';
import { User, IntelThread, IntelPost } from '@/lib/types';
import {
  getIntelThreads,
  getAllPosts,
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
  const [activeThreadId, setActiveThreadId] = useState<string>('general-gaming-lounge');
  const [allPosts, setAllPosts] = useState<IntelPost[]>(() => {
    if (typeof window !== 'undefined') {
      return getAllPosts();
    }
    return [];
  });
  
  // Post Form State
  const [postContent, setPostContent] = useState<string>('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('');
  const [formFeedback, setFormFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Lightbox Modal State
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; callsign: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadData = React.useCallback(() => {
    const ths = getIntelThreads();
    setThreads(ths);
    setAllPosts(getAllPosts());
    if (ths.length > 0 && !ths.some(t => t.id === activeThreadId)) {
      setActiveThreadId(ths[0].id);
    }
  }, [activeThreadId]);

  useEffect(() => {
    const handleDbUpdate = () => {
      loadData();
    };
    window.addEventListener('firestorm_db_updated', handleDbUpdate);
    return () => window.removeEventListener('firestorm_db_updated', handleDbUpdate);
  }, [loadData]);

  const activeThread = useMemo(() => {
    return threads.find((t) => t.id === activeThreadId) || threads[0] || {
      id: 'general-gaming-lounge',
      name: 'General Gaming Hub',
      category: 'General Discussion',
      description: 'Connect with fellow players, share setup photos, and discuss tournaments.'
    };
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
      setImageName(post.imageName || 'attached_image.png');
    } else {
      setImageBase64(null);
      setImageName('');
    }
    setFormFeedback({
      type: 'success',
      message: 'Editing your post in this thread. Submitting will update your existing message.'
    });
  };

  // Convert File to Base64 String
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFormFeedback({
        type: 'error',
        message: 'Invalid file format. Please upload PNG, JPG, SVG, or WebP images.'
      });
      return;
    }

    if (file.size > 2.5 * 1024 * 1024) {
      setFormFeedback({
        type: 'error',
        message: 'Image size exceeds maximum allowed limit (2.5MB max).'
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
        message: 'Failed to read image file.'
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

  // Drag & drop file upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
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

  // Handle Post Submit (Create or Update)
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormFeedback(null);

    if (!postContent.trim()) {
      setFormFeedback({
        type: 'error',
        message: 'Please write a message before posting.'
      });
      playTacticalSound('alert');
      return;
    }

    setIsSubmitting(true);

    try {
      const savedPost = createOrUpdateIntelPost(
        activeThreadId,
        currentUser,
        postContent.trim(),
        imageBase64 || undefined,
        imageName || undefined
      );

      setIsSubmitting(false);
      setPostContent('');
      setImageBase64(null);
      setImageName('');
      setFormFeedback({
        type: 'success',
        message: existingUserPostInActiveThread ? 'Post updated successfully!' : 'Post published to the community thread!'
      });
      playTacticalSound('success');
      loadData();
    } catch {
      setIsSubmitting(false);
      setFormFeedback({
        type: 'error',
        message: 'An error occurred while saving your post.'
      });
      playTacticalSound('alert');
    }
  };

  // Handle Post Delete
  const handleDeletePost = (postId: string) => {
    playTacticalSound('click');
    const res = deleteIntelPost(postId, currentUser.id);
    if (res.success) {
      setFormFeedback({
        type: 'success',
        message: 'Post deleted successfully.'
      });
      loadData();
    } else {
      setFormFeedback({
        type: 'error',
        message: res.message
      });
      playTacticalSound('alert');
    }
  };

  // Handle Reactions (Fire, Target, Shield)
  const handleReactionClick = (postId: string, reactionType: 'fire' | 'target' | 'shield') => {
    playTacticalSound('click');
    togglePostReaction(postId, currentUser.id, reactionType);
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
    <div id="intel-posts-container" className="w-full space-y-6 font-sans">
      {/* Header Banner */}
      <div
        id="intel-posts-header"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 border border-indigo-700/50 shadow-xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Community Threads</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Community Posts
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Share game setups, arcade records, gameplay tips, and tournament strategies with the PlayStorm community.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 border border-slate-750 p-4 rounded-xl shadow-md min-w-[240px]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase">Posting Rule</div>
              <div className="text-xs font-semibold text-white mt-0.5">1 Post Per Thread</div>
              <div className="text-[11px] text-slate-400">Edit or replace anytime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Threads List & Right Thread Posts & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Thread Categories */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Thread Channels
          </div>

          <div className="space-y-2">
            {threads.map((thread) => {
              const isSelected = thread.id === activeThreadId;
              const postCount = allPosts.filter((p) => p.threadId === thread.id).length;

              return (
                <button
                  key={thread.id}
                  id={`thread-select-${thread.id}`}
                  type="button"
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setFormFeedback(null);
                    playTacticalSound('switch');
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-indigo-500 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-950 border border-indigo-500/30">
                      {thread.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {postCount} {postCount === 1 ? 'post' : 'posts'}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-white">{thread.name}</div>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {thread.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Thread Posts + Composer */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Thread Banner */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Current Channel
              </span>
              <span className="text-xs text-slate-400">
                {threadPosts.length} total messages
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{activeThread.name}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{activeThread.description}</p>
          </div>

          {/* Post Composer Form (1 Post Per User Enforced) */}
          <div
            id="intel-post-composer-card"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 text-xs font-bold">
                  {currentUser.callsign.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-xs font-bold text-white">
                    {existingUserPostInActiveThread ? 'Update Your Post' : 'Create New Post'}
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Posting as: {currentUser.callsign} ({currentUser.id})
                  </span>
                </div>
              </div>

              {existingUserPostInActiveThread && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40">
                  Replacing Existing Post
                </span>
              )}
            </div>

            {/* Feedback Alert */}
            {formFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
                  formFeedback.type === 'success'
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
                    : 'bg-red-950/80 border-red-500/50 text-red-200'
                }`}
              >
                {formFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                )}
                <span>{formFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handlePostSubmit} className="space-y-3.5">
              <textarea
                id="post-content-textarea"
                rows={3}
                required
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share your thoughts, tips, or tournament feedback with players..."
                className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed transition-colors"
              />

              {/* Image Preview if selected */}
              {imageBase64 && (
                <div className="relative rounded-xl border border-slate-700 bg-slate-800 p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={imageBase64}
                      alt="Upload Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-700"
                    />
                    <div>
                      <div className="text-xs font-bold text-white truncate max-w-xs">
                        {imageName || 'Attached Image'}
                      </div>
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ready to upload</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setImageBase64(null);
                      setImageName('');
                      playTacticalSound('click');
                    }}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-red-900/60 text-slate-300 hover:text-red-200 transition-colors cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Drag and Drop Area / Controls */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`p-3 rounded-xl border border-dashed transition-all flex flex-wrap items-center justify-between gap-3 ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-950/30'
                    : 'border-slate-700 bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileImage className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="hidden sm:inline">Drag image here or select manually</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    id="attach-image-btn"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Upload Image</span>
                  </button>

                  <button
                    id="submit-post-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{existingUserPostInActiveThread ? 'Update Post' : 'Publish Post'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Posts Feed for this thread */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              <span>Thread Messages</span>
              <span>{threadPosts.length} posts</span>
            </div>

            {threadPosts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
                No posts in this channel yet. Be the first player to start the discussion!
              </div>
            ) : (
              threadPosts.map((post) => {
                const isAuthor = currentUser && (post.userId === currentUser.id || post.userUid === currentUser.id);
                const hasReactedFire = post.reactions.usersReacted.fire?.includes(currentUser.id);
                const hasReactedTarget = post.reactions.usersReacted.target?.includes(currentUser.id);
                const hasReactedShield = post.reactions.usersReacted.shield?.includes(currentUser.id);

                return (
                  <div
                    key={post.id}
                    id={`post-card-${post.id}`}
                    className={`rounded-2xl border p-5 space-y-4 shadow-lg transition-all ${
                      isAuthor
                        ? 'bg-slate-900 border-indigo-600/60'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md">
                          {post.userCallsign.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{post.userCallsign}</span>
                            {isAuthor && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span>{post.userUid || post.userId}</span>
                            <span>&bull;</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(post.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Author Actions */}
                      {isAuthor && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditExistingPost(post)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Edit Post"
                          >
                            <Edit3 className="w-4 h-4 text-indigo-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-200 transition-colors cursor-pointer"
                            title="Delete Post"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Post Body Content */}
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>

                    {/* Attached Image (if present) */}
                    {post.imageBase64 && (
                      <div className="rounded-xl overflow-hidden border border-slate-750 bg-slate-950 relative group">
                        <img
                          src={post.imageBase64}
                          alt={post.imageName || 'Post Attachment'}
                          className="w-full max-h-96 object-cover cursor-pointer transition-transform group-hover:scale-[1.01]"
                          onClick={() =>
                            setLightboxImage({
                              src: post.imageBase64!,
                              title: post.imageName || 'Attachment',
                              callsign: post.userCallsign
                            })
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setLightboxImage({
                              src: post.imageBase64!,
                              title: post.imageName || 'Attachment',
                              callsign: post.userCallsign
                            })
                          }
                          className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1 backdrop-blur-sm border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Full View</span>
                        </button>
                      </div>
                    )}

                    {/* Reaction Buttons */}
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReactionClick(post.id, 'fire')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          hasReactedFire
                            ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                            : 'bg-slate-800 border-slate-750 hover:bg-slate-750 text-slate-300'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${hasReactedFire ? 'fill-orange-400 text-orange-400' : 'text-orange-400'}`} />
                        <span>{post.reactions.fire}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReactionClick(post.id, 'target')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          hasReactedTarget
                            ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                            : 'bg-slate-800 border-slate-750 hover:bg-slate-750 text-slate-300'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${hasReactedTarget ? 'fill-blue-400 text-blue-400' : 'text-blue-400'}`} />
                        <span>{post.reactions.target}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleReactionClick(post.id, 'shield')}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          hasReactedShield
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-800 border-slate-750 hover:bg-slate-750 text-slate-300'
                        }`}
                      >
                        <Shield className={`w-3.5 h-3.5 ${hasReactedShield ? 'fill-emerald-400 text-emerald-400' : 'text-emerald-400'}`} />
                        <span>{post.reactions.shield}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Lightbox Modal */}
      {lightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image Preview"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            className="fixed inset-0 cursor-pointer"
            onClick={() => setLightboxImage(null)}
          />
          <div className="relative z-10 max-w-4xl w-full bg-slate-900 border border-slate-750 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">{lightboxImage.title}</h3>
                <p className="text-xs text-slate-400">Uploaded by {lightboxImage.callsign}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-slate-950 max-h-[75vh] overflow-hidden">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-850 flex justify-end">
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
