import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { User } from "@prisma/client";
import { createUser } from "./users-factory";

export async function createBookingWithRoom(user?: User, roomId?: number) {
  const incomingUser = user || (await createUser());

  return prisma.booking.create({
    data: {
      userId: incomingUser.id,
      roomId: roomId,
    },
    include: {
      Room: true,
    },
  });
}
