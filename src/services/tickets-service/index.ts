import { notFoundError } from "@/errors";
import { exclude } from "@/utils/prisma-utils";
import ticketRepository from "@/repositories/tickets-repository";
import { TicketType, Ticket, TicketStatus, Enrollment } from "@prisma/client";
import enrollmentRepository from "@/repositories/enrollment-repository";

async function getTicketTypeWithId(id: number): Promise<TicketType> {
  const result = await ticketRepository.getTicket(id);

  if (!result) {
    throw notFoundError();
  }
  return result;
}

async function getTicketWithId(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();
  const ticket = await ticketRepository.GetUserTicket(enrollment.id);
  if (!ticket) throw notFoundError();
  return ticket;
}

async function checkEnrollmentByUserId(userId: number) {
  const enrollmentByUser = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollmentByUser) throw notFoundError();
  return enrollmentByUser;
}

export type CreateTicket = Pick<Ticket, "ticketTypeId"> & Pick<Enrollment, "userId">;

async function createTicketWithTicketTypeId({ userId, ticketTypeId }: CreateTicket) {
  const enrollmentByUser = await checkEnrollmentByUserId(userId);
  const data = {
    ticketTypeId,
    status: TicketStatus.RESERVED,
    enrollmentId: enrollmentByUser.id,
  };
  return ticketRepository.createTicket(data);
}

const ticketService = {
  getTicketTypeWithId,
  getTicketWithId,
  createTicketWithTicketTypeId,
};

export default ticketService;
