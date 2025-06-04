import { useState } from "react";
import axios from "axios";
import { Link } from "react-router";
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

interface PostSearchProps {
  onSearch: () => void;
  hasSearched: boolean;
}

const PostSearch = ({ onSearch, hasSearched }: PostSearchProps) => {
  const [query, setQuery] = useState<string>("");
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [error, setError] = useState<string | null>(null);

  // ── Pagination State ──
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "most-liked"
  >("newest");
  const [filter, setFilter] = useState<string>("");

  const searchPosts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const response = await axios.get(
        `/api/posts/search?query=${encodeURIComponent(query)}`
      );
      setPosts([...response.data]);
      onSearch();
      setError(null);
      setCurrentPage(1);
      setSortOrder("newest");
      setFilter("");
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
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const filtered = posts.filter((p) => {
    const term = filter.toLowerCase();
    return (
      p.book_title.toLowerCase().includes(term) ||
      p.username.toLowerCase().includes(term)
    );
  });

  // ── 2) Sort the filtered array ──
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "newest") {
      return (
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      );
    } else if (sortOrder === "oldest") {
      return (
        new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
      );
    } else if (sortOrder === "most-liked") {
      return b.likes - a.likes;
    }
    return 0;
  });

  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="space-y-3 mt-6 border border-gray-700 rounded-lg">
      <h1 className="text-xl font-semibold mt-6">Search Posts</h1>

      <form
        onSubmit={searchPosts}
        className={cn("flex w-full max-w-xl mx-auto items-center gap-2")}
      >
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
          <div
            className={cn(
              "max-w-xl mx-auto px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm"
            )}
          >
            {error}
          </div>
        )}
      </form>

      {/* ── FILTER & SORT CONTROLS ── */}
      {hasSearched && posts.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between max-w-xl mx-auto gap-4">
          {/* 1) FILTER KEYWORD */}
          <div className="flex-1">
            <Input
              placeholder="Filter by keyword"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setCurrentPage(1); // reset back to page 1 when filter changes
              }}
              className="w-full"
            />
          </div>

          {/* 2) SORT BY SELECT */}
          <div>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(
                  e.target.value as "newest" | "oldest" | "most-liked"
                );
                setCurrentPage(1); // reset to page 1 whenever sort changes
              }}
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most-liked">Most Liked</option>
            </select>
          </div>
        </div>
      )}

      {/* ── NO RESULTS OR NO MATCH ── */}
      {hasSearched && sorted.length === 0 ? (
        <div className="text-center">
          {filter ? (
            <p className="text-lg font-medium">No posts match "{filter}"</p>
          ) : (
            <p className="text-lg font-medium">No posts found</p>
          )}
        </div>
      ) : (
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
          {hasSearched && sorted.length > 0 && (
            <div className="flex justify-center items-center space-x-4 mt-6 mb-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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
