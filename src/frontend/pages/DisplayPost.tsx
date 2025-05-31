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
  const [post, setPost] = useState<PostInterface>(state.post);
  const [loading, setLoading] = useState<boolean>(false);

  console.log("Post: ", post);

  useEffect(() => {
    async function getPost() {
      setLoading(true);
      try {
        const response = await axios.get(`api/post/${post.id}`);
        setPost((post) => ({
          ...post,
          likes: response.data.likes,
          dislikes: response.data.dislikes,
        }));
      } catch (e) {
        console.log("Error getting post: ", e);
      } finally {
        setLoading(false);
      }
    }

    getPost();
  }, [post.id]);

  useEffect(() => {
    async function getComments() {
      try {
        const response = await axios.get(
          `/api/comments?query=${encodeURIComponent(post.id)}`
        );

        console.log("Comments promise: ", response);

        setComments(response.data);
      } catch (e) {
        setError(`Error getting comments: ${e}`);
      }
    }

    getComments();
  }, [post.id]);

  console.log("Comments: ", comments);
  console.log("Authors in DisplayPost:", post.author);

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
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
                comment_id={comment.id}
                likes={comment.likes}
                dislikes={comment.dislikes}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default DisplayPost;
