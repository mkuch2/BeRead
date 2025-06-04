import NavBar from "@/frontend/components/NavBar";
import Posts from "../../components/Posts";
import PostSearch from "@/frontend/components/PostSearch";
import { useState } from "react";

export default function PostFeed() {
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = () => {
    setHasSearched(true);
  };

  return (
    <>
      <NavBar />
      <PostSearch onSearch={handleSearch} hasSearched={hasSearched} />
      {!hasSearched && <Posts />}
    </>
  );
}
