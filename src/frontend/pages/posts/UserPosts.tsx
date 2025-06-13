import NavBar from "@/frontend/components/NavBar";
import Posts from "../../components/Posts";
import { useEffect, useState } from "react";
import { type PostInterface } from "@/frontend/components/PostSearch";
import axios from "axios";
import { useParams } from "react-router";
import { logger } from "@/frontend/lib/logger";

export default function UserPosts() {
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const { username } = useParams<{ username: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function getPosts() {
      setLoading(true);
      try {
        const response = await axios.get(`/api/posts/user/${username}`);

        setPosts(response.data);
      } catch (e) {
        logger.log("Error getting user posts: ", e);
        setError("Error getting user's posts.");
      } finally {
        setLoading(false);
      }
    }

    getPosts();
  }, [username]);

  return (
    <>
      <NavBar />
      <Posts posts={posts} error={error} loading={loading} />
    </>
  );
}
