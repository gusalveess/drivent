import { AuthenticatedRequest } from "@/middlewares";
import httpStatus from "http-status";
import hotelsService from "@/services/hotels-service";
import { Response } from "express";

export async function GetHotels(req: AuthenticatedRequest, res: Response) {
  const { ticketId } = req.body;
  const { userId } = req;

  try {
    const result = await hotelsService.GetHotels(ticketId, userId);
    return res.status(httpStatus.OK).send(result);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.send(httpStatus.NOT_FOUND);
    }
    if (error.name === "PaymentRequiredError") {
      return res.send(httpStatus.PAYMENT_REQUIRED);
    }
  }
}

export async function GetRoomsWithHotelId(req: AuthenticatedRequest, res: Response) {
  const { hotelId } = req.params;

  try {
    const result = await hotelsService.GetRooms(parseInt(hotelId));
    return res.status(httpStatus.OK).send([result]);
  } catch (error) {
    return res.send(httpStatus.NOT_FOUND);
  }
}
