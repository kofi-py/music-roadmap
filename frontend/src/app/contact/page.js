'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus({ type: 'success', message: data.message });
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setStatus({ type: 'error', message: data.error || 'Something went wrong' });
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to send message. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-warm-cream staff-lines py-20 px-4">
            <div className="max-w-4xl mx-auto page-transition">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-display font-bold text-gradient-music mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Have questions, feedback, or suggestions? We'd love to hear from you!
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="music-card p-8">
                            <h2 className="text-2xl font-display font-bold text-royal-purple-900 mb-6">
                                Contact Information
                            </h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-royal-purple-100 flex items-center justify-center text-2xl flex-shrink-0">
                                        📧
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-royal-purple-900 mb-1">Email</h3>
                                        <a href="mailto:pastorkofi101@gmail.com" className="text-passion-pink-600 hover:underline">
                                            pastorkofi101@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-passion-pink-100 flex items-center justify-center text-2xl flex-shrink-0">
                                        ⏰
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-royal-purple-900 mb-1">Response Time</h3>
                                        <p className="text-gray-600">We typically respond within 24-48 hours</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-music-gold-100 flex items-center justify-center text-2xl flex-shrink-0">
                                        🎵
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-royal-purple-900 mb-1">Community</h3>
                                        <p className="text-gray-600 mb-2">Join our forum for quick answers</p>
                                        <Link href="/forum" className="text-passion-pink-600 hover:underline font-medium">
                                            Visit Forum →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="music-card p-6 bg-gradient-to-br from-royal-purple-50 to-passion-pink-50 border-2 border-royal-purple-100">
                            <h3 className="font-bold text-royal-purple-900 mb-2 flex items-center gap-2">
                                <span>💡</span> Quick Tip
                            </h3>
                            <p className="text-gray-700 text-sm">
                                For technical issues or course-specific questions, please include as much detail as possible
                                to help us assist you better!
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="music-card p-8">
                        <h2 className="text-2xl font-display font-bold text-royal-purple-900 mb-6">
                            Send us a Message
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-royal-purple-900 mb-2">
                                    Your Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-royal-purple-500 focus:ring-2 focus:ring-royal-purple-200 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-royal-purple-900 mb-2">
                                    Your Email *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-royal-purple-500 focus:ring-2 focus:ring-royal-purple-200 outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-bold text-royal-purple-900 mb-2">
                                    Subject *
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-royal-purple-500 focus:ring-2 focus:ring-royal-purple-200 outline-none transition-all"
                                    placeholder="Question about music theory courses"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-bold text-royal-purple-900 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="6"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-royal-purple-500 focus:ring-2 focus:ring-royal-purple-200 outline-none transition-all resize-none"
                                    placeholder="Tell us what's on your mind..."
                                />
                            </div>

                            {status.message && (
                                <div className={`p-4 rounded-xl ${status.type === 'success'
                                        ? 'bg-green-50 border-2 border-green-200 text-green-800'
                                        : 'bg-red-50 border-2 border-red-200 text-red-800'
                                    }`}>
                                    <p className="font-medium">{status.message}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Send Message <span>✉️</span>
                                    </span>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
