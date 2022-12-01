import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import { TicketStatus } from "@prisma/client";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import {
  createUser,
  createEnrollmentWithAddress,
  createTicketTypeRemote,
  createTicketTypeWithHotel,
  createTicket,
  createHotel,
  createRoomWithHotelId,
  createRoomWithoutCapacity,
  createPayment,
  createBookingWithRoom,
} from "../factories";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 402 when user ticket is remote ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
    });

    it("should respond with status 404 when user has no enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const ticketType = await createTicketTypeRemote();

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 when user has not booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and a booking with room", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const createdHotel = await createHotel();
      const createdRoom = await createRoomWithHotelId(createdHotel.id);
      const createBooking = await createBookingWithRoom(user, createdRoom.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: createBooking.id,
        Room: {
          id: createBooking.Room.id,
          name: createBooking.Room.name,
          capacity: createBooking.Room.capacity,
          hotelId: createBooking.Room.hotelId,
          createdAt: createBooking.Room.createdAt.toISOString(),
          updatedAt: createBooking.Room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 403 when user ticket is remote ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 404 when user has no enrollment ", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const ticketType = await createTicketTypeRemote();

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
  });

  it("should respond with status 404 when room does not exist", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const payment = await createPayment(ticket.id, ticketType.price);
    const createdHotel = await createHotel();

    const body = { roomId: faker.datatype.number() };
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

    expect(response.status).toEqual(httpStatus.NOT_FOUND);
  });

  it("should respond with status 403 when the room capacity is already reached the limit", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const hotel = await createHotel();
    const hotelId = hotel.id;
    const room = await createRoomWithoutCapacity(hotelId);
    const roomId = room.id;
    const booking = await createBookingWithRoom(user, roomId);
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.FORBIDDEN);
  });

  it("should respond with status 200 with booking id", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithHotel();
    const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
    const payment = await createPayment(ticket.id, ticketType.price);
    const createdHotel = await createHotel();
    const createdRoom = await createRoomWithHotelId(createdHotel.id);
    const createBooking = await createBookingWithRoom(user, createdRoom.id);

    const body = { roomId: createdRoom.id };
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);
    expect(response.status).toEqual(httpStatus.OK);
    expect(response.body).toEqual({
      bookingId: expect.any(Number),
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("Should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/1");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("Should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("When token is valid", () => {
    it("Should respond with 404 when user doesnt have enrollment", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("Should respond with 403 when user doesnt have ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    it("Should respond with 403 when ticket does not include hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemote();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    it("Should respond with 403 when ticket has not been paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    it("Should respond with 403 when user doesnt have booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const hotelId = hotel.id;
      const room = await createRoomWithHotelId(hotelId);
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    it("should respond with status 404 when room does not exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const payment = await createPayment(ticket.id, ticketType.price);
      const createdHotel = await createHotel();
      const body = { roomId: faker.datatype.number() };
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
    it("should respond with status 403 when the room capacity is already reached the limit", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const hotelId = hotel.id;
      const room = await createRoomWithoutCapacity(hotelId);
      const roomId = room.id;
      const booking = await createBookingWithRoom(user, roomId);
      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });
    it("Should respond with status 200 and booking id", async () => {
      const user = await createUser();
      const userId = user.id;
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      const hotel = await createHotel();
      const hotelId = hotel.id;
      const room = await createRoomWithHotelId(hotelId);
      const roomId = room.id;
      const booking = await createBookingWithRoom(user, roomId);
      const response = await server.put(`/booking/${booking.id}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual({
        bookingId: booking.id,
      });
    });
  });
});
