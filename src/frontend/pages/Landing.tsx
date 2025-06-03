import NavBar from "../components/NavBar";
import HomeDashboard from "../components/HomeDashboard";
import PostSearch from "../components/PostSearch";

function Landing() {
  return (
    <>
      <NavBar />
      <main>
        <HomeDashboard />
      </main>
      <PostSearch />
    </>
  );
}

export default Landing;