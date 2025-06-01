import {Link} from "react-router";

function Landing() {

  return (
    <div className="w-screen">
      <header className="border border-zinc-600 flex justify-between items-center mb-2 border-l-0 border-r-0 border-t-0">
        <div className="flex items-center space-x-4">
          <h1 className="font-bold text-xl text-white ml-1">BeRead</h1>
          <Link to="/books" className="text-sm font-light text-zinc-400">Search Books</Link>
        </div>
        <Link to="/login" className="text-sm font-light text-zinc-400 mr-1">Login</Link>
      </header>
        <main>
          <div className="border border-zinc-600 ml-2 mr-2 mb-2 mt-4">
            <p className="text-left m-1 font-light text-sm font-medium">Today's Prompt</p>
            <div className="flex justify-between items-center">
              <p className="text-left m-2 text-xs font-light text-zinc-300">Admin Generated Prompt</p>
              <Link to="/addpost" className="text-xs border border-zinc-600 rounded-xs text-white px-1 m-2">Post</Link>
            </div>
          </div>
          <p className="text-xs m-1 text-left italic text-zinc-200 font-thin">Most Recent</p>
          <p>TODO: Popular Posts?</p>
      </main>
    </div>
  );
}

export default Landing;