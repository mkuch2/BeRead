import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/frontend/components/ui/card";

import { useCallback, useEffect, useState } from "react";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import NavBar from "./NavBar";
import { Link } from "react-router";
import FriendRequest from "./FriendRequest";

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

export default function FriendsList() {
  const [loading, setLoading] = useState<boolean>(false);
  const [friends, setFriends] = useState<FriendInterface[]>([]);
  const [requests, setRequests] = useState<RelationshipResponse[]>([]);
  const { currentUser, getToken } = useAuthContext() as AuthContextType;

  const getRequests = useCallback(async () => {
    if (!currentUser) {
      console.log("Current user not found");
      return;
    }

    setLoading(true);

    console.log("Get requests being called");

    try {
      const token = await getToken();

      const response = await axios.get("/api/friend-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("friendlist get requests response", response);
      setRequests(response.data);
    } catch (e) {
      console.log("Error getting requests", e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser, getToken]);

  const getFriends = useCallback(async () => {
    if (!currentUser) {
      console.log("Current user not found");
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
      console.log("Error getting friends: ", e);
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
      <Link to="/friend-search">Find Friends</Link>
      <h2 className="text-xl font-semibold">Friends List</h2>
      {friends.length === 0 ? (
        <p className="text-gray-500">
          No friends yet. Send some friend requests!
        </p>
      ) : (
        <div className="grid gap-4">
          {friends.map((friend) => (
            <Card key={friend.uid} className="p-4">
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
        <h1>Incoming Friend Requests</h1>
        <div>
          {requests.map((request) => (
            <FriendRequest
              username={request.requester.username}
              reqId={request.id}
              requester_id={request.requester_id}
              key={request.id}
              onRequestAction={onRequestAction}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
