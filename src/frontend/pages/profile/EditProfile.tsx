import axios from "axios";
import { useState, useEffect } from "react";
import {
  useAuthContext,
  type AuthContextType,
} from "@/frontend/hooks/useAuthContext";
import { useNavigate, Link } from "react-router";
import { FirebaseError } from "firebase/app";
import { logger } from "@/frontend/lib/logger";

interface UserProfile {
  username: string;
  name?: string;
  bio?: string;
  email?: string;
}

function EditProfile() {
  const { currentUser, getToken, signOut } =
    useAuthContext() as AuthContextType;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (e) {
      if (e instanceof FirebaseError) {
        logger.log(e.code, e.message);
      }
    }
  };

  useEffect(() => {
    if (profile?.name) setName(profile.name);
  }, [profile]);

  useEffect(() => {
    if (profile?.username) setUsername(profile.username);
  }, [profile]);

  useEffect(() => {
    if (profile?.bio) setBio(profile.bio);
  }, [profile]);

  const handleSave = async () => {
    logger.log("Save clicked!");
    const token = await getToken();
    const response = await axios.put(
      "/api/update-profile",
      {
        username,
        name,
        bio,
      },
      {
        headers: { auth: token },
      }
    );
    setProfile(response.data.profile);
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

        const response = await axios.get("/api/display-profile", {
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
          <Link to="/home" className="text-sm font-light text-zinc-400">
            Home
          </Link>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="text-sm font-light text-zinc-400 ml-2"
        >
          Sign Out
        </button>
      </header>
      <main>
        <div className="flex justify-between items-center">
          <p className="font-semibold">Profile</p>
          <div className="flex justify-between items-center">
            <Link
              to="/display-profile"
              className="hover:underline text-zinc-400 text-xs mr-1"
            >
              View
            </Link>
            <p>|</p>
            <Link to="/edit-profile" className="hover:underline text-xs ml-1">
              Edit
            </Link>
          </div>
        </div>
        <div className="border border-zinc-600 flex flex-col text-left px-2 py-2">
          <label>
            Name:{" "}
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Username: <input value={username} />
          </label>
          <label>
            Bio: <input value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>
          <button onClick={handleSave} className="cursor-pointer">
            Save
          </button>
        </div>
      </main>
    </>
  );
}
export default EditProfile;
