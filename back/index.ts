import * as prismaClient from "@prisma/client";
import express from "express";
import energyMarketRouter from "./routes/energyMarket";

const port = "3000";
const app = express();
const prisma = new prismaClient.PrismaClient();

app.use(express.json());

app.use('/api/energymarket', energyMarketRouter);
app.get('/', (_req, res) => res.send('HAPPY API'));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

