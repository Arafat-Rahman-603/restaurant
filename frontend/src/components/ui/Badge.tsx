'use client';
import { OrderStatus } from '@/types';
import { cn, getStatusClass } from '@/lib/utils';

interface BadgeProps {
  status: OrderStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: BadgeProps) {
  const statusClass = getStatusClass(status);
  return (
    <span className={cn('px-3 py-1 rounded-full text-xs font-semibold', statusClass, className)}>
      {status}
    </span>
  );
}
