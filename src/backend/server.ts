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

//API Routes
app.use("/api", authRoutes);

//Non-API Routes
app.all("/{*splat}", (_req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, "..", "..", "dist", "index.html"));
});

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
