import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function GetBookingsWithUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId: userId
    },
    include: {
      Room: true
    }
  });
}

async function CheckBookingsInRoom(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId: roomId
    }
  });
}

async function CheckRoom(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId
    }
  });
}

async function CreateBooking(roomId: number, userId: number) {
  return prisma.booking.create({
    data: {
      userId: userId,
      roomId: roomId
    }
  });
}

async function UpdateBookingRoom(bookingId: number, NewRoomId: number): Promise<Booking> {
  return await prisma.booking.update({
    data: {
      roomId: NewRoomId,
    },
    where: {
      id: bookingId
    }
  });
}

async function CheckUserBooking(userId: number) {
  return await prisma.booking.findFirst({
    where: {
      userId: userId
    }
  });
}

const bookingRepository = {
  GetBookingsWithUserId,
  CheckBookingsInRoom,
  CreateBooking,
  CheckRoom,
  UpdateBookingRoom,
  CheckUserBooking
};

export default bookingRepository;
