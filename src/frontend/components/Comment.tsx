import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { formatDate } from "../lib/utils";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import axios from "axios";
import { useEffect, useState } from "react";
import ReplyForm from "./ReplyForm";
import { useCallback } from "react";

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
  const [reactionError, setReactionError] = useState<string>("");
  const { currentUser, getToken } = useAuthContext() as AuthContextType;
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [replies, setReplies] = useState<CommentInterface[]>([]);
  const [showReplyForm, setShowReplyForm] = useState<boolean>(false);

  useEffect(() => {
    async function getReplies() {
      try {
        const response = await axios.get(`/api/comments/replies/${comment_id}`);
        setReplies(response.data);
      } catch (e) {
        console.log("Error getting replies: ", e);
      }
    }

    getReplies();
  }, [comment_id]);

  useEffect(() => {
    async function getReactions() {
      if (!currentUser) return;

      console.log("Comment id:", comment_id);

      try {
        const token = await getToken();

        const reactions = await axios.get(
          `/api/comment-reaction?query=${encodeURIComponent(comment_id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Comment reactions", reactions);

        setUserReaction(reactions.data?.type || null);
      } catch (e) {
        console.log("Error getting comment reactions: ", e);
        setReactionError("Error getting comment reactions");
      }
    }

    getReactions();
  }, [currentUser, comment_id, getToken]);

  const handleReaction = async (type: string) => {
    if (!currentUser) return;

    setLoading(true);

    try {
      const newType = userReaction === type ? "none" : type;

      const token = await getToken();
      const response = await axios.post(
        "/api/comment-reaction",
        {
          comment_id: comment_id,
          type: newType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("comment reaction response", response);

      setUserReaction(newType === "none" ? null : newType);
      setLikes(response.data.comment.likes);
      setDislikes(response.data.comment.dislikes);
    } catch (e) {
      console.log("Error updating comment reaction: ", e);
      setReactionError("Error updating comment reaction");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = useCallback(async () => {
    setShowReplyForm(false);

    try {
      const response = await axios.get(`/api/comments/replies/${comment_id}`);
      setReplies(response.data);
    } catch (e) {
      console.log("Error getting replies in handleReply: ", e);
    }

    if (onReplyAdd) {
      onReplyAdd();
    }
  }, [comment_id, onReplyAdd]);

  return (
    <div className="space-y-3 mt-6 w-full">
      <Card>
        <CardHeader>
          {username} posted at {formattedDate}:
        </CardHeader>
        <CardContent>
          <div>{content}</div>
          <div className="flex space-x-4 justify-end">
            <button
              onClick={() => handleReaction("like")}
              disabled={loading}
              className="cursor-pointer"
            >
              <p
                className={`hover:text-white ${
                  userReaction === "like"
                    ? "text-gray-400 font-bold"
                    : "text-gray-600"
                }`}
              >
                Like {likes}
              </p>
            </button>
            <button
              onClick={() => handleReaction("dislike")}
              disabled={loading}
              className="cursor-pointer"
            >
              <p
                className={`hover:text-white ${
                  userReaction === "dislike"
                    ? "text-gray-400 font-bold"
                    : "text-gray-600"
                }`}
              >
                Dislike {dislikes}
              </p>
            </button>
            <Button
              onClick={() => setShowReplyForm(!showReplyForm)}
              disabled={!currentUser}
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
        <div className="replies mt-6 w-[95%] ml-auto">
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
