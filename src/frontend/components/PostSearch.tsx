import { useState } from "react";
import axios from "axios";
import { Link } from "react-router";
import { formatDate } from "../lib/utils";

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

  const searchPosts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const response = await axios.get(
        `/api/posts?query=${encodeURIComponent(query)}`
      );

      console.log("searchposts response: ", response);

      setPosts([...response.data]);
      setHasSearched(true);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Error getting posts.");
      }
    }
  };

  return (
    <div>
      <h1>Posts</h1>

      <form onSubmit={searchPosts} className="search-form">
        <input // search box and button
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for posts..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>

        {error && <div className="error">{error}</div>}
      </form>

      {!posts.length && hasSearched ? (
        <div className="text-center">
          <p className="text-lg font-medium">No posts found</p>
        </div>
      ) : (
        <div className="books-grid">
          {" "}
          {/* makes grid from CSS file */}
          {posts.map((post) => (
            <Link
              to="/display-post"
              state={{ post: post }}
              key={post.id}
              className="book-card"
              style={{ cursor: "pointer" }}
            >
              <div>
                {" "}
                {/* this part shows all the post info */}
                <p className="font-bold">{post.username}</p>
                <h3>{post.book_title}</h3>
                <h4 className="italic">{post.author.join(" ")}</h4>
                <p>Posted: {formatDate(post.published_at)}</p>
                <p>{post.content};</p>
                <p>
                  Likes: {post.likes} Dislikes {post.dislikes}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostSearch;
