'use client';

interface User {
  id: string;
  name?: string;
  email: string;
  lastLogin?: string;
}

interface LoginAsCardProps {
  user: User;
  onCancel?: () => void;
}

export function LoginAsCard({ user, onCancel }: LoginAsCardProps) {
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
    <div className="bg-[#f6faff] dark:bg-zinc-800 h-[164px] w-[145px] rounded-lg p-4 relative">
      {/* Cancel button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 w-3 h-3 flex items-center justify-center hover:opacity-70"
        >
          <svg
            className="w-3 h-3 text-gray-400"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Avatar */}
      <div className="w-[76px] h-[76px] mx-auto mb-2">
        <div className="w-full h-full bg-[#4db1d4] rounded-full flex items-center justify-center">
          <span className="text-white text-2xl font-medium">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* User info */}
      <div className="text-center">
        <p className="text-[15px] font-medium text-[#243644] dark:text-white mb-1">
          {user.name || user.email}
        </p>
        {user.lastLogin && (
          <p className="text-[13px] text-[#a4b4c8] dark:text-gray-400">
            {formatLastLogin(user.lastLogin)}
          </p>
        )}
      </div>
    </div>
  );
}