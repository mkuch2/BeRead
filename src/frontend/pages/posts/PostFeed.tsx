import NavBar from "@/frontend/components/NavBar";
import Posts from "../../components/Posts";
import PostSearch, {
  type PostInterface,
} from "@/frontend/components/PostSearch";
import { useState, useEffect } from "react";
import axios from "axios";

export default function PostFeed() {
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    const getPosts = async () => {
      try {
        const response = await axios.get("/api/posts");
        console.log("getPosts response", response);
        setPosts(response.data);
      } catch (e) {
        console.log("Error getting all posts", e);
        setError("Error getting posts");
      } finally {
        setLoading(false);
      }
    };
    getPosts();
  }, []);

  const handleSearch = () => {
    setHasSearched(true);
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-black text-white font-sans px-4 pt-6 border border-zinc-600">
        {/* --- Search Bar --- */}
        <div className="max-w-3xl mx-auto mb-6">
          <PostSearch onSearch={handleSearch} hasSearched={hasSearched} />
        </div>

        {/* --- Feed Header --- */}
        {!hasSearched && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 px-2">Today’s Posts</h2>

            {/* --- Loading/Error State --- */}
            {loading && <p className="text-zinc-400 text-sm">Loading...</p>}
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            {/* --- Posts List --- */}
            <div className="space-y-6">
              <Posts posts={posts} error={error} loading={loading} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
