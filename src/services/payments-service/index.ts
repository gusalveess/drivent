import { notFoundError, unauthorizedError } from "@/errors";
import paymentRepository from "@/repositories/payments-repository";
import ticketRepository from "@/repositories/tickets-repository";
import { Payment, TicketStatus } from "@prisma/client";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { PostCard } from "@/protocols";

async function GetPaymentWithId(ticketId: number, userId: number): Promise<Payment> {
  const ticket = await paymentRepository.getTicketWithTicketId(ticketId);

  if (!ticket) {
    throw notFoundError();
  }

  if (ticket.Enrollment.User.id !== userId) {
    throw unauthorizedError();
  }

  const payment = await paymentRepository.GetPaymentWithTicketId(ticketId);

  if (!payment) {
    throw notFoundError();
  }

  return payment;
}

async function PostPaymentsService(process: PostCard, userId: number): Promise<Payment> {
  const ticket = await paymentRepository.getTicketWithTicketId(process.ticketId);
  if (!ticket) throw notFoundError();
  if (ticket.Enrollment.userId !== userId) throw unauthorizedError();
  await ticketRepository.updateTicket({ status: TicketStatus.PAID }, process.ticketId);
  return await paymentRepository.CreatePayment({
    ticketId: process.ticketId,
    value: ticket.TicketType.price,
    cardIssuer: process.cardData.issuer,
    cardLastDigits: `${process.cardData.number}`.slice(-4),
  });
}

const paymentService = {
  GetPaymentWithId,
  PostPaymentsService,
};

export default paymentService;
