import axios from "axios";
import { useEffect, useState } from "react";
import { type PostInterface } from "./PostSearch";
import { Post } from "@/frontend/components/Post";
import { Button } from "./ui/button";

export default function Posts() {
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await axios.get("/api/posts");
        console.log("getPosts response", response);

        setPosts(response.data);
      } catch (e) {
        console.log("Error getting all posts", e);
        setError("Error getting posts");
      }
    };
    getPosts();
  }, []);

  const totalPages = Math.ceil(posts.length / postsPerPage);

  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-8 mt-6">
        {currentPosts.map((post) => (
          <Post
            username={post.username}
            published_at={post.published_at}
            title={post.book_title}
            content={post.content}
            quote={post.quote}
            likes={post.likes}
            dislikes={post.dislikes}
            post_id={post.id}
            author={post.author}
            post={post}
            preview={true}
            key={post.id}
          />
        ))}
      </div>

      {/* ── PAGINATION CONTROLS ── */}
      {posts.length >= 0 && (
        <div className="flex justify-center items-center space-x-4 mt-6 mb-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
}
