import { useState } from "react";
import axios from "axios";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { cn } from "@/frontend/lib/utils";
import { Post } from "./Post";

export interface PostInterface {
  id: string;
  book_title: string;
  pages: string;
  content: string;
  quote: string;
  username: string;
  published_at: string;
  likes: number;
  dislikes: number;
  author: string[];
}

const PostSearch = () => {
  const [query, setQuery] = useState<string>("");
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const searchPosts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const response = await axios.get(
        `/api/posts/search?query=${encodeURIComponent(query)}`
      );
      setPosts([...response.data]);
      setHasSearched(true);
      setError(null);
      setCurrentPage(1);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Error getting posts.");
      }
    }
  };

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  return (
    <div className="space-y-3 mt-6">
      <h1 className="text-xl font-semibold">My Posts</h1>

      <form onSubmit={searchPosts} className={cn("flex w-full max-w-xl mx-auto items-center gap-2")}>
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for posts..."
          className="search-input"
        />
        <Button type="submit" className="search-button">
          Search
        </Button>

        {error && (
          <div className={cn(
            "max-w-xl mx-auto px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm"
          )}>
            {error}
          </div>
        )}
      </form>

      {!posts.length && hasSearched ? (
        <div className="text-center">
          <p className="text-lg font-medium">No posts found</p>
        </div>
      ) : (
        <>
          <div className="books-grid mt-6">
            {currentPosts.map((post) => (
              <Link
                to="/display-post"
                state={{ post: post }}
                key={post.id}
                className="book-card"
                style={{ cursor: "pointer" }}
              >
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
                />
              </Link>
            ))}
          </div>

          {/* ── PAGINATION CONTROLS ── */}
          {hasSearched && posts.length >= 0 && (
            <div className="flex justify-center items-center space-x-4 mt-6">
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostSearch;
