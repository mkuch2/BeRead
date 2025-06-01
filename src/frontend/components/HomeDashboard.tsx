import { Link } from "react-router";
import { useEffect, useState } from "react";
import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import axios from "axios";

export default function HomeDashboard() {
  const { currentUser } = useAuthContext() as AuthContextType;
  const [currentlyReadingTitle, setCurrentlyReadingTitle] = useState<string>(
    "Share your current read!"
  );
  const [currentlyReadingThumb, setCurrentlyReadingThumb] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState<boolean>(false);

  console.log(currentUser);

  useEffect(() => {
    setLoading(true);
    async function getCurrentlyReading() {
      if (!currentUser) {
        console.log("Could not get user");
        return;
      }

      try {
        const response = await axios.get(`/api/user/${currentUser.uid}`);

        const title = response.data.currentlyReadingTitle;
        const thumbnail = response.data.currentlyReadingThumbnail;

        if (title) {
          setCurrentlyReadingTitle(title);
          setCurrentlyReadingThumb(thumbnail);
        }
      } catch (e) {
        console.log("Error getting user's reading information", e);
      } finally {
        setLoading(false);
      }
    }

    getCurrentlyReading();
  }, [currentUser]);

  console.log(currentlyReadingThumb);

  return (
    <>
      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left & center: Prompt + posts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt */}
          <section className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Today's Prompt</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Admin Generated Prompt
                </p>
              </div>
              <Link
                to="/add-post"
                className="bg-white text-black px-4 py-1 text-sm rounded-full font-medium hover:opacity-90"
              >
                Post
              </Link>
            </div>
          </section>

          {/* Most Recent Posts */}
          <section>
            <p className="text-sm italic text-zinc-400 mb-2">Most Recent</p>
            {/* Replace with post list later */}
            <div className="text-center text-zinc-500 py-8 border border-zinc-700 rounded-lg">
              TODO: Display recent posts here
            </div>
          </section>
        </div>

        {/* Right: Currently Reading */}
        {!currentUser ? (
          <aside className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Currently Reading</h2>
            <div className="flex flex-col items-center">
              <div className="w-24 h-36 bg-zinc-700 rounded mb-2"></div>
              <p className="text-sm text-zinc-300 mt-1 text-center">
                <Link to="/signup" className="font-bold underline">
                  Create an account
                </Link>{" "}
                to let your friends know what you're reading!
              </p>
            </div>
          </aside>
        ) : (
          <aside className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Currently Reading</h2>
            <div className="flex flex-col items-center">
              {currentlyReadingTitle === "Share your current read!" &&
              !loading ? (
                <Link to="/display-profile">
                  <div className="w-24 h-36 bg-zinc-700 rounded mb-2 flex items-center justify-center">
                    <span className="text-zinc-400 text-3xl">+</span>
                  </div>
                </Link>
              ) : (
                <div className="w-24 h-36 bg-zinc-700 rounded mb-2">
                  <img
                    src={currentlyReadingThumb as string}
                    alt="Cover of user's currently reading book"
                  />
                </div>
              )}
              <p className="text-sm text-zinc-300 mt-1 text-center">
                {currentlyReadingTitle}
              </p>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
