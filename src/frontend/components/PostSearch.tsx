import { useState } from "react";
import axios from "axios";
import { Link } from "react-router";

export interface PostInterface {
  id: string;
  book_title: string;
  pages: string;
  content: string;
  quote: string;
  username: string;
  published_at: string;
}

const PostSearch = () => {
  const [query, setQuery] = useState<string>("");
  const [posts, setPosts] = useState<PostInterface[]>([]);
  const [error, setError] = useState<string | null>(null);

  const searchPosts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const response = await axios.get(
        `/api/posts?query=${encodeURIComponent(query)}`
      );

      setPosts([...response.data]);
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
              {/* this part shows all the book info */}
              <h3 className="book-title">{post.book_title}</h3>
              <p className="book-authors">{post.username}</p>
              <p className="book-published">Posted: {post.published_at}</p>
              <p className="book-description">{post.content};</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PostSearch;
