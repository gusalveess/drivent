import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { createTicketsSchema } from "@/schemas/tickets-schemas";
import { getTicketType, Tickets, postCreateTicket } from "@/controllers/tickets-controller";

const ticketsRouter = Router();

ticketsRouter
  .all("/*", authenticateToken)
  .get("/types", getTicketType)
  .get("/", Tickets)
  .post("/", validateBody(createTicketsSchema), postCreateTicket);

export { ticketsRouter };
