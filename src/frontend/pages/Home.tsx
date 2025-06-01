import PostSearch from "../components/PostSearch";
import NavBar from "../components/NavBar";
import HomeDashboard from "../components/HomeDashboard";

function Home() {
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
export default Home;
