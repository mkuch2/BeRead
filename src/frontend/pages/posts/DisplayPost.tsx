import { useLocation } from "react-router";
import { useState, useEffect } from "react";
import { type PostInterface } from "../../components/PostSearch";
import { Post } from "../../components/Post";
import CommentForm from "../../components/CommentForm";
import Comment, { type CommentInterface } from "../../components/Comment";
import axios from "axios";
import NavBar from "../../components/NavBar";
import { logger } from "@/frontend/lib/logger";

const DisplayPost = () => {
  const { state } = useLocation();
  const [comments, setComments] = useState<CommentInterface[]>([]);
  const [error, setError] = useState<string>("");
  const [post, setPost] = useState<PostInterface>(state.post);
  const [loading, setLoading] = useState<boolean>(false);

  const postId = state.post.id;

  logger.log("DisplayPost initial post object:", post);
  logger.log("DisplayPost initial thumbnail:", post.thumbnail);

  useEffect(() => {
    async function getPost() {
      setLoading(true);
      try {
        const response = await axios.get(`/api/post/${postId}`);
        logger.log("GET /api/post/:id response.data:", response.data);
        setPost((post) => ({
          ...post,
          likes: response.data.likes,
          dislikes: response.data.dislikes,
          thumbnail: response.data.thumbnail ?? post.thumbnail ?? null,
        }));
      } catch (e) {
        logger.log("Error getting post: ", e);
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

        logger.log("Comments promise: ", response);

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
      logger.log("Comments refreshed after new comment");
    } catch (e) {
      logger.log("Error refreshing comments: ", e);
    }
  };

  logger.log("Comments: ", comments);
  logger.log("Authors in DisplayPost:", post.author);

  return (
    <>
      <NavBar />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="flex justify-center items-start gap-16 mt-10 px-6">
          {/* Left side: Post + Add Comment */}
          <div className="flex flex-col space-y-6 w-[500px]">
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
            <CommentForm post_id={post.id} onCommentAdd={refreshComments} />
          </div>

          {/* Right side: Comments */}
          <div className="flex flex-col w-[450px] space-y-4">
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                username={comment.username}
                published_at={comment.published_at}
                content={comment.content}
                likes={comment.likes}
                dislikes={comment.dislikes}
                comment_id={comment.id}
                post_id={post.id}
                onReplyAdd={refreshComments}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default DisplayPost;
