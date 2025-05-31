import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/frontend/components/ui/card";
import { formatDate } from "../lib/utils";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import axios from "axios";
import { useEffect, useState } from "react";

export interface CommentProps {
  username: string;
  published_at: string;
  content: string;
  replies: CommentInterface[];
  likes: number;
  dislikes: number;
  comment_id: string;
}

export interface CommentInterface {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  published_at: string;
  username: string;
  replies: CommentInterface[];
  likes: number;
  dislikes: number;
}

export function Comment({
  username,
  published_at,
  content,
  replies,
  likes: initialLikes,
  dislikes: initialDislikes,
  comment_id,
}: CommentProps) {
  const formattedDate = formatDate(published_at);
  const [loading, setLoading] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [dislikes, setDislikes] = useState<number>(initialDislikes);
  const [reactionError, setReactionError] = useState<string>("");
  const { currentUser, getToken } = useAuthContext() as AuthContextType;
  const [userReaction, setUserReaction] = useState<string | null>(null);

  useEffect(() => {
    async function getReactions() {
      if (!currentUser) return;

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

        setUserReaction(reactions.data.type);
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

  return (
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
              className={`${
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
              className={`${
                userReaction === "dislike"
                  ? "text-gray-400 font-bold"
                  : "text-gray-600"
              }`}
            >
              Dislike {dislikes}
            </p>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default Comment;
