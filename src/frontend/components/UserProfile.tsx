import { useAuthContext, type AuthContextType } from "../hooks/useAuthContext";
import { Link } from "react-router";
interface Book {
  id: string;
  title: string;
  authors: string[];
  thumbnail?: string | null;
  description?: string;
  publishedDate?: string;
}

interface UserProfileProps {
  username?: string;
  name?: string;
  bio?: string;
  email?: string;
  favoriteBooks?: Book[];
  currentlyReading?: Book;
}

export default function UserProfile(profile: UserProfileProps) {
  const { currentUser } = useAuthContext() as AuthContextType;

  const MAX_FAVORITE_BOOKS = 3;

  const favoriteBookSlots = Array.from(
    { length: MAX_FAVORITE_BOOKS },
    (_, index) => {
      const book = profile?.favoriteBooks?.[index];
      return { book, index };
    }
  );

  return (
    <>
      <div className="min-h-screen bg-black text-white font-sans">
        <main className="space-y-4 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <section className="border border-zinc-600 flex flex-col text-center px-4 py-4">
              <h2 className="font-semibold mb-2 text-lg">
                {profile?.name || "Name not set"}
              </h2>
              <p className="text-zinc-400 text-sm mb-2">{profile?.username}</p>
              <p className="text-sm">{profile?.bio || "No bio yet"}</p>
              {currentUser && (
                <div className="flex justify-center mt-auto">
                  <button
                    onClick={() => {
                      console.log(`Add ${profile.username} as friend`);
                    }}
                    className="bg-gray-500 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm cursor-pointer"
                  >
                    Add Friend
                  </button>
                </div>
              )}
            </section>

            <section className="border border-zinc-600 flex flex-col text-center px-4 py-4">
              <h2 className="font-semibold mb-4 text-lg">Currently Reading</h2>

              <div className="flex justify-center">
                {profile?.currentlyReading ? (
                  <div className="flex flex-col items-center p-4 border border-zinc-700 rounded-lg bg-zinc-900 min-h-[200px] w-64">
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
                  <div className="flex flex-col items-center justify-center p-4 border border-zinc-600 rounded-lg bg-zinc-900 min-h-[200px] w-64">
                    <span className="text-zinc-400 text-sm">
                      Not currently reading
                    </span>
                  </div>
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
                    <div className="flex flex-col items-center p-4 border border-zinc-700 rounded-lg bg-zinc-900 min-h-[200px]">
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
                    <div className="flex flex-col items-center justify-center p-4 border border-zinc-600 rounded-lg bg-zinc-900 min-h-[200px] w-full">
                      <span className="text-zinc-400 text-sm">
                        No book selected
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
          <Link to={`/post-feed/${profile.username}`}>
            <span className="mt-4 block">
              View posts from {profile.username}
            </span>
          </Link>
        </main>
      </div>
    </>
  );
}
