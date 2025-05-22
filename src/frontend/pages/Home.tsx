// do this -> npm install react-router-dom
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/frontend/components/ui/button";

function Home() {
  const todayPrompt = "What book best matches your current mood?";

  // Example books (you can map actual data here in the future)
  const selectedBooks = [
    {
      id: 1,
      title: "Atomic Habits",
      author: "James Clear",
      thumbnail: "https://covers.openlibrary.org/b/id/10538463-L.jpg",
    },
    {
      id: 2,
      title: "Becoming",
      author: "Michelle Obama",
      thumbnail: "https://covers.openlibrary.org/b/id/9368318-L.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans px-4 py-10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Left Side - Selected Books */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Your Books</h2>
          {selectedBooks.map((book) => (
            <div
              key={book.id}
              className="bg-neutral-900 rounded-lg p-4 flex items-center gap-4 shadow-md"
            >
              <img
                src={book.thumbnail}
                alt={book.title}
                className="w-16 h-24 object-cover rounded"
              />
              <div>
                <h3 className="text-lg font-bold">{book.title}</h3>
                <p className="text-sm text-gray-400">{book.author}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side - Prompt Card */}
        <div className="md:col-span-3 bg-neutral-900 rounded-lg p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4">Today's Prompt</h1>
            <p className="text-lg text-gray-300 mb-6">{todayPrompt}</p>
          </div>
          <div className="mt-auto">
            <Link to="/create-post">
              <Button className="w-full text-black bg-white hover:bg-gray-200 font-semibold text-md">
                Make a Post
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
