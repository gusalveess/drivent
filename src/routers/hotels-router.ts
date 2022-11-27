import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { GetHotels, GetRoomsWithHotelId } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("/", GetHotels)
  .get("/:hotelId", GetRoomsWithHotelId);

export { hotelsRouter };
