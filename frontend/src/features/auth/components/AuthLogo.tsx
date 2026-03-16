import { Zap } from 'lucide-react';

interface AuthLogoProps {
  size?: 'sm' | 'lg';
}

export function AuthLogo({ size = 'lg' }: AuthLogoProps) {
  const isLarge = size === 'lg';
  return (
    <div className="flex items-center gap-3">
      <Zap
        className={`${isLarge ? 'w-9 h-9' : 'w-6 h-6'} text-primary fill-primary/20`}
      />
      <span
        className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}
      >
        StudySolo
      </span>
    </div>
  );
}
