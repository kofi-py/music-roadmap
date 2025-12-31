'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { forumAPI, cookieUtils } from '../../lib/api';

export default function ForumPage() {
    const [categories, setCategories] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        setUserInfo(cookieUtils.getUserInfo());
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [categoriesData, postsData] = await Promise.all([
                forumAPI.getCategories(),
                forumAPI.getPosts('all')
            ]);
            setCategories(categoriesData);
            setPosts(Array.isArray(postsData) ? postsData : []);
        } catch (error) {
            console.error('Error fetching forum data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = async (categoryName) => {
        setSelectedCategory(categoryName);
        setLoading(true);
        try {
            const postsData = await forumAPI.getPosts(categoryName);
            setPosts(Array.isArray(postsData) ? postsData : []);
        } catch (error) {
            console.error('Error fetching posts by category:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = (posts || []).filter(post =>
        post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-warm-cream staff-lines py-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto page-transition">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-royal-purple-900 mb-2">
                            Community Forum
                        </h1>
                        <p className="text-gray-600">Connect with fellow musicians and share your journey.</p>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        {userInfo ? (
                            <Link href="/forum/new" className="btn-primary flex items-center gap-2 whitespace-nowrap">
                                <span>+</span> New Post
                            </Link>
                        ) : (
                            <Link href="/login" className="btn-secondary flex items-center gap-2 whitespace-nowrap">
                                Log in to Post
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar - Categories */}
                    <aside className="lg:col-span-1">
                        <div className="music-card p-6 sticky top-24">
                            <h3 className="text-xl font-display font-bold text-royal-purple-900 mb-6 flex items-center gap-2">
                                <span>📂</span> Categories
                            </h3>
                            <nav className="space-y-2">
                                <button
                                    onClick={() => handleCategoryChange('all')}
                                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 ${selectedCategory === 'all'
                                        ? 'bg-royal-purple-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:bg-royal-purple-50 hover:text-royal-purple-700'
                                        }`}
                                >
                                    <span className="text-lg">🌍</span>
                                    All Discussions
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryChange(cat.name)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium flex items-center gap-3 capitalize ${selectedCategory === cat.name
                                            ? 'bg-royal-purple-600 text-white shadow-lg'
                                            : 'text-gray-600 hover:bg-royal-purple-50 hover:text-royal-purple-700'
                                            }`}
                                    >
                                        <span className="text-lg">{cat.icon || '🎵'}</span>
                                        {cat.name}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content - Post List */}
                    <main className="lg:col-span-3">
                        <div className="mb-8">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search discussions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-transparent bg-white shadow-md focus:border-royal-purple-400 focus:outline-none transition-all placeholder:text-gray-400"
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-3xl backdrop-blur-sm">
                                <div className="w-12 h-12 border-4 border-royal-purple-200 border-t-royal-purple-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-royal-purple-800 font-medium">Fine-tuning the instruments...</p>
                            </div>
                        ) : filteredPosts.length > 0 ? (
                            <div className="space-y-4">
                                {filteredPosts.map((post) => (
                                    <Link
                                        key={post.id}
                                        href={`/forum/post/${post.id}`}
                                        className="music-card p-6 block hover:shadow-glow-purple group"
                                    >
                                        <div className="flex gap-4 items-start">
                                            <div className="hidden md:block">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-royal-purple-100 flex items-center justify-center text-xl">
                                                    {post.author_picture ? (
                                                        <img src={post.author_picture} alt={post.author} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>🎸</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-passion-pink-50 text-passion-pink-600 border border-passion-pink-100">
                                                        {post.category_name}
                                                    </span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500">Posted by {post.author}</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(post.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <h2 className="text-xl font-display font-bold text-royal-purple-900 group-hover:text-royal-purple-600 transition-colors mb-2">
                                                    {post.title}
                                                </h2>
                                                <p className="text-gray-600 line-clamp-2 text-sm mb-4 leading-relaxed">
                                                    {post.content}
                                                </p>
                                                <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-lg">💬</span>
                                                        <span>{post.reply_count} replies</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-lg">👁️</span>
                                                        <span>{post.views} views</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-2xl text-gray-300 group-hover:text-royal-purple-400 transition-colors">
                                                →
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/50 rounded-3xl backdrop-blur-sm border-2 border-dashed border-royal-purple-200">
                                <div className="text-6xl mb-4">📭</div>
                                <h3 className="text-2xl font-display font-bold text-royal-purple-900 mb-2">No discussions yet</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    Be the first one to start a conversation in the <span className="font-bold underline text-royal-purple-600 capitalize">{selectedCategory}</span> category!
                                </p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
