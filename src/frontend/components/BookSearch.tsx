import React, { useState } from "react";
import axios from "axios";
import "./BookSearch.css";

// book properties defined
interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  thumbnail: string | null;
  publishedDate: string;
}

// api response properties defined
interface BookSearchResponse {
  totalItems: number;
  books: Book[];
}

interface BookSearchProps {
  onSelectBook?: (book: Book) => void;
}

// react component w/ query input, book list, loading state, errors
const BookSearch = ({ onSelectBook }: BookSearchProps) => {
  const [query, setQuery] = useState<string>("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // if input given, sends to /api/books (server.ts), server.ts response goes to books variable
  const searchBooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<BookSearchResponse>(
        `/api/books?query=${encodeURIComponent(query)}`
      );
      setBooks(response.data.books); // used axios to make HTTP request from browser (/api/books handled by server.ts in backend)
      console.log("Response:", response.data.books);

      setHasSearched(true);
    } catch (err) {
      setError("Failed to fetch books. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSelect = (book: Book) => {
    if (onSelectBook) {
      onSelectBook(book);
    }
    console.log(book);
  };

  // visual stuff
  return (
    <div className="book-search-container">
      <h1>book search test page</h1>

      <form onSubmit={searchBooks} className="search-form">
        <input // search box and button
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books..."
          className="search-input"
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}

      {/* makes grid for book display (can change later) */}
      <div className="books-grid">
        {" "}
        {/* makes grid from CSS file */}
        {books.map((book) => (
          <div
            key={book.id}
            className="book-card"
            style={{ cursor: "pointer" }}
            onClick={() => handleBookSelect(book)}
          >
            {book.thumbnail ? (
              <img
                src={book.thumbnail}
                alt={book.title}
                className="book-cover"
              />
            ) : (
              <div className="no-cover">No Cover</div>
            )}
            <div className="book-details">
              {" "}
              {/* this part shows all the book info */}
              <h3 className="book-title">{book.title}</h3>
              <p className="book-authors">{book.authors.join(", ")}</p>
              <p className="book-published">Published: {book.publishedDate}</p>
              <p className="book-description">
                {book.description && book.description.length > 100
                  ? `${book.description.substring(0, 100)}...`
                  : book.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && !loading && hasSearched && <p>No books found!</p>}
    </div>
  );
};

export default BookSearch;
