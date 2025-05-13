import express, {
  type Application,
  type Request,
  type Response,
  type NextFunction,
} from "express";

const app: Application = express();
const PORT: number = 5004;

app.use(express.json());

app.get("/", (req: Request, res: Response): void => {
  res.send("<h1>Hello, this is my website!</h1>");
});

app.listen(PORT, (): void => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
