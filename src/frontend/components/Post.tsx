// src/app/components/Post.tsx
import React, { useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/frontend/components/ui/card";

interface PostProps {
  username: string;
  published_at: string;
  title: string;
  content: string;
  quote: string;
}

export function Post({
  username,
  published_at,
  title,
  content,
  quote,
}: PostProps) {
  const formattedDate = useMemo(() => {
    const date = new Date(published_at);

    const formatted = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);

    return formatted;
  }, [published_at]);

  return (
    <Card className="max-w-2xl mx-auto mb-6">
      <CardHeader>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span className="font-medium">{username}</span>
          <span className="text-xs">posted</span>
          <span className="text-xs">{formattedDate}</span>
        </div>
        <CardTitle className="mt-2 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-1">
        <p className="whitespace-pre-wrap text-base text-foreground">
          {content}
        </p>
      </CardContent>
      <CardFooter className="mt-4 pt-4 border-t">
        <blockquote className="italic text-sm text-muted-foreground">
          “{quote}”
        </blockquote>
      </CardFooter>
    </Card>
  );
}
