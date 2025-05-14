import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
const PORT: string | number = process.env.PORT || 5004;

//Middleware
app.use(express.json());

//Serve all files from dist folder as static assets / files
app.use(express.static(path.join(__dirname, "..", "..", "dist")));

//API Routes

//Non-API Routes
app.all("/", (_req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, "..", "..", "dist", "index.html"));
});

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
