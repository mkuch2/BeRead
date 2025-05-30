import { useLocation } from "react-router";
import { useState, useEffect } from "react";
import { type PostInterface } from "../components/PostSearch";
import { Post } from "../components/Post";
import CommentForm from "../components/CommentForm";
import Comment, { type CommentInterface } from "../components/Comment";
import axios from "axios";

const DisplayPost = () => {
  const { state } = useLocation();
  const [comments, setComments] = useState<CommentInterface[]>([]);
  const [error, setError] = useState<string>("");
  const post: PostInterface = state.post;

  useEffect(() => {
    async function getComments() {
      try {
        const comments = await axios.get(
          `/api/comments?query=${encodeURIComponent(post.id)}`
        );

        console.log("Comments promise: ", comments);

        setComments(comments.data);
      } catch (e) {
        setError(`Error getting comments: ${e}`);
      }
    }

    getComments();
  }, [post.id]);

  console.log("Comments: ", comments);

  return (
    <>
      <Post
        username={post.username}
        published_at={post.published_at}
        title={post.book_title}
        content={post.content}
        quote={post.quote}
      ></Post>
      <CommentForm post_id={post.id} />
      <div>
        {comments.map((comment) => (
          <Comment
            key={comment.id}
            username={comment.username}
            published_at={comment.published_at}
            content={comment.content}
            replies={comment.replies}
          />
        ))}
      </div>
    </>
  );
};

export default DisplayPost;
