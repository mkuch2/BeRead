import axios from "axios";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import { Link } from "react-router";

interface FriendRequestProps {
  username: string;
  reqId: string;
  onRequestAction: () => void;
}

export default function FriendRequest({
  username,
  reqId,
  onRequestAction,
}: FriendRequestProps) {
  const { currentUser } = useAuthContext() as AuthContextType;

  const handleRequestAccept = async () => {
    const token = await currentUser?.getIdToken();

    if (!token) {
      console.log("Error getting user token");
      return;
    }

    try {
      const response = await axios.put(
        `/api/friend-request/${reqId}`,
        {
          status: "ACCEPTED",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onRequestAction();
      console.log("accept response", response);
    } catch (e) {
      console.log("Error accepting request", e);
    }
  };

  const handleRequestDeny = async () => {
    const token = await currentUser?.getIdToken();

    if (!token) {
      console.log("Error getting user token");
      return;
    }

    try {
      const response = await axios.delete(
        `/api/friend-request/reject/${reqId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onRequestAction();
      console.log("Reject request response", response);
    } catch (e) {
      console.log("Error rejecting request", e);
    }
  };

  return (
    <div>
      <span>
        <Link className="underline" to={`/display-profile/${username}`}>
          {username}
        </Link>{" "}
        sent you a friend request
      </span>

      <button
        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm cursor-pointer"
        onClick={handleRequestAccept}
      >
        Accept
      </button>
      <button
        className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm cursor-pointer"
        onClick={handleRequestDeny}
      >
        Deny
      </button>
    </div>
  );
}
