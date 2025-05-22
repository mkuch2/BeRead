import React, { useState } from 'react';
import axios from 'axios';

interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string | null;
  publishedDate: string;
}

interface BookSearchResponse {
  totalItems: number;
  books: Book[];
}

const BookSearch = () => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<BookSearchResponse>(`/api/books?query=${encodeURIComponent(query)}`);
      setBooks(response.data.books);
    } catch {
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Search the Library</h1>

        <form onSubmit={searchBooks} className="flex gap-4 mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books..."
            className="flex-grow px-4 py-3 rounded-md bg-neutral-800 text-white border border-neutral-700 placeholder-gray-400"
          />
          <button
            type="submit"
            className="bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-gray-200 transition"
          >
            Search
          </button>
        </form>

        {loading && <p className="text-center text-gray-400 mb-4">Loading...</p>}
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}
        {books.length === 0 && !loading && query && (
          <p className="text-center text-gray-400 mb-4">No books found. Try a different search term.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="bg-neutral-900 p-4 rounded-xl shadow-md hover:shadow-lg transition transform hover:scale-[1.02]"
            >
              {book.thumbnail ? (
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-neutral-800 text-center flex items-center justify-center rounded-md mb-4">
                  <span className="text-gray-400">No Cover</span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1">{book.title}</h3>
                <p className="text-sm text-gray-400 mb-1">{book.authors.join(', ')}</p>
                <p className="text-xs text-gray-500 mb-2">Published: {book.publishedDate}</p>
                <p className="text-sm text-gray-300 line-clamp-3">
                  {book.description || "No description"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookSearch;
