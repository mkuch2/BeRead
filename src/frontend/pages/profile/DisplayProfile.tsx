import axios from "axios";
import { useState, useEffect } from "react";
import {
  useAuthContext,
  type AuthContextType,
} from "@/frontend/hooks/useAuthContext";
import { useNavigate, Link } from "react-router";
import { FirebaseError } from "firebase/app";
import NavBar from "@/frontend/components/NavBar";
import BioForm from "@/frontend/components/BioForm";

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
  currentlyReading?: Book;
}

function DisplayProfile() {
  const { currentUser, getToken } = useAuthContext() as AuthContextType;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<boolean>(false);

  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupType, setPopupType] = useState<"favorite" | "reading">(
    "favorite"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showBioForm, setShowBioForm] = useState<boolean>(false);

  const navigate = useNavigate();

  const MAX_FAVORITE_BOOKS = 3;

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

      console.log(
        "Making request to /api/display-profile with Authorization header"
      );

      const response = await axios.get("/api/display-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response received:", response.data);
      setProfile(response.data.profile);
    } catch (e) {
      console.error("Error in fetchProfile:", e);
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

  // makes the book results show up after user stops typing instead of using search button
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() && showPopup) {
        handleSearchBooks();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, showPopup]);

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

  const openPopup = (type: "favorite" | "reading") => {
    setPopupType(type);
    setShowPopup(true);
    setSearchQuery("");
    setSearchResults([]);
    setErrorMessage("");
  };

  const closePopup = () => {
    setShowPopup(false);
    setSearchQuery("");
    setSearchResults([]);
    setErrorMessage("");
  };

  const handleAddFavoriteBook = async (book: Book) => {
    try {
      const token = await getToken();
      await axios.post(
        "/api/favorite-books",
        {
          bookId: book.id,
          title: book.title,
          authors: book.authors,
          thumbnail: book.thumbnail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closePopup();
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

  const handleAddCurrentlyReading = async (book: Book) => {
    try {
      const token = await getToken();
      await axios.post(
        "/api/currently-reading",
        {
          bookId: book.id,
          title: book.title,
          authors: book.authors,
          thumbnail: book.thumbnail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      closePopup();
      fetchProfile();
    } catch (e) {
      console.error("Error setting currently reading book:", e);
      if (axios.isAxiosError(e) && e.response?.data?.msg) {
        setErrorMessage(e.response.data.msg);
      } else {
        setErrorMessage(
          "Failed to set currently reading book. Please try again."
        );
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
        setErrorMessage(
          "Failed to remove book from favorites. Please try again."
        );
      }
    }
  };

  const handleRemoveCurrentlyReading = async () => {
    try {
      const token = await getToken();
      await axios.delete("/api/currently-reading", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchProfile();
    } catch (e) {
      console.error("Error removing currently reading book:", e);
      if (axios.isAxiosError(e) && e.response?.data?.msg) {
        setErrorMessage(e.response.data.msg);
      } else {
        setErrorMessage(
          "Failed to remove currently reading book. Please try again."
        );
      }
    }
  };

  const onBioUpdate = (updatedBio: string) => {
    if (profile) {
      setProfile({ ...profile, bio: updatedBio });
    }
    setShowBioForm(false);
  };

  const onCancel = () => {
    setShowBioForm(false);
  };

  const favoriteBookSlots = Array.from(
    { length: MAX_FAVORITE_BOOKS },
    (_, index) => {
      const book = profile?.favoriteBooks?.[index];
      return { book, index };
    }
  );

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
    <>
      <NavBar />
      <div className="min-h-screen bg-black text-white font-sans">
        {errorMessage && (
          <div className="mx-4 mb-4 bg-red-600 text-white p-3 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        <main className="space-y-4 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="border border-zinc-600 flex flex-col text-center px-4 py-4">
              <h2 className="font-semibold mb-2 text-lg">
                {profile.name || "Name not set"}
              </h2>
              <p className="text-zinc-400 text-sm mb-2">{profile.username}</p>
              {showBioForm ? (
                <BioForm
                  oldBio={profile.bio || ""}
                  onBioUpdate={onBioUpdate}
                  onCancel={onCancel}
                />
              ) : (
                <>
                  <p className="text-sm mb-2">{profile.bio || "No bio yet"}</p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowBioForm(true)}
                      className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm cursor-pointer"
                    >
                      {profile.bio ? "Edit bio" : "Add bio"}
                    </button>
                  </div>
                </>
              )}
            </section>
            <section className="border border-zinc-600 flex flex-col text-center px-4 py-4">
              <h2 className="font-semibold mb-4 text-lg">Currently Reading</h2>

              <div className="flex justify-center">
                {profile.currentlyReading ? (
                  <div className="relative flex flex-col items-center p-4 border border-zinc-700 rounded-lg bg-zinc-900 min-h-[200px] w-64">
                    <button
                      onClick={handleRemoveCurrentlyReading}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-sm flex items-center justify-center text-xs font-bold"
                      title="Remove currently reading"
                    >
                      ×
                    </button>

                    {profile.currentlyReading.thumbnail ? (
                      <img
                        src={profile.currentlyReading.thumbnail}
                        alt={profile.currentlyReading.title}
                        className="w-16 h-20 object-cover rounded mb-3"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-gray-600 rounded mb-3 flex items-center justify-center text-xs">
                        No Cover
                      </div>
                    )}

                    <h3 className="font-medium text-sm text-center mb-1 line-clamp-2">
                      {profile.currentlyReading.title}
                    </h3>
                    <p className="text-zinc-400 text-xs text-center line-clamp-2">
                      by {profile.currentlyReading.authors.join(", ")}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => openPopup("reading")}
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-600 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 transition-colors min-h-[200px] w-64"
                  >
                    <div className="text-4xl text-zinc-500 mb-2">+</div>
                    <span className="text-zinc-400 text-sm">Add Book</span>
                  </button>
                )}
              </div>
            </section>
          </div>

          <section className="border border-zinc-600 flex flex-col text-center px-4 py-4">
            <h2 className="font-semibold mb-4 text-lg">Favorite Books</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {favoriteBookSlots.map(({ book, index }) => (
                <div key={index} className="relative">
                  {book ? (
                    <div className="relative flex flex-col items-center p-4 border border-zinc-700 rounded-lg bg-zinc-900 min-h-[200px]">
                      <button
                        onClick={() => handleRemoveFavoriteBook(book.id)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-sm flex items-center justify-center text-xs font-bold"
                        title="Remove from favorites"
                      >
                        ×
                      </button>

                      {book.thumbnail ? (
                        <img
                          src={book.thumbnail}
                          alt={book.title}
                          className="w-16 h-20 object-cover rounded mb-3"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-gray-600 rounded mb-3 flex items-center justify-center text-xs">
                          No Cover
                        </div>
                      )}

                      <h3 className="font-medium text-sm text-center mb-1 line-clamp-2">
                        {book.title}
                      </h3>
                      <p className="text-zinc-400 text-xs text-center line-clamp-2">
                        by {book.authors.join(", ")}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => openPopup("favorite")}
                      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-600 rounded-lg bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-500 transition-colors min-h-[200px] w-full"
                    >
                      <div className="text-4xl text-zinc-500 mb-2">+</div>
                      <span className="text-zinc-400 text-sm">Add Book</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>

        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {popupType === "favorite"
                    ? "Add Favorite Book"
                    : "Set Currently Reading"}
                </h3>
                <button
                  onClick={closePopup}
                  className="text-zinc-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search for books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-zinc-600 bg-black text-white p-2 rounded"
                  autoFocus
                />
              </div>

              {isSearching && (
                <div className="text-center text-zinc-400 py-4">
                  Searching...
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {searchResults.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-2 border border-zinc-700 rounded"
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {book.thumbnail ? (
                          <img
                            src={book.thumbnail}
                            alt={book.title}
                            className="w-8 h-10 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-10 bg-gray-600 rounded flex items-center justify-center text-xs">
                            No Cover
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {book.title}
                          </h3>
                          <p className="text-zinc-400 text-xs truncate">
                            by {book.authors.join(", ")}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          popupType === "favorite"
                            ? handleAddFavoriteBook(book)
                            : handleAddCurrentlyReading(book)
                        }
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm ml-2"
                      >
                        {popupType === "favorite" ? "Add" : "Set"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isSearching && (
                <p className="text-zinc-400 text-sm text-center py-4">
                  No books found for "{searchQuery}"
                </p>
              )}

              {errorMessage && (
                <div className="bg-red-600 text-white p-3 rounded-md text-sm mt-4">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        )}
        <Link to={`/post-feed/${currentUser?.displayName}`} x>
          <span className="mt-4 block">View your posts</span>
        </Link>
      </div>
    </>
  );
}

export default DisplayProfile;
