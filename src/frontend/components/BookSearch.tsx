import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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
  const [query, setQuery] = useState<string>('');
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
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-8 py-4">
      <header className="flex justify-between items-center border border-zinc-700 px-4 py-3 rounded-md mb-6">
        <div className="flex items-center space-x-6">
          <h1 className="font-bold text-2xl"> <Link to="/">BeRead</Link> </h1>
          <Link to="/books" className="text-sm text-zinc-400 hover:text-white transition">Search Books</Link>
          <Link to="/friends" className="text-sm text-zinc-400 hover:text-white transition">Friends</Link>
          <Link to="/profile" className="text-sm text-zinc-400 hover:text-white transition">Profile</Link>
        </div>
        <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition">Logout</Link>
      </header>

      <form onSubmit={searchBooks} className="flex gap-2 justify-center mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books..."
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
        {books.map(book => (
          <div key={book.id} className="bg-zinc-900 p-4 rounded-md shadow-md text-center">
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title}
                className="w-24 h-36 object-cover mx-auto mb-2 rounded-sm"
              />
            ) : (
              <div className="w-24 h-36 bg-zinc-700 mx-auto mb-2 rounded-sm"></div>
            )}
            <h3 className="font-semibold text-sm mb-1">{book.title}</h3>
            <p className="text-xs text-zinc-400 mb-1">{book.authors.join(', ')}</p>
            <p className="text-xs text-zinc-500">
              {book.description && book.description.length > 80
                ? `${book.description.substring(0, 80)}...`
                : book.description}
            </p>
          </div>
        ))}
      </div>

      {books.length === 0 && !loading && query && (
        <p className="text-center mt-6 text-zinc-400">No books found. Try a different search term.</p>
      )}
    </div>
  );
};

export default BookSearch;
