import app, { init } from "@/app";
import * as jwt from "jsonwebtoken";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import {
  createEnrollmentWithAddress,
  createHotel,
  createHotelRoom,
  createTicket,
  createTicketTypeWithHotel,
  createTicketTypeWithoutHotel,
  createUser,
} from "../factories";
import { cleanDb, generateValidToken } from "../helpers";
const server = supertest(app);
beforeAll(async () => {
  await init();
});
beforeEach(async () => {
  await cleanDb();
});
describe("GET /hotels", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if given token is invalid", async () => {
    const token = faker.lorem.word();
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if there is no active session for the given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("when token is valid", () => {
    it("should respond with status 401 if there is no enrollment", async () => {
      const token = generateValidToken();
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it("should respond with status 404 if there is no valid ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 404 if ticket is remote or dont includes Hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithoutHotel();
      await createTicket(enrollment.id, ticketType.id, "RESERVED");
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 402 if ticket isnt paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, "RESERVED");
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });
    it("should respond with status 200 and with existing hotels data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, "PAID");
      await createHotel();
      const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            image: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
          }),
        ]),
      );
    });
  });
});
describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/hotels/1");
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if given token is invalid", async () => {
    const token = faker.lorem.word();
    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  it("should respond with status 401 if there is no active session for the given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe("when token is valid", () => {
    it("should respond with status 404 when doesnt have hotel with given id", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, "PAID");
      const hotel = await createHotel();
      await createHotelRoom(hotel.id);
      const response = await server.get("/hotels/xxx").set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 200 and with room data including hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, "PAID");
      const hotel = await createHotel();
      await createHotelRoom(hotel.id);
      const response = await server.get(`/hotels/${hotel.id}`).set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([{
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        Rooms: {
          id: expect.any(Number),
          name: expect.any(String),
          capacity: expect.any(Number),
          hotelId: expect.any(Number),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        },
      }]
      );
    });
  });
});
