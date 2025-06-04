import { useState } from "react";
import axios from "axios";

interface User {
  id: string;
  username: string;
  name: string;
}

interface UserSearchResponse {
  totalItems: number;
  users: User[];
}

interface UserSearchProps {
  onSelectUser?: (user: User) => void;
}

function UserSearch({ onSelectUser }: UserSearchProps) {
  const [query, setQuery] = useState<string>("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

    const searchUsers = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<UserSearchResponse>(
                `/api/users?query=${encodeURIComponent(query)}` // This may need to be changed
            );
            setUsers(response.data.users ?? []); // used axios to make HTTP request from browser (/api/users handled by server.ts in backend)
            setHasSearched(true);
            console.log("Response:", response.data.users);
        } catch (err) {
            setError("Failed to fetch users. Please try again.");
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="min-h-screen bg-black text-white px-8 py-4">
      <form onSubmit={searchUsers} className="flex gap-2 justify-center mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users..."
          className="w-full max-w-xl px-4 py-2 rounded-md bg-zinc-900 text-white border border-zinc-700"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-white text-black font-medium rounded-md hover:bg-zinc-200"
        >
          Search
        </button>
      </form>

      {loading && <div className="text-center text-sm">Loading...</div>}
      {error && <div className="text-center text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-center">
        {(users ?? []).map((user) => (
          <div
            key={user.id}
            className="bg-zinc-900 p-4 rounded-md shadow-md text-center cursor-pointer hover:bg-zinc-800 transition-colors"
            onClick={() => onSelectUser?.(user)}
          >
            <h3 className="font-semibold text-sm mb-1">{user.username}</h3>
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && hasSearched && <p>No users match this username.</p>}
    </div>
  );
};

export default UserSearch;