import { useLocation } from "react-router";
import { type PostInterface } from "../components/PostSearch";
import { Post } from "../components/Post";
const DisplayPost = () => {
  const { state } = useLocation();

  const post: PostInterface = state.post;
  return (
    <Post
      username={post.username}
      published_at={post.published_at}
      title={post.book_title}
      content={post.content}
      quote={post.quote}
    ></Post>
  );
};

export default DisplayPost;
