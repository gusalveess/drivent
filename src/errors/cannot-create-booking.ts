import { ApplicationError } from "@/protocols";

export function cannotCreateBooking(): ApplicationError {
  return {
    name: "CannotCreateBooking",
    message: "Cannot create a Booking!",
  };
}
