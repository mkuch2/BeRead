import { Link } from "react-router";

function Landing() {
  return (
    <>
      <header className="border border-zinc-600 flex justify-between items-center px-4 py-2 mb-2">
        <div className="flex items-center space-x-4">
          <h1 className="font-bold text-xl text-white">BeRead</h1>

          <Link to="/friends" className="text-sm text-zinc-400 hover:text-white transition">Friends</Link>
          <Link to="/display-profile" className="text-sm text-zinc-400 hover:text-white transition">Profile</Link>
        </div>
        <Link to="/login" className="text-sm font-light text-zinc-400">Login</Link>
      </header>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left & center: Prompt + posts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompt */}
          <section className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Today's Prompt</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Admin Generated Prompt
                </p>
              </div>
              <Link
                to="/addpost"
                className="bg-white text-black px-4 py-1 text-sm rounded-full font-medium hover:opacity-90"
              >
                Post
              </Link>
            </div>
          </section>

          {/* Most Recent Posts */}
          <section>
            <p className="text-sm italic text-zinc-400 mb-2">Most Recent</p>
            {/* Replace with post list later */}
            <div className="text-center text-zinc-500 py-8 border border-zinc-700 rounded-lg">
              TODO: Display recent posts here
            </div>
          </section>
        </div>

        {/* Right: Currently Reading */}
        <aside className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Currently Reading</h2>
          <div className="flex flex-col items-center">
            {/* Replace with real book data later */}
            <div className="w-24 h-36 bg-zinc-700 rounded mb-2"></div>
            <p className="text-sm text-zinc-300 mt-1 text-center">
              The Midnight Library
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

export default Landing;
