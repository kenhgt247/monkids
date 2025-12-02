
import React, { useState, useEffect, useRef } from 'react';
import { Story, User } from '../types';
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface StoryViewerProps {
    groupedStories: { user: User; stories: Story[] }[];
    initialUserIndex: number;
    onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ groupedStories, initialUserIndex, onClose }) => {
    const [currentUserIndex, setCurrentUserIndex] = useState(initialUserIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const currentUserGroup = groupedStories[currentUserIndex];
    const currentStory = currentUserGroup?.stories[currentStoryIndex];
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const STORY_DURATION = 5000; // 5 seconds for images

    useEffect(() => {
        setProgress(0);
    }, [currentStoryIndex, currentUserIndex]);

    useEffect(() => {
        if (!currentStory || isPaused) return;

        let interval: NodeJS.Timeout;
        const step = 100; // update every 100ms

        if (currentStory.mediaType === 'image') {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        nextStory();
                        return 0;
                    }
                    return prev + (step / STORY_DURATION) * 100;
                });
            }, step);
        } else {
            // Video progress is handled by onTimeUpdate
        }

        return () => clearInterval(interval);
    }, [currentStory, isPaused, currentStoryIndex, currentUserIndex]);

    const nextStory = () => {
        if (currentStoryIndex < currentUserGroup.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
        } else {
            if (currentUserIndex < groupedStories.length - 1) {
                setCurrentUserIndex(prev => prev + 1);
                setCurrentStoryIndex(0);
            } else {
                onClose(); // End of all stories
            }
        }
    };

    const prevStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
        } else {
            if (currentUserIndex > 0) {
                setCurrentUserIndex(prev => prev - 1);
                // Go to last story of previous user
                setCurrentStoryIndex(groupedStories[currentUserIndex - 1].stories.length - 1);
            } else {
                // Beginning of everything
                setCurrentStoryIndex(0);
                setProgress(0);
            }
        }
    };

    const handleVideoUpdate = () => {
        if (videoRef.current) {
            const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(percentage);
            if (percentage >= 100) nextStory();
        }
    };

    if (!currentStory) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-6 right-6 z-50 text-white hover:opacity-70">
                <X size={32} />
            </button>

            {/* Main Content Area */}
            <div className="relative w-full max-w-md h-full md:h-[90vh] md:rounded-2xl overflow-hidden bg-gray-900 shadow-2xl">
                
                {/* Progress Bars */}
                <div className="absolute top-4 left-2 right-2 flex gap-1 z-20">
                    {currentUserGroup.stories.map((story, idx) => (
                        <div key={story.id} className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{ 
                                    width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%'
                                }}
                            ></div>
                        </div>
                    ))}
                </div>

                {/* User Info Header */}
                <div className="absolute top-8 left-4 z-20 flex items-center text-white">
                    <img src={currentUserGroup.user.avatar} className="w-10 h-10 rounded-full border-2 border-white/50 mr-3" />
                    <div>
                        <p className="font-bold text-sm shadow-sm">{currentUserGroup.user.name}</p>
                        <p className="text-xs text-white/70">
                            {(() => {
                                const diff = Date.now() - currentStory.createdAt;
                                const hours = Math.floor(diff / (1000 * 60 * 60));
                                if(hours > 0) return `${hours} giờ trước`;
                                const mins = Math.floor(diff / (1000 * 60));
                                return `${mins} phút trước`;
                            })()}
                        </p>
                    </div>
                </div>

                {/* Media */}
                <div className="w-full h-full flex items-center justify-center bg-black">
                    {currentStory.mediaType === 'image' ? (
                        <img src={currentStory.mediaUrl} className="w-full h-full object-cover" />
                    ) : (
                        <video 
                            ref={videoRef}
                            src={currentStory.mediaUrl} 
                            className="w-full h-full object-cover" 
                            autoPlay 
                            playsInline
                            onTimeUpdate={handleVideoUpdate}
                            onLoadedMetadata={() => videoRef.current?.play()}
                        />
                    )}
                </div>

                {/* Tap Zones */}
                <div className="absolute inset-0 z-10 flex">
                    <div 
                        className="w-1/3 h-full" 
                        onClick={prevStory}
                        onMouseDown={() => setIsPaused(true)}
                        onMouseUp={() => setIsPaused(false)}
                        onTouchStart={() => setIsPaused(true)}
                        onTouchEnd={() => setIsPaused(false)}
                    ></div>
                    <div 
                        className="w-2/3 h-full" 
                        onClick={nextStory}
                        onMouseDown={() => setIsPaused(true)}
                        onMouseUp={() => setIsPaused(false)}
                        onTouchStart={() => setIsPaused(true)}
                        onTouchEnd={() => setIsPaused(false)}
                    ></div>
                </div>

                {/* Navigation Arrows (Desktop) */}
                <button 
                    onClick={(e) => { e.stopPropagation(); prevStory(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 rounded-full hover:bg-white/20 hidden md:block"
                >
                    <ChevronLeft className="text-white" />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); nextStory(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 rounded-full hover:bg-white/20 hidden md:block"
                >
                    <ChevronRight className="text-white" />
                </button>

                {/* Footer Input placeholder (Visual only) */}
                <div className="absolute bottom-4 left-4 right-4 z-20">
                    <div className="flex gap-2">
                        <input type="text" placeholder="Gửi tin nhắn..." className="bg-transparent border border-white/50 rounded-full px-4 py-2 text-white placeholder-white/70 w-full text-sm focus:outline-none focus:border-white focus:bg-black/20" />
                        <button className="text-white p-2"><MoreHorizontal /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoryViewer;
