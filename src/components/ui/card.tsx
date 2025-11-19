import React from 'react';

const cn = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = ({ className, ...props }: CardProps) => (
  <div
    className={cn('rounded-xl border border-border bg-card text-card-foreground shadow', className)}
    {...props}
  />
);

const CardHeader = ({ className, ...props }: CardProps) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
);

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted-foreground', className)} {...props} />
);

const CardContent = ({ className, ...props }: CardProps) => (
  <div className={cn('p-6 pt-0', className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent };
