import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/frontend/components/ui/card";
import { formatDate } from "../lib/utils";
import { useEffect, useState } from "react";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import axios from "axios";

interface PostProps {
  username: string;
  published_at: string;
  title: string;
  content: string;
  quote: string;
  likes: number;
  dislikes: number;
  post_id: string;
  author: string[];
}

export function Post({
  username,
  published_at,
  title,
  content,
  quote,
  likes: initialLikes,
  dislikes: initialDislikes,
  post_id,
  author,
}: PostProps) {
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [dislikes, setDislikes] = useState<number>(initialDislikes);
  const [reactionError, setReactionError] = useState<string>("");
  const { currentUser, getToken } = useAuthContext() as AuthContextType;

  const formattedDate = formatDate(published_at);

  useEffect(() => {
    async function getReactions() {
      if (!currentUser) return;

      try {
        const token = await getToken();

        const reactions = await axios.get(
          `/api/reaction?query=${encodeURIComponent(post_id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("reactions", reactions);
        setUserReaction(reactions.data?.type || null);
      } catch (e) {
        console.log("Error getting reaction: ", e);
        setReactionError("Error getting reactions");
        setUserReaction(null);
      }
    }

    getReactions();
  }, [currentUser, post_id, getToken]);

  const handleReaction = async (type: string) => {
    if (!currentUser) return;

    setLoading(true);

    try {
      const newType = userReaction === type ? "none" : type;

      const token = await getToken();
      const response = await axios.post(
        "/api/reaction",
        {
          post_id: post_id,
          type: newType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("response", response);

      setUserReaction(newType === "none" ? null : newType);
      setLikes(response.data.post.likes);
      setDislikes(response.data.post.dislikes);
    } catch (e) {
      console.log("Error updating reaction: ", e);
      setReactionError("Error updating reactions");
    } finally {
      setLoading(false);
    }
  };

  console.log("User reaction", userReaction);

  return (
    <Card className="max-w-2xl mx-auto mb-6">
      <CardHeader>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <span className="font-medium">{username}</span>
          <span className="text-xs">posted</span>
          <span className="text-xs">{formattedDate}</span>
        </div>
        <CardTitle className="mt-2 text-xl">{title}</CardTitle>
        <CardTitle className="italic text-sm">{author.join(", ")}</CardTitle>
      </CardHeader>
      <CardContent className="mt-1">
        <p className="whitespace-pre-wrap text-base text-foreground">
          {content}
        </p>
      </CardContent>
      <CardFooter className="mt-4 pt-4 border-t">
        <blockquote className="italic text-sm text-muted-foreground">
          "{quote}"
        </blockquote>
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
      </CardFooter>
    </Card>
  );
}
