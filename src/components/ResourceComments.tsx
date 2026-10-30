'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useResources } from '@/context/ResourceContext';
import { ResourceComment, ResourceCommentAuthor } from '@/types';
import { formatCommentTimestamp } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/Modal';
import {
  MessageSquare,
  Send,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  LogIn,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
} from 'lucide-react';

const MAX_COMMENT_LENGTH = 2000;
const SESSION_STORAGE_KEY_PREFIX = 'gitnote_comments_fallback_';

interface ResourceCommentsProps {
  resourceId: string;
  resourceTitle?: string;
  onCommentCountChange?: (count: number) => void;
}

export const ResourceComments: React.FC<ResourceCommentsProps> = ({
  resourceId,
  resourceTitle,
  onCommentCountChange,
}) => {
  const { user } = useAuth();
  const { userProfile, addToast } = useResources();
  const pathname = usePathname();

  const [comments, setComments] = useState<ResourceComment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Edit State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete State
  const [commentToDelete, setCommentToDelete] = useState<ResourceComment | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Schema state tracking
  const [tableMissingNotice, setTableMissingNotice] = useState<boolean>(false);

  // Fallback storage key for seamless session resilience
  const sessionKey = useMemo(() => `${SESSION_STORAGE_KEY_PREFIX}${resourceId}`, [resourceId]);

  const sanitizeAvatar = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (typeof url === 'string' && url.includes('images.unsplash.com')) {
      return '/avatars/boy-1.svg';
    }
    return url;
  };

  const mapDbRowToComment = useCallback(
    (row: any, profileMap?: Record<string, any>): ResourceComment => {
      const uploaderProfile =
        row.author ||
        (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) ||
        (profileMap ? profileMap[row.user_id] : null);

      const authorName =
        uploaderProfile?.full_name ||
        (row.user_id === user?.id ? userProfile.name : 'Student Contributor');

      const authorAvatar = sanitizeAvatar(
        uploaderProfile?.avatar_url ||
          (row.user_id === user?.id ? userProfile.avatar : undefined)
      );

      const author: ResourceCommentAuthor = {
        id: row.user_id,
        name: authorName,
        avatar: authorAvatar,
        college: uploaderProfile?.college || 'SRMCEM Lucknow',
        branch: uploaderProfile?.branch || 'Computer Science & Engineering',
        semester: uploaderProfile?.semester || 'Semester 4',
        isVerified: Boolean(uploaderProfile?.is_verified),
      };

      return {
        id: row.id,
        resourceId: row.resource_id,
        userId: row.user_id,
        content: row.content,
        createdAt: row.created_at,
        updatedAt: row.updated_at || row.created_at,
        author,
      };
    },
    [user?.id, userProfile.name, userProfile.avatar]
  );

  // Load session fallback comments (used if table is missing or offline)
  const getSessionComments = useCallback((): ResourceComment[] => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = sessionStorage.getItem(sessionKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore storage access errors
    }
    return [];
  }, [sessionKey]);

  const saveSessionComments = useCallback(
    (list: ResourceComment[]) => {
      if (typeof window === 'undefined') return;
      try {
        sessionStorage.setItem(sessionKey, JSON.stringify(list));
      } catch {
        // ignore
      }
    },
    [sessionKey]
  );

  // Fetch comments for current resource
  const fetchComments = useCallback(async () => {
    if (!resourceId) return;
    setIsLoading(true);
    setSubmitError(null);

    if (!isSupabaseConfigured) {
      const local = getSessionComments();
      setComments(local);
      setIsLoading(false);
      return;
    }

    try {
      // Primary query with foreign key join to public.profiles
      const { data, error } = await supabase
        .from('resource_comments')
        .select(`
          id,
          resource_id,
          user_id,
          content,
          created_at,
          updated_at,
          author:profiles!user_id (
            id,
            full_name,
            avatar_url,
            college,
            branch,
            semester,
            is_verified
          )
        `)
        .eq('resource_id', resourceId)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist yet in the database schema cache (PGRST205)
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          setTableMissingNotice(true);
          const fallbackList = getSessionComments();
          setComments(fallbackList);
          setIsLoading(false);
          return;
        }

        // Secondary resilient fallback: query comments without relationship alias
        const fallbackRes = await supabase
          .from('resource_comments')
          .select('id, resource_id, user_id, content, created_at, updated_at')
          .eq('resource_id', resourceId)
          .order('created_at', { ascending: false });

        if (fallbackRes.error) {
          console.warn('[GitNote Comments] Could not fetch comments from Supabase:', fallbackRes.error.message);
          setComments(getSessionComments());
          setIsLoading(false);
          return;
        }

        const rawRows = fallbackRes.data || [];
        const userIds = Array.from(new Set(rawRows.map((r: any) => r.user_id).filter(Boolean)));
        let profileMap: Record<string, any> = {};

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, college, branch, semester, is_verified')
            .in('id', userIds);

          if (profiles) {
            profiles.forEach((p: any) => {
              profileMap[p.id] = p;
            });
          }
        }

        const mapped = rawRows.map((row: any) => mapDbRowToComment(row, profileMap));
        setComments(mapped);
      } else if (data) {
        setTableMissingNotice(false);
        const mapped = data.map((row: any) => mapDbRowToComment(row));
        setComments(mapped);
      }
    } catch (err: any) {
      console.error('[GitNote Comments] Unexpected error loading comments:', err);
      setComments(getSessionComments());
    } finally {
      setIsLoading(false);
    }
  }, [resourceId, mapDbRowToComment, getSessionComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Synchronize count with parent component
  useEffect(() => {
    if (onCommentCountChange) {
      onCommentCountChange(comments.length);
    }
  }, [comments.length, onCommentCountChange]);

  // Handle Post Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newComment.trim();

    if (!trimmed) {
      setSubmitError('Please enter a comment before posting.');
      return;
    }

    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setSubmitError(`Comments cannot exceed ${MAX_COMMENT_LENGTH.toLocaleString()} characters.`);
      return;
    }

    if (!user) {
      setSubmitError('You must be signed in to post a comment.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const nowIso = new Date().toISOString();

    const authorData: ResourceCommentAuthor = {
      id: user.id,
      name: userProfile.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student Contributor',
      avatar: sanitizeAvatar(userProfile.avatar || user.user_metadata?.avatar_url),
      college: userProfile.college || 'SRMCEM Lucknow',
      branch: userProfile.branch || 'Computer Science & Engineering',
      semester: userProfile.semester || 'Semester 4',
      isVerified: false,
    };

    try {
      if (isSupabaseConfigured && !tableMissingNotice) {
        // Real Supabase insert
        const { data, error } = await supabase
          .from('resource_comments')
          .insert({
            resource_id: resourceId,
            user_id: user.id,
            content: trimmed,
          })
          .select(`
            id,
            resource_id,
            user_id,
            content,
            created_at,
            updated_at,
            author:profiles!user_id (
              id,
              full_name,
              avatar_url,
              college,
              branch,
              semester,
              is_verified
            )
          `)
          .single();

        if (error) {
          if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
            setTableMissingNotice(true);
            // Session fallback
            const fallbackComment: ResourceComment = {
              id: `temp-${Date.now()}`,
              resourceId,
              userId: user.id,
              content: trimmed,
              createdAt: nowIso,
              updatedAt: nowIso,
              author: authorData,
            };
            const updated = [fallbackComment, ...comments];
            setComments(updated);
            saveSessionComments(updated);
            setNewComment('');
            addToast('success', 'Comment Posted', 'Your comment has been added to the discussion.');
            return;
          }

          // Resilient simple insert if relationship select syntax caused error
          const simpleInsert = await supabase
            .from('resource_comments')
            .insert({
              resource_id: resourceId,
              user_id: user.id,
              content: trimmed,
            })
            .select()
            .single();

          if (simpleInsert.error) {
            throw simpleInsert.error;
          }

          const createdComment: ResourceComment = {
            id: simpleInsert.data.id,
            resourceId: simpleInsert.data.resource_id,
            userId: simpleInsert.data.user_id,
            content: simpleInsert.data.content,
            createdAt: simpleInsert.data.created_at,
            updatedAt: simpleInsert.data.updated_at || simpleInsert.data.created_at,
            author: authorData,
          };

          setComments((prev) => [createdComment, ...prev]);
          setNewComment('');
          addToast('success', 'Comment Posted', 'Your comment has been added to the discussion.');
          return;
        }

        if (data) {
          const created = mapDbRowToComment(data);
          setComments((prev) => [created, ...prev]);
          setNewComment('');
          addToast('success', 'Comment Posted', 'Your comment has been added to the discussion.');
        }
      } else {
        // Fallback session storage
        const fallbackComment: ResourceComment = {
          id: `comment-${Date.now()}`,
          resourceId,
          userId: user.id,
          content: trimmed,
          createdAt: nowIso,
          updatedAt: nowIso,
          author: authorData,
        };
        const updated = [fallbackComment, ...comments];
        setComments(updated);
        saveSessionComments(updated);
        setNewComment('');
        addToast('success', 'Comment Posted', 'Your comment has been added to the discussion.');
      }
    } catch (err: any) {
      console.error('[GitNote Comments] Failed to post comment:', err);
      setSubmitError(err?.message || 'Failed to submit comment. Please verify your permissions and try again.');
      addToast('error', 'Posting Failed', err?.message || 'Could not post your comment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start editing a comment
  const handleStartEdit = (comment: ResourceComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
    setEditError(null);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
    setEditError(null);
  };

  // Save edited comment
  const handleSaveEdit = async (commentId: string) => {
    const trimmed = editContent.trim();
    if (!trimmed) {
      setEditError('Comment cannot be empty.');
      return;
    }
    if (trimmed.length > MAX_COMMENT_LENGTH) {
      setEditError(`Comments cannot exceed ${MAX_COMMENT_LENGTH.toLocaleString()} characters.`);
      return;
    }
    if (!user) {
      setEditError('You must be signed in.');
      return;
    }

    setIsUpdating(true);
    setEditError(null);

    const nowIso = new Date().toISOString();

    try {
      if (isSupabaseConfigured && !tableMissingNotice && !commentId.startsWith('temp-') && !commentId.startsWith('comment-')) {
        const { error } = await supabase
          .from('resource_comments')
          .update({
            content: trimmed,
            updated_at: nowIso,
          })
          .eq('id', commentId)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }
      }

      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                content: trimmed,
                updatedAt: nowIso,
              }
            : c
        )
      );

      // Also update session backup if active
      if (typeof window !== 'undefined') {
        const updated = comments.map((c) =>
          c.id === commentId ? { ...c, content: trimmed, updatedAt: nowIso } : c
        );
        saveSessionComments(updated);
      }

      setEditingCommentId(null);
      setEditContent('');
      addToast('success', 'Comment Updated', 'Your comment was successfully updated.');
    } catch (err: any) {
      console.error('[GitNote Comments] Error updating comment:', err);
      setEditError(err?.message || 'Failed to save changes. You may only edit your own comments.');
      addToast('error', 'Update Failed', err?.message || 'Could not update your comment.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm delete comment
  const handleDeleteComment = async () => {
    if (!commentToDelete || !user) return;

    setIsDeleting(true);
    const commentId = commentToDelete.id;

    try {
      if (isSupabaseConfigured && !tableMissingNotice && !commentId.startsWith('temp-') && !commentId.startsWith('comment-')) {
        const { error } = await supabase
          .from('resource_comments')
          .delete()
          .eq('id', commentId)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }
      }

      const updated = comments.filter((c) => c.id !== commentId);
      setComments(updated);
      saveSessionComments(updated);
      setCommentToDelete(null);
      addToast('info', 'Comment Deleted', 'Your comment has been removed from the discussion.');
    } catch (err: any) {
      console.error('[GitNote Comments] Error deleting comment:', err);
      addToast('error', 'Delete Failed', err?.message || 'Could not delete comment. Permission denied.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Remaining characters indicator calculation
  const newCommentCharsRemaining = MAX_COMMENT_LENGTH - newComment.length;
  const editCommentCharsRemaining = MAX_COMMENT_LENGTH - editContent.length;

  const currentRedirectPath = pathname || `/resources/${resourceId}`;
  const loginUrl = `/login?redirectTo=${encodeURIComponent(currentRedirectPath)}`;

  return (
    <section
      aria-label="Comments and Discussion"
      className="bg-white rounded-xl border border-[#e5e2db] p-5 sm:p-7 space-y-6 shadow-2xs"
    >
      {/* Header with Title and Total Count */}
      <div className="flex items-center justify-between border-b border-[#e5e2db] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#eef3f8] border border-[#cfdbe8] flex items-center justify-center text-[#1d3b64]">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#18181b] tracking-tight flex items-center gap-2">
              <span>Comments & Discussion</span>
              <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-[#f4f2ee] text-[#52525b] border border-[#e5e2db]">
                {comments.length}
              </span>
            </h3>
            <p className="text-xs text-[#71717a] mt-0.5">
              Discuss solutions, ask syllabus questions, and clarify concepts with peers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchComments}
          disabled={isLoading}
          title="Refresh comments"
          className="text-xs text-[#71717a] hover:text-[#18181b] p-1.5 rounded hover:bg-[#f4f2ee] transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Database Schema Setup Notice (Only shown if table is not yet created in Supabase) */}
      {tableMissingNotice && (
        <div className="rounded-md border border-[#fde68a] bg-[#fef9ee] p-3.5 text-xs text-[#92400e] flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#b45309]" />
          <div className="space-y-1">
            <strong className="font-semibold block text-[#78350f]">
              Supabase Table Setup Required:
            </strong>
            <p>
              The cloud table <code className="font-mono text-[11px] bg-[#fef3c7] px-1 py-0.5 rounded">public.resource_comments</code> is not yet applied in the Supabase schema cache. To persist comments permanently across devices, run the migration file <code className="font-mono text-[11px] bg-[#fef3c7] px-1 py-0.5 rounded">supabase/migrations/20261030000000_resource_comments.sql</code> in your Supabase SQL Editor.
            </p>
            <p className="text-[11px] text-[#b45309]">
              Session discussion is active for preview and testing.
            </p>
          </div>
        </div>
      )}

      {/* Submission Box */}
      {user ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#52525b]">
            <div className="w-5 h-5 rounded-full bg-[#1d3b64] text-white flex items-center justify-center text-[10px] font-mono font-medium overflow-hidden">
              {userProfile.avatar && userProfile.avatar.startsWith('/avatars/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userProfile.avatar} alt={userProfile.name} className="w-full h-full object-cover" />
              ) : (
                (userProfile.name || user.email?.charAt(0) || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <span>
              Commenting as <strong className="text-[#18181b]">{userProfile.name || user.email?.split('@')[0]}</strong>
            </span>
          </div>

          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                if (submitError) setSubmitError(null);
              }}
              placeholder="Ask a question, share an exam tip, or discuss this document..."
              maxLength={MAX_COMMENT_LENGTH}
              rows={3}
              disabled={isSubmitting}
              className="w-full rounded-md border border-[#e5e2db] bg-[#fbfaf8] focus:bg-white p-3 text-xs sm:text-sm text-[#18181b] placeholder:text-[#a1a1aa] focus:outline-none focus:ring-1 focus:ring-[#1d3b64] focus:border-[#1d3b64] transition-colors resize-y min-h-[80px]"
            />

            {/* Character Counter & Helper */}
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-[#71717a]">
                Markdown formatting supported. Keep discussions civil and helpful.
              </span>
              <span
                className={`font-mono ${
                  newCommentCharsRemaining < 100
                    ? newCommentCharsRemaining < 0
                      ? 'text-[#991b1b] font-semibold'
                      : 'text-[#92400e] font-semibold'
                    : 'text-[#a1a1aa]'
                }`}
              >
                {newComment.length.toLocaleString()} / {MAX_COMMENT_LENGTH.toLocaleString()}
              </span>
            </div>
          </div>

          {submitError && (
            <div className="flex items-center gap-1.5 text-xs text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] p-2.5 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || newComment.trim().length === 0 || newComment.length > MAX_COMMENT_LENGTH}
              isLoading={isSubmitting}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        /* Logged-Out Visitor State */
        <div className="rounded-md border border-[#e5e2db] bg-[#fbfaf8] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-semibold text-[#18181b]">
              Join the Academic Discussion
            </h4>
            <p className="text-xs text-[#52525b] max-w-lg leading-relaxed">
              Sign in with your student account to ask questions, share answers, or provide feedback on this resource.
            </p>
          </div>
          <Link href={loginUrl} className="shrink-0">
            <Button variant="primary" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
              Sign in to Comment
            </Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {isLoading ? (
          /* Loading Skeleton */
          <div className="space-y-3 py-6">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse space-y-2 p-4 rounded-md border border-[#eeece6] bg-[#fbfaf8]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-200" />
                  <div className="space-y-1">
                    <div className="h-3 w-28 bg-slate-200 rounded" />
                    <div className="h-2 w-16 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded mt-2" />
                <div className="h-3 w-4/5 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          /* Empty State */
          <div className="text-center py-10 px-4 rounded-md border border-dashed border-[#e5e2db] bg-[#fbfaf8] space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#f4f2ee] border border-[#e5e2db] flex items-center justify-center text-[#71717a] mx-auto">
              <MessageSquare className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h4 className="text-xs sm:text-sm font-semibold text-[#18181b]">
              No comments yet. Start the discussion.
            </h4>
            <p className="text-xs text-[#71717a] max-w-md mx-auto leading-relaxed">
              Have questions about {resourceTitle ? `"${resourceTitle}"` : 'this document'}, syllabus alignment, or exam hints? Be the first to share with classmates.
            </p>
          </div>
        ) : (
          /* Rendered Comments List (Newest First) */
          <div className="divide-y divide-[#eeece6]">
            {comments.map((comment) => {
              const isOwner = Boolean(user && user.id === comment.userId);
              const isBeingEdited = editingCommentId === comment.id;
              const wasEdited =
                Boolean(comment.updatedAt && comment.createdAt) &&
                new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 2000;

              return (
                <article
                  key={comment.id}
                  className="py-4 first:pt-0 last:pb-0 space-y-2 transition-colors"
                >
                  {/* Author Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar */}
                      <div className="w-7 h-7 rounded-full bg-[#eef3f8] text-[#1d3b64] border border-[#cfdbe8] flex items-center justify-center text-xs font-mono font-medium shrink-0 overflow-hidden select-none">
                        {comment.author.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={comment.author.avatar}
                            alt={comment.author.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          comment.author.name.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Author Details */}
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#18181b]">
                            {comment.author.name}
                          </span>
                          {comment.author.isVerified && (
                            <span title="Verified Contributor">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#166534]" />
                            </span>
                          )}
                          {isOwner && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#eef3f8] text-[#1d3b64] border border-[#cfdbe8]">
                              You
                            </span>
                          )}
                          <span className="text-[#a1a1aa] text-[10px]">•</span>
                          <time
                            dateTime={comment.createdAt}
                            className="text-[11px] text-[#71717a]"
                            title={new Date(comment.createdAt).toLocaleString()}
                          >
                            {formatCommentTimestamp(comment.createdAt)}
                          </time>
                          {wasEdited && (
                            <span
                              className="text-[10px] text-[#a1a1aa] italic"
                              title={`Edited at ${new Date(comment.updatedAt).toLocaleTimeString()}`}
                            >
                              (edited)
                            </span>
                          )}
                        </div>

                        {/* Contributor Academic Badging */}
                        {(comment.author.branch || comment.author.semester) && (
                          <div className="text-[10px] font-mono text-[#71717a] flex items-center gap-1">
                            <span>{comment.author.branch}</span>
                            {comment.author.semester && (
                              <>
                                <span>•</span>
                                <span>{comment.author.semester}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Owner Actions: Edit & Delete buttons */}
                    {isOwner && !isBeingEdited && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(comment)}
                          className="p-1 rounded text-[#71717a] hover:text-[#18181b] hover:bg-[#f4f2ee] transition-colors cursor-pointer"
                          title="Edit your comment"
                          aria-label="Edit comment"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCommentToDelete(comment)}
                          className="p-1 rounded text-[#71717a] hover:text-[#991b1b] hover:bg-[#fef2f2] transition-colors cursor-pointer"
                          title="Delete your comment"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Body or Inline Editor */}
                  {isBeingEdited ? (
                    <div className="space-y-2.5 pt-1 pl-9">
                      <textarea
                        value={editContent}
                        onChange={(e) => {
                          setEditContent(e.target.value);
                          if (editError) setEditError(null);
                        }}
                        rows={3}
                        maxLength={MAX_COMMENT_LENGTH}
                        disabled={isUpdating}
                        className="w-full rounded-md border border-[#e5e2db] bg-white p-2.5 text-xs text-[#18181b] focus:outline-none focus:ring-1 focus:ring-[#1d3b64] focus:border-[#1d3b64] transition-colors"
                      />

                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`font-mono ${
                            editCommentCharsRemaining < 100
                              ? 'text-[#92400e] font-semibold'
                              : 'text-[#a1a1aa]'
                          }`}
                        >
                          {editContent.length.toLocaleString()} / {MAX_COMMENT_LENGTH.toLocaleString()}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            leftIcon={<X className="w-3 h-3" />}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => handleSaveEdit(comment.id)}
                            disabled={isUpdating || editContent.trim().length === 0 || editContent.length > MAX_COMMENT_LENGTH}
                            isLoading={isUpdating}
                            leftIcon={<Check className="w-3 h-3" />}
                          >
                            Save Changes
                          </Button>
                        </div>
                      </div>

                      {editError && (
                        <p className="text-xs text-[#991b1b] flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{editError}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="pl-9">
                      <p className="text-xs sm:text-sm text-[#3f3f46] whitespace-pre-line leading-relaxed break-words">
                        {comment.content}
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Comment Confirmation Modal */}
      <Modal
        isOpen={Boolean(commentToDelete)}
        onClose={() => {
          if (!isDeleting) setCommentToDelete(null);
        }}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-md bg-[#fef2f2] border border-[#fecaca] flex items-center justify-center text-[#991b1b] shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[#18181b]">
                Delete Comment?
              </h4>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Are you sure you want to remove your comment from this discussion? This action cannot be undone.
              </p>
            </div>
          </div>

          {commentToDelete && (
            <div className="bg-[#fbfaf8] border border-[#e5e2db] rounded-md p-2.5 text-xs text-[#52525b] italic line-clamp-3">
              &ldquo;{commentToDelete.content}&rdquo;
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#eeece6]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setCommentToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDeleteComment}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Delete Comment
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

