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
  photoURL?: string;
  favoriteBooks?: Book[];
  currentlyReading?: Book;
}

function DisplayProfile() {
  const { currentUser, getToken } = useAuthContext() as AuthContextType;
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState(false);
  const [bioInput, setBioInput] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState<"favorite" | "reading">("favorite");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const navigate = useNavigate();
  const MAX_FAVORITE_BOOKS = 3;

  const fetchProfile = async () => {
    if (!currentUser) return navigate("/login");
    try {
      const token = await getToken();
      const res = await axios.get("/api/display-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data.profile);
      setBioInput(res.data.profile.bio || "");
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim() && showPopup) handleSearchBooks();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, showPopup]);

  const handleSearchBooks = async () => {
    setIsSearching(true);
    try {
      const res = await axios.get("/api/books", { params: { query: searchQuery } });
      setSearchResults(res.data.books || []);
    } catch {
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

  const handleAddBook = async (book: Book, type: "favorite" | "reading") => {
    try {
      const token = await getToken();
      await axios.post(
        `/api/${type === "favorite" ? "favorite-books" : "currently-reading"}`,
        {
          bookId: book.id,
          title: book.title,
          authors: book.authors,
          thumbnail: book.thumbnail,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      closePopup();
      fetchProfile();
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to add book.");
    }
  };

  const handleRemoveBook = async (bookId: string, type: "favorite" | "reading") => {
    try {
      const token = await getToken();
      const endpoint = type === "favorite" ? `/api/favorite-books/${bookId}` : "/api/currently-reading";
      await axios.delete(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      fetchProfile();
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to remove book.");
    }
  };

  const handleBioUpdate = async () => {
    try {
      const token = await getToken();
      await axios.put(
        "/api/update-profile",
        { bio: bioInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProfile();
    } catch (e) {
      console.error("Failed to update bio", e);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return;
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("photo", photoFile);
      await axios.post("/api/upload-photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchProfile();
    } catch (e) {
      console.error("Failed to upload photo", e);
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

  const favoriteBookSlots = Array.from({ length: MAX_FAVORITE_BOOKS }, (_, i) => profile?.favoriteBooks?.[i] || null);

  if (isLoading) return <div className="text-white text-center py-20">Loading...</div>;
  if (error || !profile) return <div className="text-white text-center py-20">Error loading profile</div>;

  return (
    <div className="bg-black min-h-screen text-white">
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-zinc-700 p-6 rounded-xl bg-zinc-900">
            <div className="flex items-center gap-6 mb-4">
              {profile.photoURL ? (
                <img src={profile.photoURL} className="w-20 h-20 rounded-full" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center">No Photo</div>
              )}
              <div>
                <h2 className="text-xl font-bold">{profile.name || "Name not set"}</h2>
                <p className="text-zinc-400">{profile.username}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-zinc-400 mb-1">Edit Bio:</label>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                className="w-full bg-black border border-zinc-600 p-2 rounded text-white mb-2"
                rows={3}
              />
              <button
                onClick={handleBioUpdate}
                className="bg-green-600 px-4 py-1 rounded text-sm hover:bg-green-700"
              >Save Bio</button>
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Upload Profile Photo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="mb-2"
              />
              <button
                onClick={handlePhotoUpload}
                className="bg-blue-600 px-4 py-1 rounded text-sm hover:bg-blue-700"
              >Upload Photo</button>
            </div>
          </div>
        )}

        <main className="space-y-4 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="border border-zinc-600 flex flex-col text-center px-4 py-4">
              <h2 className="font-semibold mb-2 text-lg">
                {profile.name || "Name not set"}
              </h2>
              <p className="text-zinc-400 text-sm mb-2">{profile.username}</p>
              <p className="text-sm">{profile.bio || "No bio yet"}</p>
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

            <section className="border border-zinc-700 p-6 rounded-xl bg-zinc-900">
              <h2 className="text-xl font-bold mb-3">Favorite Books</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {favoriteBookSlots.map((book, i) => (
                  <div key={i} className="relative">
                    {book ? (
                      <div className="relative p-4 border border-zinc-700 rounded bg-zinc-800">
                        <button
                          onClick={() => handleRemoveBook(book.id, "favorite")}
                          className="absolute top-1 right-1 text-red-500 hover:text-red-600"
                        >×</button>
                        <img src={book.thumbnail || ""} className="w-20 h-28 mb-2 mx-auto" />
                        <h3 className="text-sm font-semibold text-center">{book.title}</h3>
                        <p className="text-xs text-center text-zinc-400">by {book.authors.join(", ")}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => openPopup("favorite")}
                        className="w-full border border-dashed border-zinc-600 p-8 text-zinc-400 text-sm rounded hover:border-zinc-400"
                      >+ Add Book</button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-zinc-900 p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {popupType === "favorite" ? "Add Favorite Book" : "Set Currently Reading"}
                </h3>
                <button onClick={closePopup} className="text-xl">×</button>
              </div>
              <input
                className="w-full mb-4 p-2 rounded bg-black text-white border border-zinc-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for books..."
              />
              {isSearching ? <p className="text-center text-zinc-400">Searching...</p> : (
                searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map(book => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between border border-zinc-700 rounded p-2"
                      >
                        <div className="flex items-center gap-2">
                          <img src={book.thumbnail || ""} className="w-8 h-10 object-cover" />
                          <div>
                            <h4 className="text-sm font-medium">{book.title}</h4>
                            <p className="text-xs text-zinc-400">{book.authors.join(", ")}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddBook(book, popupType)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded"
                        >{popupType === "favorite" ? "Add" : "Set"}</button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? <p className="text-center text-zinc-400">No books found</p> : null
              )}
              {errorMessage && <p className="mt-4 text-red-400 text-sm">{errorMessage}</p>}
            </div>
          </div>
        )}
        <Link to={`/post-feed/${currentUser?.displayName}`} x>
          <span className="mt-4 block">View your posts</span>
        </Link>
      </div>
    </div>
  );
}

export default DisplayProfile;
