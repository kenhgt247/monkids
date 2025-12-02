import React from 'react';
import { Community } from '../types';
import Button from './Button';
import { Users, Check } from 'lucide-react';

interface CommunityCardProps {
  community: Community;
  isJoined: boolean;
  onJoin: (id: string) => void;
  onLeave: (id: string) => void;
  onClick: (community: Community) => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, isJoined, onJoin, onLeave, onClick }) => {
  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn kích hoạt onClick của card
    if (isJoined) {
      onLeave(community.id);
    } else {
      onJoin(community.id);
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
      onClick={() => onClick(community)}
    >
      {/* Cover Image */}
      <div className="h-24 w-full relative overflow-hidden">
        <img 
          src={community.coverUrl} 
          alt={community.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
      </div>

      <div className="p-4 pt-10 relative flex-1 flex flex-col">
        {/* Avatar */}
        <div className="absolute -top-8 left-4 p-1 bg-white rounded-xl shadow-sm">
            <img 
              src={community.avatarUrl} 
              alt={community.name} 
              className="w-16 h-16 rounded-lg object-cover"
            />
        </div>

        <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1" title={community.name}>
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
            className={`w-full mt-auto ${isJoined ? 'bg-gray-50 border-gray-200 text-gray-600' : ''}`}
            onClick={handleJoinClick}
        >
            {isJoined ? (
                <>
                    <Check size={16} className="mr-2" /> Đã tham gia
                </>
            ) : "Tham gia nhóm"}
        </Button>
      </div>
    </div>
  );
};

export default CommunityCard;