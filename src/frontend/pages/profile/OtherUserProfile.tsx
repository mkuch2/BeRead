import UserProfile from "@/frontend/components/UserProfile";
import NavBar from "@/frontend/components/NavBar";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  useAuthContext,
  type AuthContextType,
} from "@/frontend/hooks/useAuthContext";

export default function OtherUserProfile() {
  const { username } = useParams<{ username: string }>();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfileInterface | null>(null);
  const { currentUser } = useAuthContext() as AuthContextType;

  const navigate = useNavigate();

  interface Book {
    id: string;
    title: string;
    authors: string[];
    thumbnail?: string | null;
    description?: string;
    publishedDate?: string;
  }

  interface UserProfileInterface {
    username: string;
    name?: string;
    bio?: string;
    email?: string;
    favoriteBooks?: Book[];
    currentlyReading?: Book;
  }

  console.log(currentUser);

  useEffect(() => {
    if (currentUser?.displayName === username) {
      navigate("/display-profile");
      return;
    }
  }, [currentUser, username, navigate]);

  useEffect(() => {
    async function getProfile() {
      setIsLoading(true);
      setErrorMessage("");

      if (!username) {
        setErrorMessage("Could not get username of requested user.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`/api/user/profile/${username}`);

        setProfile(response.data);
      } catch (e) {
        console.log("Error getting profile: ", e);
        setErrorMessage("Could not get user profile");
      } finally {
        setIsLoading(false);
      }
    }

    getProfile();
  }, [username]);

  if (!username) {
    console.log("Could not get username");
    setErrorMessage("Could not get user's username");
  }

  if (isLoading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div>Loading profile...</div>
        </div>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <NavBar />
        <div className="mx-4 mb-4 bg-red-600 text-white p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <UserProfile {...profile} />
    </>
  );
}
