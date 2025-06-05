import { useLocation } from "react-router";
import { useState, useEffect } from "react";
import { type PostInterface } from "../../components/PostSearch";
import { Post } from "../../components/Post";
import CommentForm from "../../components/CommentForm";
import Comment, { type CommentInterface } from "../../components/Comment";
import axios from "axios";
import NavBar from "../../components/NavBar";

const DisplayPost = () => {
  const { state } = useLocation();
  const [comments, setComments] = useState<CommentInterface[]>([]);
  const [error, setError] = useState<string>("");
  const [post, setPost] = useState<PostInterface>(state.post);
  const [loading, setLoading] = useState<boolean>(false);

  const postId = state.post.id;

  useEffect(() => {
    async function getPost() {
      setLoading(true);
      try {
        const response = await axios.get(`/api/post/${postId}`);
        setPost((post) => ({
          ...post,
          likes: response.data.likes,
          dislikes: response.data.dislikes,
          thumbnail: response.data.thumbnail ?? post.thumbnail ?? null,
        }));
      } catch (e) {
        console.log("Error getting post: ", e);
      } finally {
        setLoading(false);
      }
    }

    getPost();
  }, [postId]);

  useEffect(() => {
    async function getComments() {
      try {
        const response = await axios.get(
          `/api/comments?query=${encodeURIComponent(postId)}`
        );
        setComments(response.data);
      } catch (e) {
        setError(`Error getting comments: ${e}`);
      }
    }

    getComments();
  }, [postId]);

  const refreshComments = async () => {
    try {
      const response = await axios.get(
        `/api/comments?query=${encodeURIComponent(postId)}`
      );
      setComments(response.data);
    } catch (e) {
      console.log("Error refreshing comments: ", e);
    }
  };

  return (
    <>
      <NavBar />
      {loading ? (
        <div className="text-white mt-6 text-center">Loading...</div>
      ) : (
        <div className="max-w-2xl mx-auto p-4 space-y-6 mt-6 bg-zinc-900 rounded-lg shadow-md">
          {/* --- Post Display --- */}
          <div className="space-y-4">
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
              preview={false}
              post={post}
              thumbnail={post.thumbnail}
            />
          </div>

          {/* --- Add Comment --- */}
          <div className="pt-4 border-t border-zinc-700">
            <h2 className="text-lg font-semibold text-white mb-2">
              Add a Comment
            </h2>
            <CommentForm post_id={post.id} onCommentAdd={refreshComments} />
          </div>

          {/* --- Comments List --- */}
          <div className="pt-4 border-t border-zinc-700">
            <h2 className="text-lg font-semibold text-white mb-4">Comments</h2>
            {comments.length === 0 ? (
              <p className="text-zinc-400 text-sm">No comments yet.</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <Comment
                    key={comment.id}
                    username={comment.username}
                    published_at={comment.published_at}
                    content={comment.content}
                    comment_id={comment.id}
                    likes={comment.likes}
                    dislikes={comment.dislikes}
                    post_id={post.id}
                    onReplyAdd={refreshComments}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayPost;