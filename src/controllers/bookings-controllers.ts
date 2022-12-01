import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import bookingService from "@/services/bookings-service";
import { Response } from "express";
import { RoomId } from "@/protocols";

export async function GetBookings(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;    

  try {
    const result = await bookingService.GetUserBookings(userId);
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    if(error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
    if(error.name === "PaymentRequiredError") {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
  }
}

export async function CreateBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body as RoomId;
  const { userId } = req;

  try {
    const result = await bookingService.CreateAndCheckBooking(roomId, userId);
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    if(error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}

export async function UpdateBooking(req: AuthenticatedRequest, res: Response) {
  const { bookingId } = req.params;
  const { roomId } = req.body as RoomId;
  const { userId } = req;

  try {
    const result = await bookingService.UpdateBookingWithId(parseInt(bookingId), roomId, userId);
    return res.status(200).send(result);
  } catch (error) {
    if(error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    return res.sendStatus(httpStatus.FORBIDDEN);
  }
}
