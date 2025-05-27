import axios from "axios";
import { useState, useEffect } from "react";
import {
  useAuthContext,
  type AuthContextType,
} from "@/frontend/hooks/useAuthContext";
import { useNavigate, Link } from "react-router";
import { FirebaseError } from "firebase/app";
import pencil from "@/frontend/assets/images/pencil.png";

interface UserProfile {
  username: string;
  name?: string;
  bio?: string;
  email?: string;
}

function DisplayProfile() {
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

  const handleEditProfile = async () => {
    console.log("Edit profile clicked");
    navigate("/edit-profile");
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
          <Link to="/home" className="text-sm font-light text-zinc-400">Home</Link>
          <Link to="/books" className="text-sm font-light text-zinc-400">Search Books</Link>
        </div>
        <button type="button" onClick={handleSignOut} className="text-sm font-light text-zinc-400 ml-2">Logout</button>
      </header>
      <main>
        <p className="flex font-semibold">Profile</p>
        <div className="border border-zinc-600 flex flex-col text-left px-2">
          <div className="flex items-center">
            <p className="mr-1">Name: </p>
            <img src={pencil} className="w-2"/>
          </div>
          <div className="flex items-center">
            <p className="mr-1">Username: {profile.username}</p>
            <img src={pencil} className="w-2"/>
          </div>
          <div className="flex items-center">
            <p className="mr-1">Bio: All I can do for today...</p>
            <img //Needs to be fixed
              onClick={handleEditProfile}
              src={pencil}
              className="w-4 cursor-pointer"/>
          </div>
        </div>
      </main>
    </>
  );
}

export default DisplayProfile;
