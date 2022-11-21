import { prisma } from "@/config";
import { Payment } from "@prisma/client";

async function GetPaymentWithTicketId(ticketId: number) {
  return prisma.payment.findFirst({
    where: {
      ticketId: ticketId,
    },
  });
}

async function getTicketWithTicketId(ticketId: number) {
  return prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      TicketType: true,
      Enrollment: {
        include: {
          User: true,
        },
      },
    },
  });
}

async function CreatePayment(insert: CreatePaymentType): Promise<Payment> {
  return prisma.payment.create({
    data: insert,
  });
}

type CreatePaymentType = Omit<Payment, "id" | "createdAt" | "updatedAt">;

const paymentRepository = {
  GetPaymentWithTicketId,
  getTicketWithTicketId,
  CreatePayment,
};

export default paymentRepository;
