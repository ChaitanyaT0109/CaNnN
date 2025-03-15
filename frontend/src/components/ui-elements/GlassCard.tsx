
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const GlassCard = ({ children, className, style }: GlassCardProps) => {
  return (
    <div className={cn("glass-card rounded-xl p-5", className)} style={style}>
      {children}
    </div>
  );
};

export default GlassCard;
