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
      <PostSearch onSearch={handleSearch} hasSearched={hasSearched} />
      {!hasSearched && <Posts posts={posts} error={error} loading={loading} />}
    </>
  );
}
