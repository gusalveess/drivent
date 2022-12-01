import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { GetBookings, CreateBooking, UpdateBooking } from "@/controllers";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", GetBookings)
  .post("/", CreateBooking)
  .put("/:bookingId", UpdateBooking);

export { bookingsRouter };
