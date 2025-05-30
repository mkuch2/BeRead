import * as React from "react";

import { cn } from "@/frontend/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
export const Card: React.FC<CardProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-background shadow-md rounded-lg border border-gray-200 overflow-hidden",
        className
      )}
      {...props}
    />
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardHeader: React.FC<CardHeaderProps> = ({ className, ...props }) => {
  return (
    <div className={cn("px-4 py-2 border-b border-gray-200", className)} {...props} />
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
export const CardTitle: React.FC<CardTitleProps> = ({ className, ...props }) => {
  return (
    <h3 className={cn("text-lg font-semibold", className)} {...props} />
  );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardContent: React.FC<CardContentProps> = ({ className, ...props }) => {
  return (
    <div className={cn("px-4 py-4", className)} {...props} />
  );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}
export const CardFooter: React.FC<CardFooterProps> = ({ className, ...props }) => {
  return (
    <div className={cn("px-4 py-2 border-t border-gray-200 text-sm text-gray-600", className)} {...props} />
  );
};