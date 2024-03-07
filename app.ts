import express from "express";
import { router as movies } from "./api/movies";
import { router as Person } from "./api/Person";
import cors from "cors";
import bodyParser from "body-parser";

export const app = express();

app.use(
    cors({
      origin: "*",
    })
  );
app.use(bodyParser.text());
app.use(bodyParser.json());
app.use("/Movies", movies);
app.use("/Person", Person);