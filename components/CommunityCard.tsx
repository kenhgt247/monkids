
import React, { useState } from 'react';
import { Community } from '../types';
import Button from './Button';
import { Users, Check, Loader2, LogOut, Plus } from 'lucide-react';

interface CommunityCardProps {
  community: Community;
  isJoined: boolean;
  onJoin: (id: string) => Promise<void>;
  onLeave: (id: string) => Promise<void>;
  onClick: (community: Community) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, isJoined, onJoin, onLeave, onClick }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (isLoading) return;

    setIsLoading(true);
    try {
        if (isJoined) {
            await onLeave(community.id);
        } else {
            await onJoin(community.id);
        }
    } catch (error) {
        console.error("Community action failed", error);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col h-full"
      onClick={() => onClick(community)}
    >
      <div className="h-24 w-full relative overflow-hidden">
        <img 
          src={community.coverUrl} 
          alt={community.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
      </div>

      <div className="p-4 pt-10 relative flex-1 flex flex-col">
        <div className="absolute -top-8 left-4 p-1 bg-white rounded-xl shadow-sm transition-transform group-hover:scale-105">
            <img 
              src={community.avatarUrl} 
              alt={community.name} 
              className="w-16 h-16 rounded-lg object-cover bg-gray-100"
            />
        </div>

        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1 font-heading" title={community.name}>
          {community.name}
        </h3>
        
        <div className="flex items-center text-gray-500 text-xs mb-3">
            <Users size={14} className="mr-1" />
            <span>{community.memberCount} thành viên</span>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
            {community.description}
        </p>

        <Button 
            size="sm" 
            variant={isJoined ? "outline" : "primary"}
            className={`w-full mt-auto flex items-center justify-center transition-all active:scale-95 ${
                isJoined 
                ? 'bg-gray-100 border-transparent text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200' 
                : 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg'
            }`}
            onClick={handleJoinClick}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : isJoined ? (
                <>
                    <span className="flex items-center group/btn">
                         <span className="flex items-center group-hover:hidden">
                            <Check size={16} className="mr-2" /> Đã tham gia
                         </span>
                         <span className="hidden group-hover:flex items-center">
                            <LogOut size={16} className="mr-2" /> Rời nhóm
                         </span>
                    </span>
                </>
            ) : (
                <>
                    <Plus size={16} className="mr-2" /> Tham gia
                </>
            )}
        </Button>
      </div>
    </div>
  );
};

export default CommunityCard;