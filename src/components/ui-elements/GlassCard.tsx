
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = ({ children, className }: GlassCardProps) => {
  return (
    <div className={cn("glass-card rounded-xl p-5", className)}>
      {children}
    </div>
  );
};

export default GlassCard;
