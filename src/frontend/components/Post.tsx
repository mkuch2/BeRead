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
      <Card className="w-full h-full mb-6 flex flex-col">
        <CardHeader>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to={`/display-profile/${username}`} className="hover:underline">
              <span className="font-medium">{username}</span>
            </Link>
            <span className="text-xs">posted</span>
            <span className="text-xs">{formattedDate}</span>
          </div>
          <Link
            to="/display-post"
            state={{ post: post }}
            className="book-card"
            style={{ cursor: "pointer" }}
          >
            {/* Thumbnail (Preview Mode) */}
            <div className="row-span-2 border-b border-zinc-700">
              {renderThumbnail(true)}
            </div>
            <CardTitle className="mt-2 text-xl">{decodedTitle}</CardTitle>
            <CardTitle className="italic text-sm">
              {author.join(", ")}
            </CardTitle>
          </Link>
        </CardHeader>

        <Link
          to="/display-post"
          state={{ post: post }}
          className="book-card"
          style={{ cursor: "pointer" }}
        >
          <CardContent className="mt-1">
            <p className="whitespace-pre-wrap text-base text-foreground">
              {content}
            </p>
          </CardContent>
        </Link>
        <CardFooter className="mt-auto pt-4 border-t">
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

  return (
    <Card className="max-w-2xl mx-auto mb-6">
      <div className="grid grid-cols-[1fr_2fr] grid-rows-[1fr_2fr_auto] gap-4">
        {/* Card top-left */}
        <div className="row-span-2 px-4 py-2 flex items-center justify-center border-zinc-700">
          {renderThumbnail(false)}
        </div>

        {/* Card top-right */}
        <div className="px-4 py-2 border-b border-zinc-700">
          <h2 className="text-xl font-semibold">{decodedTitle}</h2>
          <h3 className="italic text-sm text-muted-foreground">
            {author.join(", ")}
          </h3>
        </div>
        <div className="px-4 py-2 border-zinc-700 overflow-y-auto">
          <p className="whitespace-pre-wrap text-base text-foreground">
            {content}
          </p>
        </div>

        {/* Card bottom */}
        <div className="px-4 py-2 border-t col-span-2">
          <blockquote className="italic text-sm text-muted-foreground">
            "{quote}"
          </blockquote>

          <div className="mt-2 flex items-center justify-between">
            {/* Card bottom-left */}
            <div className="text-sm text-muted-foreground">
              <Link to={`/display-profile/${username}`} className="hover:underline">
                <span className="font-medium">{username}</span>
              </Link>
              <span className="text-xs">{formattedDate}</span>
            </div>

            {/* Card bottom-right */}
            <div className="flex space-x-4">
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
          </div>
        </div>
      </div>
    </Card>
  );
}
