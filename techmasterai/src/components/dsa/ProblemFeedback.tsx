import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
    MessageSquare, 
    ThumbsUp, 
    Reply, 
    Send, 
    Loader2,
    User,
    Clock,
    TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
    id: string;
    problem_slug: string;
    user_id: string;
    username: string;
    user_avatar?: string;
    content: string;
    parent_comment_id?: string;
    likes: number;
    created_at: string;
    updated_at: string;
    replies?: Comment[];
    isLiked?: boolean;
}

interface ProblemFeedbackProps {
    problemSlug: string;
}

export function ProblemFeedback({ problemSlug }: ProblemFeedbackProps) {
    const { user: currentUser } = useSupabaseAuth(); // Use unified Supabase auth
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
    const [hasNewComments, setHasNewComments] = useState(false);
    const [lastViewedTime, setLastViewedTime] = useState<Date>(new Date());

    // Fetch comments
    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            
            // Fetch all comments for this problem
            const { data: commentsData, error } = await supabase
                .from('problem_comments')
                .select('*')
                .eq('problem_slug', problemSlug)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch user's likes
            let userLikes: string[] = [];
            if (currentUser) {
                const { data: likesData } = await supabase
                    .from('comment_likes')
                    .select('comment_id')
                    .eq('user_id', currentUser.id);
                
                userLikes = likesData?.map(l => l.comment_id) || [];
            }

            // Organize comments into tree structure
            const commentMap = new Map<string, Comment>();
            const rootComments: Comment[] = [];

            commentsData?.forEach(comment => {
                const commentWithLike = {
                    ...comment,
                    replies: [],
                    isLiked: userLikes.includes(comment.id)
                };
                commentMap.set(comment.id, commentWithLike);
            });

            commentMap.forEach(comment => {
                if (comment.parent_comment_id) {
                    const parent = commentMap.get(comment.parent_comment_id);
                    if (parent) {
                        parent.replies = parent.replies || [];
                        parent.replies.push(comment);
                    }
                } else {
                    rootComments.push(comment);
                }
            });

            // Sort based on selected option
            const sortedComments = sortBy === 'popular'
                ? rootComments.sort((a, b) => b.likes - a.likes)
                : rootComments.sort((a, b) => 
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

            // Check for new comments
            const hasNew = sortedComments.some(
                comment => new Date(comment.created_at) > lastViewedTime
            );
            setHasNewComments(hasNew);

            setComments(sortedComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            toast.error('Failed to load feedback');
        } finally {
            setLoading(false);
        }
    }, [problemSlug, currentUser, sortBy, lastViewedTime]);

    useEffect(() => {
        fetchComments();

        // Subscribe to real-time updates for comments
        const commentsChannel = supabase
            .channel(`comments:${problemSlug}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'problem_comments',
                    filter: `problem_slug=eq.${problemSlug}`
                },
                () => {
                    fetchComments();
                }
            )
            .subscribe();

        // Subscribe to real-time updates for likes
        const likesChannel = supabase
            .channel(`likes:${problemSlug}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'comment_likes'
                },
                () => {
                    // Refresh comments to update like counts
                    fetchComments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(commentsChannel);
            supabase.removeChannel(likesChannel);
        };
    }, [problemSlug, fetchComments]);

    // Mark comments as viewed when user interacts
    useEffect(() => {
        const markAsViewed = () => {
            setLastViewedTime(new Date());
            setHasNewComments(false);
        };

        // Mark as viewed after 2 seconds of viewing
        const timer = setTimeout(markAsViewed, 2000);

        return () => clearTimeout(timer);
    }, [comments]);

    // Post new comment
    const handlePostComment = async () => {
        if (!currentUser) {
            toast.error('Please login to comment');
            return;
        }

        if (!newComment.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }

        try {
            setSubmitting(true);

            const { error } = await supabase
                .from('problem_comments')
                .insert({
                    problem_slug: problemSlug,
                    user_id: currentUser.id,
                    username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'Anonymous',
                    user_avatar: currentUser.user_metadata?.avatar_url,
                    content: newComment.trim()
                });

            if (error) throw error;

            setNewComment('');
            toast.success('Feedback posted!');
        } catch (error) {
            console.error('Error posting comment:', error);
            toast.error('Failed to post feedback');
        } finally {
            setSubmitting(false);
        }
    };

    // Post reply
    const handlePostReply = async (parentId: string) => {
        if (!currentUser) {
            toast.error('Please login to reply');
            return;
        }

        if (!replyContent.trim()) {
            toast.error('Reply cannot be empty');
            return;
        }

        try {
            setSubmitting(true);

            const { error } = await supabase
                .from('problem_comments')
                .insert({
                    problem_slug: problemSlug,
                    user_id: currentUser.id,
                    username: currentUser.user_metadata?.username || currentUser.email?.split('@')[0] || 'Anonymous',
                    user_avatar: currentUser.user_metadata?.avatar_url,
                    content: replyContent.trim(),
                    parent_comment_id: parentId
                });

            if (error) throw error;

            setReplyContent('');
            setReplyTo(null);
            toast.success('Reply posted!');
        } catch (error) {
            console.error('Error posting reply:', error);
            toast.error('Failed to post reply');
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle like with optimistic update
    const handleToggleLike = async (commentId: string, isLiked: boolean) => {
        if (!currentUser) {
            toast.error('Please login to like comments');
            return;
        }

        // Optimistic update - update UI immediately
        setComments(prevComments => {
            const updateComment = (comments: Comment[]): Comment[] => {
                return comments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            likes: isLiked ? comment.likes - 1 : comment.likes + 1,
                            isLiked: !isLiked
                        };
                    }
                    if (comment.replies && comment.replies.length > 0) {
                        return {
                            ...comment,
                            replies: updateComment(comment.replies)
                        };
                    }
                    return comment;
                });
            };
            return updateComment(prevComments);
        });

        try {
            if (isLiked) {
                // Unlike
                await supabase
                    .from('comment_likes')
                    .delete()
                    .eq('comment_id', commentId)
                    .eq('user_id', currentUser.id);
            } else {
                // Like
                await supabase
                    .from('comment_likes')
                    .insert({
                        comment_id: commentId,
                        user_id: currentUser.id
                    });
            }

            // Fetch fresh data to ensure consistency
            fetchComments();
        } catch (error) {
            console.error('Error toggling like:', error);
            toast.error('Failed to update like');
            // Revert optimistic update on error
            fetchComments();
        }
    };

    // Render single comment
    const renderComment = (comment: Comment, isReply = false) => (
        <div key={comment.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-4'}`}>
            <div className="bg-[#1a1f2e] rounded-xl p-4 border border-white/10">
                {/* Comment Header */}
                <div className="flex items-start gap-3 mb-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user_avatar} />
                        <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                            <User className="h-4 w-4" />
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white text-sm">
                                {comment.username}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                        </div>
                        
                        {/* Comment Content */}
                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                        </p>
                    </div>
                </div>

                {/* Comment Actions */}
                <div className="flex items-center gap-4 ml-11">
                    <button
                        onClick={() => handleToggleLike(comment.id, comment.isLiked || false)}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                            comment.isLiked 
                                ? 'text-cyan-400' 
                                : 'text-slate-400 hover:text-cyan-400'
                        }`}
                    >
                        <ThumbsUp className={`h-3.5 w-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likes}</span>
                    </button>

                    {!isReply && (
                        <button
                            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
                        >
                            <Reply className="h-3.5 w-3.5" />
                            <span>Reply</span>
                        </button>
                    )}
                </div>

                {/* Reply Input */}
                {replyTo === comment.id && (
                    <div className="mt-3 ml-11">
                        <Textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="min-h-[80px] bg-[#0B0F19] border-white/20 text-white resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                            <Button
                                size="sm"
                                onClick={() => handlePostReply(comment.id)}
                                disabled={submitting || !replyContent.trim()}
                                className="bg-cyan-500 hover:bg-cyan-400 text-black"
                            >
                                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Post Reply'}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setReplyTo(null);
                                    setReplyContent('');
                                }}
                                className="border-white/20"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Render Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3">
                    {comment.replies.map(reply => renderComment(reply, true))}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col bg-transparent mt-6 pt-6 border-t border-white/10 problem-feedback">
            {/* Header */}
            <div className="shrink-0 mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-white">
                            Feedback
                        </h3>
                        <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400">
                            {comments.length}
                        </Badge>
                        {hasNewComments && (
                            <Badge className="bg-green-500 text-white animate-pulse">
                                New
                            </Badge>
                        )}
                    </div>

                    {/* Sort Options */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSortBy('newest')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                sortBy === 'newest'
                                    ? 'bg-cyan-500 text-black'
                                    : 'bg-white/10 text-slate-400 hover:bg-white/20'
                            }`}
                        >
                            <Clock className="h-3 w-3 inline mr-1" />
                            Newest
                        </button>
                        <button
                            onClick={() => setSortBy('popular')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                sortBy === 'popular'
                                    ? 'bg-cyan-500 text-black'
                                    : 'bg-white/10 text-slate-400 hover:bg-white/20'
                            }`}
                        >
                            <TrendingUp className="h-3 w-3 inline mr-1" />
                            Popular
                        </button>
                    </div>
                </div>

                {/* New Comment Input */}
                <div className="space-y-2">
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={currentUser ? "Share your feedback or ask a question..." : "Login to comment"}
                        disabled={!currentUser}
                        className="min-h-[100px] bg-[#1a1f2e] border-white/20 text-white placeholder:text-slate-500 resize-none"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handlePostComment}
                            disabled={submitting || !newComment.trim() || !currentUser}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                        >
                            {submitting ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            Post Feedback
                        </Button>
                    </div>
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">No feedback yet</p>
                        <p className="text-slate-500 text-xs mt-1">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <div>
                        {comments.map(comment => renderComment(comment))}
                    </div>
                )}
            </div>
        </div>
    );
}
