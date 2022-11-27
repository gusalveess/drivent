import { notFoundError, unauthorizedError, noPaid } from "@/errors";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelsRepository from "@/repositories/hotels-repository";

async function verifyTicketAndEnrollment(ticketId: number, userId: number) {
  const ticket = await ticketRepository.findTickeWithTypeById(ticketId);

  if (!ticket) {
    throw notFoundError();
  }

  if(ticket.TicketType.includesHotel === false && ticket.TicketType.isRemote === true) {
    throw notFoundError();
  }

  if (ticket.status === "RESERVED") {
    throw noPaid();
  }

  const enrollment = await enrollmentRepository.findById(ticket.enrollmentId);

  if (enrollment.userId !== userId) {
    throw unauthorizedError();
  }
}

async function GetHotels(ticketId: number, userId: number) {
  await verifyTicketAndEnrollment(ticketId, userId);

  const result = await hotelsRepository.GetHotels();

  if(!result) {
    throw notFoundError();
  }

  return result;
}

async function GetRooms(hotelId: number) {
  const Rooms = await hotelsRepository.FindRoomsById(hotelId);

  if(!Rooms) {
    throw notFoundError();
  }

  const result = {
    id: Rooms.id,
    name: Rooms.name,
    image: Rooms.image,
    createdAt: Rooms.createdAt.toISOString(),
    updatedAt: Rooms.updatedAt.toISOString(),
    Rooms:
      {
        id: Rooms.Rooms[0].id,
        name: Rooms.Rooms[0].name,
        capacity: Rooms.Rooms[0].capacity,
        hotelId: Rooms.Rooms[0].hotelId,
        createdAt: Rooms.Rooms[0].createdAt.toISOString(),
        updatedAt: Rooms.Rooms[0].updatedAt.toISOString(),
      }
  };

  return result;
}

const hotelsService = {
  GetHotels,
  GetRooms
};

export default hotelsService;
