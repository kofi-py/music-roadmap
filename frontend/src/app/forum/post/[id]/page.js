'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cookieUtils } from '../../../../lib/api';

export default function PostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const postId = params.id;

    const [user, setUser] = useState(null);
    const [post, setPost] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const userInfo = cookieUtils.getUserInfo();
        setUser(userInfo);
        fetchPost();
    }, [postId]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/forum/posts/${postId}`,
                { credentials: 'include' }
            );

            if (!response.ok) {
                throw new Error('Post not found');
            }

            const data = await response.json();
            setPost(data.post);
            setReplies(data.replies || []);
        } catch (error) {
            console.error('Error fetching post:', error);
            setError('Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            router.push('/login');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/forum/posts/${postId}/replies`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ content: replyContent }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setReplyContent('');
                fetchPost(); // Refresh to show new reply
            } else {
                setError(data.error || 'Failed to post reply');
            }
        } catch (error) {
            setError('Failed to post reply. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleHelpfulVote = async (replyId, currentlyMarked) => {
        if (!user) {
            router.push('/login');
            return;
        }

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/forum/replies/${replyId}/helpful`,
                {
                    method: 'POST',
                    credentials: 'include',
                }
            );

            if (response.ok) {
                // Update the reply in state
                setReplies(replies.map(reply => {
                    if (reply.id === replyId) {
                        return {
                            ...reply,
                            marked_helpful_by_user: !currentlyMarked,
                            helpful_count: currentlyMarked ? reply.helpful_count - 1 : reply.helpful_count + 1
                        };
                    }
                    return reply;
                }));
            }
        } catch (error) {
            console.error('Error voting:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-warm-cream staff-lines flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-royal-purple-200 border-t-royal-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-royal-purple-800 font-medium">Loading discussion...</p>
                </div>
            </div>
        );
    }

    if (error && !post) {
        return (
            <div className="min-h-screen bg-warm-cream staff-lines flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-display font-bold text-royal-purple-900 mb-2">Post Not Found</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link href="/forum" className="btn-primary">
                        Back to Forum
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-warm-cream staff-lines py-12 px-4">
            <div className="max-w-4xl mx-auto page-transition">
                {/* Back Button */}
                <Link href="/forum" className="text-passion-pink-600 hover:underline font-medium mb-6 inline-flex items-center gap-2">
                    ← Back to Forum
                </Link>

                {/* Original Post */}
                <div className="music-card p-8 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-royal-purple-100 flex items-center justify-center text-xl">
                            {post.author_picture ? (
                                <img src={post.author_picture} alt={post.author} className="w-full h-full object-cover" />
                            ) : (
                                <span>🎸</span>
                            )}
                        </div>
                        <div>
                            <div className="font-bold text-royal-purple-900">{post.author}</div>
                            <div className="text-xs text-gray-500">
                                {new Date(post.created_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                        <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-passion-pink-50 text-passion-pink-600 border border-passion-pink-100 capitalize">
                            {post.category_icon} {post.category_name}
                        </span>
                    </div>

                    <h1 className="text-3xl font-display font-bold text-royal-purple-900 mb-4">
                        {post.title}
                    </h1>

                    <div className="prose prose-lg max-w-none text-gray-700 mb-6 whitespace-pre-wrap">
                        {post.content}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-200">
                        <span className="flex items-center gap-1">
                            <span>👁️</span> {post.views} views
                        </span>
                        <span className="flex items-center gap-1">
                            <span>💬</span> {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                        </span>
                    </div>
                </div>

                {/* Replies Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold text-royal-purple-900 mb-6">
                        {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                    </h2>

                    {replies.length > 0 ? (
                        <div className="space-y-4">
                            {replies.map((reply) => (
                                <div key={reply.id} className="music-card p-6">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-royal-purple-100 flex items-center justify-center flex-shrink-0">
                                            {reply.author_picture ? (
                                                <img src={reply.author_picture} alt={reply.author} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg">🎵</span>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <span className="font-bold text-royal-purple-900">{reply.author}</span>
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        {new Date(reply.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 mb-3 whitespace-pre-wrap">{reply.content}</p>

                                            <button
                                                onClick={() => handleHelpfulVote(reply.id, reply.marked_helpful_by_user)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${reply.marked_helpful_by_user
                                                        ? 'bg-music-gold-100 text-music-gold-700 border-2 border-music-gold-300'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                                                    }`}
                                                disabled={!user}
                                            >
                                                <span className="text-lg">{reply.marked_helpful_by_user ? '⭐' : '✨'}</span>
                                                <span>Helpful ({reply.helpful_count})</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/50 rounded-3xl backdrop-blur-sm border-2 border-dashed border-royal-purple-200">
                            <div className="text-5xl mb-3">💭</div>
                            <p className="text-gray-600">No replies yet. Be the first to respond!</p>
                        </div>
                    )}
                </div>

                {/* Reply Form */}
                <div className="music-card p-8">
                    <h3 className="text-xl font-display font-bold text-royal-purple-900 mb-4">
                        Add Your Reply
                    </h3>

                    {user ? (
                        <form onSubmit={handleReplySubmit} className="space-y-4">
                            <textarea
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                required
                                rows="6"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-royal-purple-500 focus:ring-2 focus:ring-royal-purple-200 outline-none transition-all resize-none"
                                placeholder="Share your thoughts, answer the question, or provide helpful insights..."
                            />

                            {error && (
                                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800">
                                    <p className="font-medium">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting || !replyContent.trim()}
                                className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Posting...
                                    </span>
                                ) : (
                                    <span>Post Reply</span>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-8 bg-royal-purple-50 rounded-xl border-2 border-royal-purple-100">
                            <p className="text-gray-700 mb-4">You need to be signed in to reply</p>
                            <Link href="/login" className="btn-primary inline-block">
                                Sign In
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
