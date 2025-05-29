import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/frontend/components/ui/card";
import { formatDate } from "../lib/utils";

export interface CommentProps {
  username: string;
  published_at: string;
  content: string;
  replies: CommentProps[];
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  published_at: string;
  username: string;
  replies: Comment[];
}

export function Comment({
  username,
  published_at,
  content,
  replies,
}: CommentProps) {
  const formattedDate = formatDate(published_at);

  return (
    <Card>
      <CardHeader>
        {username} posted at {formattedDate}:
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}

export default Comment;
