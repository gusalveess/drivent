import bookingRepository from "@/repositories/bookings-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { notFoundError, noPaid, cannotCreateBooking } from "@/errors";

async function GetUserBookings(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw noPaid();
  }

  const find = await bookingRepository.GetBookingsWithUserId(userId);
  if (!find) {
    throw notFoundError();
  }

  const result = {
    id: find.id,
    Room: {
      id: find.Room.id,
      name: find.Room.name,
      capacity: find.Room.capacity,
      hotelId: find.Room.hotelId,
      createdAt: find.Room.createdAt,
      updatedAt: find.Room.updatedAt,
    },
  };

  return result;
}

async function CreateAndCheckBooking(roomId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotCreateBooking();
  }

  const bookings = await bookingRepository.CheckBookingsInRoom(roomId);
  
  const room = await bookingRepository.CheckRoom(roomId);

  if (!room) {
    throw notFoundError();
  }

  if (bookings.length === room.capacity) {
    throw cannotCreateBooking();
  }

  const created = await bookingRepository.CreateBooking(roomId, userId);

  const result = {
    bookingId: created.id
  };
  return result;
}

async function UpdateBookingWithId(bookingId: number, roomId: number, userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollment) {
    throw notFoundError();
  }

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (!ticket || ticket.status === "RESERVED" || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw cannotCreateBooking();
  }

  const bookings = await bookingRepository.CheckBookingsInRoom(roomId);
  
  const room = await bookingRepository.CheckRoom(roomId);

  if (!room) {
    throw notFoundError();
  }

  if (bookings.length === room.capacity) {
    throw cannotCreateBooking();
  }

  const userBooking = await bookingRepository.CheckUserBooking(userId);

  if(!userBooking) {
    throw cannotCreateBooking();
  }

  const update = await bookingRepository.UpdateBookingRoom(bookingId, roomId);
  const result = {
    bookingId: update.id
  };

  return result;
}

const bookingService = {
  GetUserBookings,
  CreateAndCheckBooking,
  UpdateBookingWithId
};

export default bookingService;
