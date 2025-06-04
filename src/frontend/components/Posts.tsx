import { useState } from "react";
import { type PostInterface } from "./PostSearch";
import { Post } from "@/frontend/components/Post";
import { Button } from "./ui/button";

interface PostsProps {
  posts: PostInterface[];
  error: string | null;
  loading: boolean;
}

export default function Posts({ posts, error, loading }: PostsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 4;

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  const totalPages = Math.ceil(posts.length / postsPerPage);

  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  if (error) {
    return <div>{error}</div>;
  }
  if (loading) {
    return <div>Loading...</div>;
  }
  if (posts.length === 0) {
    return <div>No posts found</div>;
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
      {posts.length > 0 && totalPages > 1 && (
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
