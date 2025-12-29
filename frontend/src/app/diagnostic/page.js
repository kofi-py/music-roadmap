'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const questions = [
    {
        id: 1,
        question: "What is the name of this musical symbol: 𝄢",
        options: ["Treble Clef", "Bass Clef", "Alto Clef", "Tenor Clef"],
        answer: "Bass Clef",
        level: "Elementary"
    },
    {
        id: 2,
        question: "How many beats does a whole note (𝅝) typically receive in 4/4 time?",
        options: ["1 beat", "2 beats", "3 beats", "4 beats"],
        answer: "4 beats",
        level: "Elementary"
    },
    {
        id: 3,
        question: "Which of these is a brass instrument?",
        options: ["Oboe", "Trumpet", "Cello", "Clarinet"],
        answer: "Trumpet",
        level: "Elementary"
    },
    {
        id: 4,
        question: "What is the distance between two musical notes called?",
        options: ["Scale", "Interval", "Chord", "Beat"],
        answer: "Interval",
        level: "Middle"
    },
    {
        id: 5,
        question: "Which major scale has no sharps or flats?",
        options: ["G Major", "F Major", "C Major", "D Major"],
        answer: "C Major",
        level: "Middle"
    },
    {
        id: 6,
        question: "What does 'Fortissimo' (ff) mean in music notation?",
        options: ["Very soft", "Very loud", "Gradually louder", "Fast tempo"],
        answer: "Very loud",
        level: "Middle"
    },
    {
        id: 7,
        question: "The distance between C and E is what type of interval?",
        options: ["Major Second", "Minor Third", "Major Third", "Perfect Fourth"],
        answer: "Major Third",
        level: "High"
    },
    {
        id: 8,
        question: "Which of these is the relative minor of G Major?",
        options: ["A minor", "E minor", "D minor", "B minor"],
        answer: "E minor",
        level: "High"
    },
    {
        id: 9,
        question: "What is a 'triad' in music theory?",
        options: ["A four-note chord", "A three-note scale", "A three-note chord built on thirds", "A type of rhythm"],
        answer: "A three-note chord built on thirds",
        level: "High"
    },
    {
        id: 10,
        question: "In 6/8 time, how many eighth notes are in one measure?",
        options: ["3", "4", "6", "8"],
        answer: "6",
        level: "College"
    },
    {
        id: 11,
        question: "What is 'Counterpoint'?",
        options: ["A type of percussion", "The relationship between independent musical lines", "A fast tempo marking", "A modern tuning system"],
        answer: "The relationship between independent musical lines",
        level: "College"
    },
    {
        id: 12,
        question: "Which composer is famous for the 'Well-Tempered Clavier'?",
        options: ["Mozart", "Beethoven", "J.S. Bach", "Chopin"],
        answer: "J.S. Bach",
        level: "College"
    }
];

export default function DiagnosticPage() {
    const [currentStep, setCurrentStep] = useState('start'); // 'start', 'test', 'result'
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(0);
    const [recommendedLevel, setRecommendedLevel] = useState('');

    const handleStart = () => {
        setCurrentStep('test');
    };

    const handleAnswer = (option) => {
        setAnswers({ ...answers, [currentQuestionIdx]: option });

        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(currentQuestionIdx + 1);
        } else {
            calculateResult({ ...answers, [currentQuestionIdx]: option });
        }
    };

    const calculateResult = (finalAnswers) => {
        let correctCount = 0;
        questions.forEach((q, idx) => {
            if (finalAnswers[idx] === q.answer) {
                correctCount++;
            }
        });

        setScore(correctCount);

        // Determine level based on correct answers and question difficulty
        if (correctCount <= 3) {
            setRecommendedLevel('Elementary');
        } else if (correctCount <= 6) {
            setRecommendedLevel('Middle');
        } else if (correctCount <= 9) {
            setRecommendedLevel('High');
        } else {
            setRecommendedLevel('College');
        }

        setCurrentStep('result');
    };

    const progress = ((currentQuestionIdx + 1) / questions.length) * 100;

    if (currentStep === 'start') {
        return (
            <div className="min-h-screen bg-warm-cream staff-lines py-20 px-4">
                <div className="max-w-3xl mx-auto text-center page-transition">
                    <div className="music-card p-12 border-2 border-royal-purple-100">
                        <div className="text-6xl mb-6">🎯</div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-royal-purple-900 mb-6">
                            Music Placement Diagnostic
                        </h1>
                        <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                            Find your perfect starting point in our curriculum. This short test will assess
                            your knowledge of music theory, instruments, and history.
                        </p>

                        <div className="grid grid-cols-3 gap-6 mb-12">
                            <div className="p-4 bg-royal-purple-50 rounded-xl">
                                <div className="text-2xl mb-1">📋</div>
                                <div className="text-sm font-bold text-royal-purple-700">12 Questions</div>
                            </div>
                            <div className="p-4 bg-passion-pink-50 rounded-xl">
                                <div className="text-2xl mb-1">⏱️</div>
                                <div className="text-sm font-bold text-passion-pink-700">~5 Minutes</div>
                            </div>
                            <div className="p-4 bg-music-gold-50 rounded-xl">
                                <div className="text-2xl mb-1">🚀</div>
                                <div className="text-sm font-bold text-music-gold-700">Smart Placement</div>
                            </div>
                        </div>

                        <button onClick={handleStart} className="btn-primary text-xl px-12 py-4">
                            Start Diagnostic Test
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 'test') {
        const q = questions[currentQuestionIdx];
        return (
            <div className="min-h-screen bg-warm-cream staff-lines py-20 px-4">
                <div className="max-w-2xl mx-auto page-transition">
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-bold text-royal-purple-600 uppercase tracking-wider">
                                Question {currentQuestionIdx + 1} of {questions.length}
                            </span>
                            <span className="text-xs font-semibold px-2 py-1 bg-royal-purple-100 text-royal-purple-700 rounded-md">
                                Level: {q.level}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="music-card p-10">
                        <h2 className="text-2xl md:text-3xl font-display font-bold text-royal-purple-900 mb-8 leading-tight">
                            {q.question}
                        </h2>

                        <div className="grid gap-4">
                            {q.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(option)}
                                    className="w-full text-left p-5 rounded-xl border-2 border-gray-100 hover:border-royal-purple-400 hover:bg-royal-purple-50 transition-all group flex justify-between items-center"
                                >
                                    <span className="text-lg text-gray-700 group-hover:text-royal-purple-900 transition-colors font-medium">
                                        {option}
                                    </span>
                                    <span className="opacity-0 group-hover:opacity-100 text-royal-purple-400 transition-opacity">→</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 'result') {
        const badgeClass = recommendedLevel === 'Elementary' ? 'level-badge-elementary' :
            recommendedLevel === 'Middle' ? 'level-badge-middle' :
                recommendedLevel === 'High' ? 'level-badge-high' : 'level-badge-college';

        const levelDescription = {
            'Elementary': "You're just starting your musical journey! Our elementary curriculum will build your foundation in notes and basic rhythms.",
            'Middle': "You have a solid foundation. Our middle level courses will introduce you to more complex scales and orchestral concepts.",
            'High': "You're an advanced student! Our high school level courses will challenge you with advanced theory and composition.",
            'College': "Expert level! Our college-level resources cover professional performance, counterpoint, and advanced harmony."
        };

        return (
            <div className="min-h-screen bg-warm-cream staff-lines py-20 px-4">
                <div className="max-w-3xl mx-auto text-center page-transition">
                    <div className="music-card p-12">
                        <div className="text-6xl mb-6">🎓</div>
                        <h1 className="text-4xl font-display font-bold text-royal-purple-900 mb-2">
                            Result Calculated!
                        </h1>
                        <p className="text-gray-500 mb-8">You scored {score}/{questions.length} correct</p>

                        <div className="mb-10">
                            <span className="text-gray-600 block mb-2 font-medium uppercase tracking-widest text-xs">Recommended Level</span>
                            <div className={`level-badge ${badgeClass} text-2xl px-8 py-3 shadow-lg`}>
                                {recommendedLevel} Level
                            </div>
                        </div>

                        <p className="text-xl text-gray-700 mb-10 max-w-xl mx-auto leading-relaxed">
                            {levelDescription[recommendedLevel]}
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center">
                            <Link href="/curriculum" className="btn-primary px-8 py-4">
                                View My Courses
                            </Link>
                            <button onClick={() => {
                                setCurrentStep('start');
                                setCurrentQuestionIdx(0);
                                setAnswers({});
                            }} className="btn-secondary px-8 py-4">
                                Retake Test
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
