'use client';

import { LastAccount } from '@/types/last-accounts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface LastAccountCardProps {
  account: LastAccount;
  onSelect: (email: string) => void;
  onRemove: (email: string) => void;
}

export function LastAccountCard({ account, onSelect, onRemove }: LastAccountCardProps) {
  const handleClick = () => {
    onSelect(account.email);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(account.email);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastLogin = (lastLoginDate: string) => {
    const date = new Date(lastLoginDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Active today';
    } else if (diffDays === 1) {
      return 'Active 1 day ago';
    } else {
      return `Active ${diffDays} days ago`;
    }
  };

  return (
    <div
      className="bg-[#f6faff] h-[164px] w-[145px] rounded-[9px] p-[15px] relative cursor-pointer hover:shadow-md transition-shadow flex flex-col items-center justify-between"
      onClick={handleClick}
    >
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-[8px] right-[8px] h-[13px] w-[13px] p-0 hover:bg-transparent"
        onClick={handleRemove}
      >
        <X className="h-[13px] w-[13px] text-gray-400" />
      </Button>

      {/* Avatar */}
      <div className="w-[76px] h-[76px] shrink-0 mt-[5px]">
        <Avatar className="w-full h-full">
          <AvatarImage src={account.avatar} alt={account.name} />
          <AvatarFallback className="bg-[#4db1d4] text-white text-2xl font-medium w-full h-full">
            {(account.name || account.email).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* User info */}
      <div className="text-center">
        <p className="text-[15px] font-medium text-[#243644] leading-tight">
          {account.name}
        </p>
        {account.lastLogin && (
          <p className="text-[13px] text-[#a4b4c8] mt-[2px]">
            {formatLastLogin(account.lastLogin)}
          </p>
        )}
      </div>
    </div>
  );
}