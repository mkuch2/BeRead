import axios from "axios";
import { useState, useEffect } from "react";
import {
  useAuthContext,
  type AuthContextType,
} from "@/frontend/hooks/useAuthContext";
import { useNavigate, Link } from "react-router";
import { FirebaseError } from "firebase/app";

interface Book {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string | null;
  description?: string;
  publishedDate?: string;
}

interface UserProfile {
  username: string;
  name?: string;
  bio?: string;
  email?: string;
  favoriteBooks?: Book[];
}

function DisplayProfile() {
  const { currentUser, getToken, signOut } = useAuthContext() as AuthContextType;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const navigate = useNavigate();

  const MAX_FAVORITE_BOOKS = 3;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e.code, e.message);
      }
    }
  };

  const fetchProfile = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      const token = await getToken();
      console.log("Token received:", token ? "Token exists" : "No token");

      if (!token) {
        setError(true);
        throw new Error("No authentication token available");
      }

      console.log("Making request to /api/display-profile with Authorization header");

      const response = await axios.get("/api/display-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response received:", response.data);
      setProfile(response.data.profile);
    } catch (e) {
      console.error("Error in fetchProfile:", e);
      
      // debugging stuff
      if (axios.isAxiosError(e)) {
        console.error("Axios Error Details:");
        console.error("- Status:", e.response?.status);
        console.error("- Status Text:", e.response?.statusText);
        console.error("- Response Data:", e.response?.data);
        
        if (e.response?.status === 401) {
          console.log("Authentication failed - redirecting to login");
          navigate("/login");
          return;
        }
      }
      
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser, navigate, getToken]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // shows book results once user stops typing instead of pressing search button
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearchBooks();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchBooks = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get("/api/books", {
        params: { query: searchQuery },
      });
      
      setSearchResults(response.data.books || []);
    } catch (e) {
      console.error("Error searching books:", e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFavoriteBook = async (book: Book) => { // 3 fav books max
    if (profile?.favoriteBooks && profile.favoriteBooks.length >= MAX_FAVORITE_BOOKS) {
      setErrorMessage(`You can only have ${MAX_FAVORITE_BOOKS} favorite books maximum. Remove one to add another.`);
      return;
    }

    try {
      const token = await getToken();
      await axios.post(
        "/api/favorite-books",
        { 
          bookId: book.id,
          title: book.title,
          authors: book.authors,
          thumbnail: book.thumbnail
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setSearchQuery("");
      setSearchResults([]);
      
      fetchProfile();
    } catch (e) {
      console.error("Error adding favorite book:", e);
      if (axios.isAxiosError(e) && e.response?.data?.msg) {
        setErrorMessage(e.response.data.msg);
      } else {
        setErrorMessage("Failed to add book to favorites. Please try again.");
      }
    }
  };

  const handleRemoveFavoriteBook = async (bookId: string) => {
    try {
      const token = await getToken();
      await axios.delete(`/api/favorite-books/${bookId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
      });
      
      fetchProfile();
    } catch (e) {
      console.error("Error removing favorite book:", e);
      if (axios.isAxiosError(e) && e.response?.data?.msg) {
        setErrorMessage(e.response.data.msg);
      } else {
        setErrorMessage("Failed to remove book from favorites. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>An error occurred! Please sign out and sign back in.</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Error loading profile</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <header className="border border-zinc-600 flex justify-between items-center px-4 py-2 mb-2">
        <div className="flex items-center space-x-4">
          <h1 className="font-bold text-xl text-white">BeRead</h1>
          <Link to="/home" className="text-sm font-light text-zinc-400">Home</Link>
          <Link to="/books" className="text-sm font-light text-zinc-400">Search Books</Link>
        </div>
        <button type="button" onClick={handleSignOut} className="text-sm font-light text-zinc-400 ml-2">Logout</button>
      </header>

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="mx-4 mb-4 bg-red-600 text-white p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}

      <main className="space-y-4 px-4">
        {/* Profile info */}
        <section className="border border-zinc-600 flex flex-col text-left px-4 py-4">
          <h2 className="font-semibold mb-2 text-lg">Profile</h2>
          <p><span className="font-medium">Name:</span> {profile.name || "Not set"}</p>
          <p><span className="font-medium">Username:</span> {profile.username}</p>
          <p><span className="font-medium">Bio:</span> {profile.bio || "No bio yet"}</p>
        </section>

        {/* Favorite books */}
        <section className="border border-zinc-600 flex flex-col text-left px-4 py-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">Favorite Books</h2>
            <span className="text-sm text-zinc-400">
              {profile.favoriteBooks?.length || 0}/{MAX_FAVORITE_BOOKS}
            </span>
          </div>
          {profile.favoriteBooks && profile.favoriteBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.favoriteBooks.map((book) => (
                <div key={book.id} className="relative flex items-center space-x-3 p-2 border border-zinc-700 rounded">
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveFavoriteBook(book.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-sm flex items-center justify-center text-xs font-bold"
                    title="Remove from favorites"
                  >
                    ×
                  </button>
                  
                  {book.thumbnail ? (
                    <img src={book.thumbnail} alt={book.title} className="w-12 h-16 object-cover rounded flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-16 bg-gray-600 rounded flex items-center justify-center text-xs">No Cover</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{book.title}</h3>
                    <p className="text-zinc-400 text-xs truncate">by {book.authors.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400">No favorite books yet.</p>
          )}
        </section>

        {/* Add favorite book with live search */}
        <section className="border border-zinc-600 flex flex-col text-left px-4 py-4">
          <h2 className="font-semibold mb-2 text-lg">Add Favorite Book</h2>
          
          {/* Show message if at limit */}
          {profile.favoriteBooks && profile.favoriteBooks.length >= MAX_FAVORITE_BOOKS ? (
            <div className="bg-yellow-800 text-yellow-200 p-3 rounded-md text-sm mb-4">
              You have reached the maximum of {MAX_FAVORITE_BOOKS} favorite books. Remove a book to add a new one.
            </div>
          ) : (
            <>
              <div className="flex mb-4">
                <input
                  type="text"
                  placeholder="Search for books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border border-zinc-600 bg-black text-white p-2 rounded-l flex-1"
                />
                <button
                  onClick={handleSearchBooks}
                  disabled={!searchQuery.trim() || isSearching}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-r"
                >
                  {isSearching ? "..." : "Search"}
                </button>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((book) => (
                    <div key={book.id} className="flex items-center justify-between p-2 border border-zinc-700 rounded">
                      <div className="flex items-center space-x-3 flex-1">
                        {book.thumbnail ? (
                          <img src={book.thumbnail} alt={book.title} className="w-8 h-10 object-cover rounded flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-10 bg-gray-600 rounded flex items-center justify-center text-xs">No Cover</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{book.title}</h3>
                          <p className="text-zinc-400 text-xs truncate">by {book.authors.join(", ")}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddFavoriteBook(book)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm ml-2"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery && searchResults.length === 0 && !isSearching && (
                <p className="text-zinc-400 text-sm">No books found for "{searchQuery}"</p>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default DisplayProfile;