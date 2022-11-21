import { AuthenticatedRequest } from "@/middlewares";
import { id, getTicket, ticketTypeId } from "@/protocols";
import ticketService from "@/services/tickets-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getTicketType(req: AuthenticatedRequest, res: Response) {
  const { id } = req.body as id;

  try {
    const ticketType = await ticketService.getTicketTypeWithId(id);
    const arrayTicket = [ticketType];

    if (!ticketType) {
      res.send([]);
    }

    res.status(200).send(arrayTicket);
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.send([]);
    }
  }
}

export async function Tickets(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const ticket = await ticketService.getTicketWithId(userId);
    return res.status(httpStatus.OK).send(ticket);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function PostTicketTypeId(req: AuthenticatedRequest, res: Response) {
  const { ticketTypeId } = req.body as ticketTypeId;

  try {
    if (!ticketTypeId) {
      return res.send(httpStatus.BAD_REQUEST);
    }
    res.send(httpStatus.OK);
  } catch {
    return res.send(httpStatus.BAD_REQUEST);
  }
}

export async function postCreateTicket(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { ticketTypeId }: { ticketTypeId: number } = req.body;
  try {
    const ticket = await ticketService.createTicketWithTicketTypeId({
      userId,
      ticketTypeId,
    });
    return res.status(httpStatus.CREATED).send(ticket);
  } catch (error) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
