import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
  type ErrorRequestHandler,
} from "express";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import friendRoutes from "./routes/friendRoutes";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
const PORT: string | number = process.env.PORT || 5004;

//Middleware
app.use(express.json());

// Error handling middleware to handle malformed json
const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      errors: [
        {
          msg: "Invalid JSON format",
          type: "body",
          path: "json",
        },
      ],
    });
  } else {
    next(err);
  }
};

app.use(errorHandler);

//Serve all files from dist folder as static assets / files
app.use(express.static(path.join(__dirname, "..", "..", "dist")));

// to get book info
async function handleBookSearch(req: Request, res: Response): Promise<void> {
  const query = req.query.query as string; // gets user search input

  console.log(query);
  if (!query) {
    res.status(400).json({ error: "Query parameter required" });
    return;
  }

  try {
    // makes api url to get book results (10 results max)
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&maxResults=10&key=${process.env.API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      res.status(404).json({ error: "No books found" });
      return;
    }

    const books = data.items.map((item: any) => {
      // uses books api "items" property to get array of books, stores in books variable
      const volumeInfo = item.volumeInfo || {}; // uses empty object in case book has no info
      return {
        // go to google books api website to see other info returned if we need more
        id: item.id,
        title: volumeInfo.title || "No title",
        authors: volumeInfo.authors || ["Unknown"],
        description: volumeInfo.description || "No description",
        thumbnail: volumeInfo.imageLinks?.thumbnail || null,
        publishedDate: volumeInfo.publishedDate || "Unknown",
      };
    });

    res.json({ totalItems: data.totalItems || 0, books }); // api returns totalItems
  } catch (error) {
    console.error("Error with book fetch: ", error);
    res.status(500).json({ error: "Error with book fetch" });
  }
}

// set up express routes
app.get("/api/books", handleBookSearch);
app.use("/api", authRoutes, userRoutes, postRoutes, friendRoutes);

//Non-API Routes
app.all("/{*splat}", (_req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, "..", "..", "dist", "index.html"));
});

app.listen(Number(PORT), "0.0.0.0", (): void => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
