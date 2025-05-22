// src/app/components/Post.tsx
import React from "react";
import { cn } from "@/frontend/lib/utils";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/frontend/components/ui/card";

interface PostProps {
  username?: string;
  title: string;
  content: string;
  quote: string;
}

export function Post({ username = "User", title, content, quote }: PostProps) {
  return (
    <Card className="max-w-2xl mx-auto mb-6">
      <CardHeader>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span className="font-medium">{username}</span>
          <span className="text-xs">posted</span>
        </div>
        <CardTitle className="mt-2 text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="mt-1">
        <p className="whitespace-pre-wrap text-base text-foreground">{content}</p>
      </CardContent>
      <CardFooter className="mt-4 pt-4 border-t">
        <blockquote className="italic text-sm text-muted-foreground">“{quote}”</blockquote>
      </CardFooter>
    </Card>
  );
}
