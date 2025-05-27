import axios from "axios";
import { useState, useEffect } from "react";
import {
  useAuthContext,
  type AuthContextType,
} from "@/frontend/hooks/useAuthContext";
import { useNavigate, Link } from "react-router";
import { FirebaseError } from "firebase/app";

interface UserProfile {
  username: string;
}

function Profile() {
  const { currentUser, getToken, signOut } = useAuthContext() as AuthContextType;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e.code, e.message);
      }
    }
  };

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
      <header className="border border-zinc-600 flex justify-between items-center px-4 py-2 mb-2">
        <div className="flex items-center space-x-4">
          <h1 className="font-bold text-xl text-white">BeRead</h1>
          <Link to="/books" className="text-sm font-light text-zinc-400">Search Books</Link>
          <Link to="/profile" className="text-sm font-light text-zinc-400">Profile</Link>
        </div>
        <button type="button" onClick={handleSignOut} className="text-sm font-light text-zinc-400 ml-2">Logout</button>
      </header>
      <h1>Profile Page</h1>

      <h3>Username: {profile.username}</h3>
    </>
  );
}

export default Profile;
