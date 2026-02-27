import { forwardRef } from 'react';

export const Card = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 ${className}`} {...props} />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className = '', ...props }, ref) => (
  <h3
    ref={ref as React.Ref<HTMLParagraphElement>}
    className={`font-semibold text-slate-800 ${className}`}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = 'CardContent';
