import express, { json, Request, Response, Express } from "express";
import "express-async-errors";
import gamesRouter from "./routers/games-router";
import consolesRouter from "./routers/consoles-router";
import { connectDb } from "config/database";

const app = express();
app.use(json());

app.get("/health", (req: Request, res: Response) => res.send("I'am alive!"));
app.use(gamesRouter);
app.use(consolesRouter);

export function init(): Promise<Express> {
    connectDb();
    return Promise.resolve(app);
}

export default app;