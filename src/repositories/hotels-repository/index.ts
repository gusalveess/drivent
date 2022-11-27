import { prisma } from "@/config";

async function GetHotels() {
  return prisma.hotel.findMany();
}

async function FindRoomsById(hotelId: number) {
  return prisma.hotel.findFirst({
    where: {
      id: hotelId,
    },
    include: {
      Rooms: true,
    }
  });
}

const hotelsRepository = {
  GetHotels,
  FindRoomsById
};
  
export default hotelsRepository;
  
