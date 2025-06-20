import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/frontend/components/ui/card";

import { useCallback, useEffect, useState } from "react";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import NavBar from "./NavBar";
import { Link } from "react-router";
import FriendRequest from "./FriendRequest";
import { Post } from "./Post";
import { logger } from "@/frontend/lib/logger";

interface RelationshipResponse {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  requester: {
    username: string;
    name: string;
    currentlyReadingTitle: string;
    currentlyReadingThumbnail: string;
  };
  addressee: {
    username: string;
    name: string;
    currentlyReadingTitle: string;
    currentlyReadingThumbnail: string;
  };
}

interface FriendInterface {
  uid: string;
  username: string;
  name: string;
  currentlyReadingTitle: string;
  currentlyReadingThumbnail: string;
}

interface PostInterface {
  id: string;
  book_title: string;
  pages: string;
  content: string;
  quote: string;
  username: string;
  published_at: string;
  likes: number;
  dislikes: number;
  author: string[];
  thumbnail?: string | null;
}

export default function FriendsList() {
  const [loading, setLoading] = useState<boolean>(false);
  const [friends, setFriends] = useState<FriendInterface[]>([]);
  const [requests, setRequests] = useState<RelationshipResponse[]>([]);
  const { currentUser, getToken } = useAuthContext() as AuthContextType;
  const [friendPosts, setFriendPosts] = useState<PostInterface[]>([]);

  const getRequests = useCallback(async () => {
    if (!currentUser) {
      logger.log("Current user not found");
      return;
    }

    setLoading(true);

    logger.log("Get requests being called");

    try {
      const token = await getToken();

      const response = await axios.get("/api/friend-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logger.log("friendlist get requests response", response);
      setRequests(response.data);
    } catch (e) {
      logger.log("Error getting requests", e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, getToken]);

  const getFriends = useCallback(async () => {
    if (!currentUser) {
      logger.log("Current user not found");
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();

      const response = await axios.get("/api/friends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const friends = response.data.map(
        (relationship: RelationshipResponse) => {
          if (relationship.requester_id === currentUser?.uid) {
            return {
              uid: relationship.addressee_id,
              username: relationship.addressee.username,
              name: relationship.addressee.name,
              currentlyReadingTitle:
                relationship.addressee.currentlyReadingTitle,
              currentlyReadingThumbnail:
                relationship.addressee.currentlyReadingThumbnail,
            };
          } else {
            return {
              uid: relationship.requester_id,
              username: relationship.requester.username,
              name: relationship.requester.name,
              currentlyReadingTitle:
                relationship.requester.currentlyReadingTitle,
              currentlyReadingThumbnail:
                relationship.requester.currentlyReadingThumbnail,
            };
          }
        }
      );

      setFriends(friends);
    } catch (e) {
      logger.log("Error getting friends: ", e);
    } finally {
      setLoading(false);
    }
  }, [currentUser, getToken]);

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  useEffect(() => {
    getRequests();
  }, [getRequests]);

  useEffect(() => {
    const fetchFriendPosts = async () => {
      if (!currentUser) return;
      const token = await getToken();
      try {
        const response = await axios.get("/api/posts/friends", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriendPosts(response.data);
      } catch (e) {
        logger.log("Error fetching friends' posts:", e);
        setFriendPosts([]);
      }
    };
    fetchFriendPosts();
  }, [currentUser, getToken]);

  const onRequestAction = useCallback(async () => {
    await getRequests();
    await getFriends();
  }, [getFriends, getRequests]);

  if (loading) {
    return <div>Loading friends...</div>;
  }

  return (
    <div className="space-y-4">
      <NavBar />
      <div className="flex justify-start">
        <Link
          to="/friend-search"
          className="bg-white text-black px-2 text-sm rounded-full font-medium hover:opacity-90"
        >
          Find Friends
        </Link>
      </div>
      <h2 className="text-xl font-semibold">Friends List</h2>
      {friends.length === 0 ? (
        <p className="text-gray-500 mt-6">
          No friends yet. Send some friend requests!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <Card
              key={friend.uid}
              className="py-1 px-2 max-w-xs w-full mx-auto"
            >
              <CardHeader>
                <Link to={`/display-profile/${friend.username}`}>
                  <CardTitle>{friend.name || friend.username}</CardTitle>{" "}
                </Link>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">@{friend.username}</p>
                {friend.currentlyReadingTitle && (
                  <div className="mt-2">
                    <p className="text-sm">Currently Reading:</p>
                    <p className="font-medium">
                      {friend.currentlyReadingTitle}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div>
        <h1 className="text-xl font-semibold mt-6">Incoming Friend Requests</h1>
        {requests.length === 0 ? (
          <p className="text-gray-500 mt-2">No incoming friend requests.</p>
        ) : (
          <div>
            {requests.map((request) => (
              <FriendRequest
                username={request.requester.username}
                reqId={request.id}
                key={request.id}
                onRequestAction={onRequestAction}
              />
            ))}
          </div>
        )}
      </div>
      <div>
        <h1 className="text-xl font-semibold mt-6">Friend's Posts</h1>
        {friendPosts.length === 0 ? (
          <p className="text-gray-500 mt-2">No posts from friends yet.</p>
        ) : (
          <div className="grid gap-4 mt-2">
            {friendPosts.map((post) => (
              <Post
                username={post.username}
                published_at={post.published_at}
                title={post.book_title}
                content={post.content}
                quote={post.quote}
                likes={post.likes}
                dislikes={post.dislikes}
                post_id={post.id}
                author={post.author}
                preview={true}
                post={post}
                key={post.id}
                thumbnail={post.thumbnail ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
