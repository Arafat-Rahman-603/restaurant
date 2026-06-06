import { OrderStatus } from '@/types';

export const formatPrice = (price?: number | null): string => {
  if (price === undefined || price === null) return '৳0';
  return `৳${price.toLocaleString('en-BD')}`;
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('en-BD', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
};

export const getStatusClass = (status: OrderStatus): string => {
  const map: Record<OrderStatus, string> = {
    'Pending': 'status-pending',
    'Confirmed': 'status-confirmed',
    'Preparing': 'status-preparing',
    'Out For Delivery': 'status-out-for-delivery',
    'Delivered': 'status-delivered',
    'Cancelled': 'status-cancelled',
  };
  return map[status] || '';
};

export const getStatusStep = (status: OrderStatus): number => {
  const steps: OrderStatus[] = ['Pending', 'Confirmed', 'Preparing', 'Out For Delivery', 'Delivered'];
  return steps.indexOf(status);
};

export const truncate = (str: string, length: number): string =>
  str.length > length ? str.substring(0, length) + '...' : str;

export const getImageUrl = (images: string[], index = 0): string => {
  if (!images || images.length === 0) return 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800';
  return images[index] || images[0];
};

export const calculateDiscount = (price: number, discountPrice?: number | null): number => {
  if (!discountPrice || discountPrice >= price) return 0;
  return Math.round(((price - discountPrice) / price) * 100);
};

export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(' ');
