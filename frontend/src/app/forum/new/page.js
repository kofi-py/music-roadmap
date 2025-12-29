'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cookieUtils } from '../../../lib/api';

export default function NewPostPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        categoryId: '',
        content: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const userInfo = cookieUtils.getUserInfo();
        if (!userInfo) {
            router.push('/login');
            return;
        }
        setUser(userInfo);
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`);
            const data = await response.json();
            setCategories(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, categoryId: data[0].id }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/forum/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                router.push(`/forum/post/${data.postId}`);
            } else {
                setError(data.error || 'Failed to create post');
            }
        } catch (error) {
            setError('Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-warm-cream flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <h2 className="text-2xl font-display font-bold text-royal-purple-900 mb-2">
                        Authentication Required
                    </h2>
                    <p className="text-gray-600 mb-6">Please sign in to create a post</p>
                    <Link href="/login" className="btn-primary">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-warm-cream staff-lines py-12 px-4">
            <div className="max-w-3xl mx-auto page-transition">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/forum" className="text-passion-pink-600 hover:underline font-medium mb-4 inline-flex items-center gap-2">
                        ← Back to Forum
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-music mb-2">
                        Create New Post
                    </h1>
                    <p className="text-gray-600">Share your thoughts with the Music Roadmap community</p>
                </div>

                {/* Form */}
                <div className="music-card p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Category Selection */}
                        <div>
                            <label htmlFor="categoryId" className="block text-sm font-bold text-royal-purple-900 mb-2">
                                Category *
                            </label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-royal-purple-500 focus:ring-2 focus:ring-royal-purple-200 outline-none transition-all capitalize"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-bold text-royal-purple-900 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                maxLength="500"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-royal-purple-500 focus:ring-2 focus:ring-royal-purple-200 outline-none transition-all"
                                placeholder="What's your question or topic?"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {formData.title.length}/500 characters
                            </p>
                        </div>

                        {/* Content */}
                        <div>
                            <label htmlFor="content" className="block text-sm font-bold text-royal-purple-900 mb-2">
                                Content *
                            </label>
                            <textarea
                                id="content"
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                required
                                rows="12"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-royal-purple-500 focus:ring-2 focus:ring-royal-purple-200 outline-none transition-all resize-none"
                                placeholder="Share your thoughts, ask questions, or start a discussion..."
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800">
                                <p className="font-medium">{error}</p>
                            </div>
                        )}

                        {/* Guidelines */}
                        <div className="p-4 bg-royal-purple-50 border-2 border-royal-purple-100 rounded-xl">
                            <h3 className="font-bold text-royal-purple-900 mb-2 flex items-center gap-2">
                                <span>💡</span> Community Guidelines
                            </h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                                <li>• Be respectful and constructive</li>
                                <li>• Stay on topic and relevant to music</li>
                                <li>• Search before posting to avoid duplicates</li>
                                <li>• Provide context and details for better answers</li>
                            </ul>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Creating Post...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Create Post <span>✨</span>
                                    </span>
                                )}
                            </button>
                            <Link href="/forum" className="btn-secondary flex-1 py-4 text-center">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
