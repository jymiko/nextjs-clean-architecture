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
      className="bg-[#f6faff] dark:bg-zinc-800 h-[164px] w-[145px] rounded-lg p-4 relative cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleClick}
    >
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 h-3 w-3 p-0 hover:bg-gray-200"
        onClick={handleRemove}
      >
        <X className="h-3 w-3 text-gray-500" />
      </Button>

      {/* Avatar */}
      <div className="w-[76px] h-[76px] mx-auto mb-2">
        <Avatar className="w-full h-full">
          <AvatarImage src={account.avatar} alt={account.name} />
          <AvatarFallback className="bg-[#4db1d4] text-white text-2xl font-medium w-full h-full">
            {(account.name || account.email).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* User info */}
      <div className="text-center">
        <p className="text-[15px] font-medium text-[#243644] dark:text-white mb-1">
          {account.name}
        </p>
        {account.lastLogin && (
          <p className="text-[13px] text-[#a4b4c8] dark:text-gray-400">
            {formatLastLogin(account.lastLogin)}
          </p>
        )}
      </div>
    </div>
  );
}