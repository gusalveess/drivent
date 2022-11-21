import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import { PostCard } from "@/protocols";
import paymentService from "@/services/payments-service";
import httpStatus from "http-status";

export async function GetPayment(req: AuthenticatedRequest, res: Response) {
  const { ticketId } = req.query as Record<string, string>;
  const NumTicketId = parseInt(ticketId);
  const { userId } = req;

  try {
    const result = await paymentService.GetPaymentWithId(NumTicketId, userId);
    res.status(httpStatus.OK).send(result);
  } catch (error) {
    if (error.name == "UnauthorizedError") {
      res.send(httpStatus.UNAUTHORIZED);
    }

    if (error.name === "NotFoundError") {
      res.send(httpStatus.NOT_FOUND);
    }
    res.send(httpStatus.BAD_REQUEST);
  }
}

export async function PostPayment(req: AuthenticatedRequest, res: Response) {
  const process = req.body as PostCard;
  const { userId } = req;
  if (!process.cardData || !process.ticketId) return res.sendStatus(httpStatus.BAD_REQUEST);
  try {
    const payment = await paymentService.PostPaymentsService(process, userId);
    return res.status(httpStatus.OK).send(payment);
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.sendStatus(httpStatus.NOT_FOUND);
    }
    if (error.name === "UnauthorizedError") {
      res.sendStatus(httpStatus.UNAUTHORIZED);
    }
  }
}
