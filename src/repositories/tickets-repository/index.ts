import { prisma } from "@/config";
import { TicketType, Ticket, Prisma } from "@prisma/client";

async function getTicket(id: number) {
  const result = prisma.ticketType.findFirst({
    where: {
      id: id,
    },
  });

  return result;
}

async function GetUserTicket(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: {
      enrollmentId,
    },
    include: {
      TicketType: true,
    },
  });
}

async function createTicket(data: Prisma.TicketCreateManyInput): Promise<GetOneTicketWithTicketType> {
  return prisma.ticket.create({
    data,
    include: { TicketType: true },
  });
}

type GetOneTicketWithTicketType = Ticket & { TicketType: TicketType };

async function updateTicket(status: Partial<Omit<Ticket, "id">>, id: number) {
  return prisma.ticket.update({
    where: {
      id,
    },
    data: status,
  });
}

const ticketRepository = {
  getTicket,
  GetUserTicket,
  createTicket,
  updateTicket,
};

export default ticketRepository;
