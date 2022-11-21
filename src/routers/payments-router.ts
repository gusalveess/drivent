import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { GetPayment, PostPayment } from "@/controllers/payments-controller";
const paymentsRouter = Router();

paymentsRouter.all("/*", authenticateToken).get("/", GetPayment).post("/process", PostPayment);

export { paymentsRouter };
