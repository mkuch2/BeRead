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
import { decode } from "html-entities";
import { Link } from "react-router";
import { type PostInterface } from "./PostSearch";

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
  preview: boolean;
  post: PostInterface;
  thumbnail?: string | null;
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
  preview = false,
  post,
  thumbnail = null,
}: PostProps) {
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [dislikes, setDislikes] = useState<number>(initialDislikes);
  const [reactionError, setReactionError] = useState<string>("");
  const { currentUser, getToken } = useAuthContext() as AuthContextType;

  const formattedDate = formatDate(published_at);
  const decodedTitle = decode(title);

  useEffect(() => {
    async function getReactions() {
      if (!currentUser) {
        setUserReaction(null);
        return;
      }

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

  const renderThumbnail = (isPreview: boolean) => {
    if (thumbnail) {
      if (isPreview) {
        return (
          <div className="w-full h-48 overflow-hidden flex items-center justify-center">
            <img
              src={thumbnail}
              alt={`${title} cover`}
              className="object-contain max-h-48"
            />
          </div>
        );
      } else {
        return (
          <img
            src={thumbnail}
            alt={`${title} cover`}
            className="object-cover w-full h-full"
          />
        );
      }
    } else {
      // Without Thumbnail
      if (isPreview) {
        return (
          <div className="w-full h-48 bg-gray-800 rounded-md flex items-center justify-center">
            <span className="text-gray-600">No Image</span>
          </div>
        );
      } else {
        return (
          <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
            <span className="text-zinc-400">No Image</span>
          </div>
        );
      }
    }
  };

  if (preview) {
    return (
      <div className="w-full flex justify-center px-4">
        <Card className="w-full max-w-sm mb-6 rounded-lg border border-zinc-800 bg-zinc-900 text-white shadow-sm">
          <CardHeader className="px-4 pt-3 pb-1">
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <Link to={`/display-profile/${username}`} className="font-semibold text-white hover:underline">
                {username}
              </Link>
              <span>{formattedDate}</span>
            </div>
          </CardHeader>
  
          <Link to="/display-post" state={{ post }} className="cursor-pointer">
            <div className="w-full h-44 overflow-hidden flex justify-center items-center border-y border-zinc-800">
              {renderThumbnail(true)}
            </div>
  
            <div className="px-4 py-2 text-center">
              <CardTitle className="text-lg font-bold leading-snug">{decodedTitle}</CardTitle>
              <p className="italic text-xs text-zinc-400">{author.join(", ")}</p>
              <p className="mt-1 text-sm text-zinc-100 whitespace-pre-wrap">{content}</p>
            </div>
          </Link>
  
          <CardFooter className="px-4 py-2 border-t border-zinc-800 flex flex-col items-center gap-1">
            <blockquote className="italic text-xs text-zinc-500 text-center">"{quote}"</blockquote>
            <div className="flex gap-6 mt-1 text-sm">
              <button
                onClick={() => handleReaction("like")}
                disabled={loading}
                className="cursor-pointer"
              >
                <span className={`flex items-center gap-1 ${userReaction === "like" ? "text-green-400 font-semibold" : "text-zinc-400"}`}>
                  👍 {likes}
                </span>
              </button>
              <button
                onClick={() => handleReaction("dislike")}
                disabled={loading}
                className="cursor-pointer"
              >
                <span className={`flex items-center gap-1 ${userReaction === "dislike" ? "text-red-400 font-semibold" : "text-zinc-400"}`}>
                  👎 {dislikes}
                </span>
              </button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="w-full flex justify-start px-4">
      <Card className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 text-white">
        <CardHeader className="px-4 pt-3 pb-1">
          <div className="flex justify-between items-center text-xs text-zinc-400">
            <Link to={`/display-profile/${username}`} className="font-semibold text-white hover:underline">
              {username}
            </Link>
            <span>{formattedDate}</span>
          </div>
        </CardHeader>
  
        <div className="w-full h-52 overflow-hidden flex justify-center items-center border-y border-zinc-800">
          {renderThumbnail(true)}
        </div>
  
        <div className="px-4 py-2 text-center">
          <CardTitle className="text-lg font-bold leading-snug">{decodedTitle}</CardTitle>
          <p className="italic text-xs text-zinc-400">{author.join(", ")}</p>
          <p className="mt-1 text-sm text-zinc-100 whitespace-pre-wrap">{content}</p>
        </div>
  
        <CardFooter className="px-4 py-2 border-t border-zinc-800 flex flex-col items-center gap-1">
          <blockquote className="italic text-xs text-zinc-500 text-center">"{quote}"</blockquote>
          <div className="flex gap-6 mt-1 text-sm">
            <button
              onClick={() => handleReaction("like")}
              disabled={loading}
              className="cursor-pointer"
            >
              <span className={`flex items-center gap-1 ${userReaction === "like" ? "text-green-400 font-semibold" : "text-zinc-400"}`}>
                👍 {likes}
              </span>
            </button>
            <button
              onClick={() => handleReaction("dislike")}
              disabled={loading}
              className="cursor-pointer"
            >
              <span className={`flex items-center gap-1 ${userReaction === "dislike" ? "text-red-400 font-semibold" : "text-zinc-400"}`}>
                👎 {dislikes}
              </span>
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
  
}
