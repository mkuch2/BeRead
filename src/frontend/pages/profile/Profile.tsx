import axios from "axios";
import { useState, useEffect } from "react";
import {
  useAuthContext,
  type AuthContextType,
} from "@/frontend/hooks/useAuthContext";
import { useNavigate } from "react-router";

interface UserProfile {
  username: string;
}

function Profile() {
  const { currentUser, getToken } = useAuthContext() as AuthContextType;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      //User not logged in
      if (!currentUser) {
        navigate("/login");
        return;
      }

      try {
        const token = await getToken();

        if (!token) {
          setError(true);
          throw new Error("No authentication token available");
        }

        const response = await axios.get("/api/profile", {
          headers: {
            auth: token,
          },
        });

        setProfile(response.data.profile);
      } catch (e) {
        if (e instanceof Error) {
          setError(true);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [currentUser, navigate, getToken]);

  if (isLoading) {
    return <div>Loading profile..</div>;
  }

  if (error) {
    return <div>An error occurred! Please sign out and sign back in</div>;
  }

  if (!profile) {
    return <div>Error loading profile</div>;
  }

  return (
    <>
      <h1>Profile Page</h1>

      <h3>Username: {profile.username}</h3>
    </>
  );
}

export default Profile;
