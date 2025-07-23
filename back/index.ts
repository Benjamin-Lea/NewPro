import * as prismaClient from "@prisma/client";
import express from "express";

import energyMarketRouter from "./endpoints/EnergyEndPoints";

const port = "3000";
const app = express();

const prisma = new prismaClient.PrismaClient();
prisma.$connect()
  .then(() => { console.log("Prisma connected successfully"); })
  .catch((err: unknown) => {
    console.error("Prisma connection error:", err);
    process.exit(1);
  });

app.use(express.json());

app.use('/api/dashboard', energyMarketRouter);
app.get('/api', (_req, res) => res.send('HAPPY API'));
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

