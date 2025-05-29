import { useLocation } from "react-router";
import { useState } from "react";
import { type PostInterface } from "../components/PostSearch";
import { Post } from "../components/Post";
import CommentForm from "../components/CommentForm";
import { type Comment } from "../components/Comment";
import axios from "axios";

const DisplayPost = () => {
  const { state } = useLocation();
  const [comments, setComments] = useState<Comment[]>([]);
  const post: PostInterface = state.post;

  //const getComments = axios.get();

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
    </>
  );
};

export default DisplayPost;
