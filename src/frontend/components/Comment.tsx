import { Card, CardHeader, CardContent } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { formatDate } from "../lib/utils";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import ReplyForm from "./ReplyForm";
import { logger } from "@/frontend/lib/logger";

export interface CommentProps {
  username: string;
  published_at: string;
  content: string;
  likes: number;
  dislikes: number;
  comment_id: string;
  post_id: string;
  onReplyAdd?: () => void;
}

export interface CommentInterface {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  published_at: string;
  username: string;
  replies?: CommentInterface[];
  likes: number;
  dislikes: number;
  parent_comment_id?: string | null;
}

export function Comment({
  username,
  published_at,
  content,
  likes: initialLikes,
  dislikes: initialDislikes,
  comment_id,
  post_id,
  onReplyAdd,
}: CommentProps) {
  const formattedDate = formatDate(published_at);
  const [loading, setLoading] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [dislikes, setDislikes] = useState<number>(initialDislikes);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [replies, setReplies] = useState<CommentInterface[]>([]);
  const [showReplyForm, setShowReplyForm] = useState<boolean>(false);
  const { currentUser, getToken } = useAuthContext() as AuthContextType;

  useEffect(() => {
    async function getReplies() {
      try {
        const res = await axios.get(`/api/comments/replies/${comment_id}`);
        setReplies(res.data);
      } catch (e) {
        logger.error("Error fetching replies:", e);
      }
    }

    getReplies();
  }, [comment_id]);

  useEffect(() => {
    async function fetchReaction() {
      if (!currentUser) return;
      try {
        const token = await getToken();
        const res = await axios.get(
          `/api/comment-reaction?query=${encodeURIComponent(comment_id)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserReaction(res.data?.type || null);
      } catch (e) {
        logger.error("Error fetching comment reaction:", e);
      }
    }

    fetchReaction();
  }, [currentUser, comment_id, getToken]);

  const handleReaction = async (type: string) => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const token = await getToken();
      const newType = userReaction === type ? "none" : type;
      const res = await axios.post(
        "/api/comment-reaction",
        { comment_id, type: newType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserReaction(newType === "none" ? null : newType);
      setLikes(res.data.comment.likes);
      setDislikes(res.data.comment.dislikes);
    } catch (e) {
      logger.error("Failed to update comment reaction:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = useCallback(async () => {
    setShowReplyForm(false);
    try {
      const res = await axios.get(`/api/comments/replies/${comment_id}`);
      setReplies(res.data);
    } catch (e) {
      logger.error("Error fetching replies after reply:", e);
    }
    if (onReplyAdd) onReplyAdd();
  }, [comment_id, onReplyAdd]);

  return (
    <div className="w-full max-w-md">
      <Card className="p-4 bg-[#1c1c1e] text-white rounded-md shadow-sm">
        <CardHeader className="text-sm text-muted-foreground pb-2">
          <span className="font-medium">{username}</span>{" "}
          <span className="text-xs">posted at {formattedDate}</span>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-3">{content}</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleReaction("like")}
                disabled={loading}
                className="flex items-center gap-1 cursor-pointer"
              >
                <span className="text-green-400">👍</span>
                <span>{likes}</span>
              </button>
              <button
                onClick={() => handleReaction("dislike")}
                disabled={loading}
                className="flex items-center gap-1 cursor-pointer"
              >
                <span className="text-red-400">👎</span>
                <span>{dislikes}</span>
              </button>
            </div>
            <Button
              onClick={() => setShowReplyForm(!showReplyForm)}
              disabled={!currentUser}
              size="sm"
              className="text-xs"
            >
              Reply
            </Button>
          </div>
        </CardContent>
      </Card>

      {showReplyForm && (
        <ReplyForm
          post_id={post_id}
          parent_comment_id={comment_id}
          onReplyAdd={handleReply}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {replies.length > 0 && (
        <div className="mt-4 pl-4 border-l border-zinc-700">
          {replies.map((reply) => (
            <Comment
              key={reply.id}
              username={reply.username}
              published_at={reply.published_at}
              content={reply.content}
              likes={reply.likes}
              dislikes={reply.dislikes}
              comment_id={reply.id}
              post_id={post_id}
              onReplyAdd={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Comment;
