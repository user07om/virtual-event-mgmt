const app = require("./../app.js");
const request = require("supertest");
const Event = require("../models/Event");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Event Controller", () => {
  
  const mockEvent = {
    name: "test name",
    description: "this is event description",
    date: "230825",
    time: "08:32",
    participants: []
  };

  describe("EventCreate", () => {
    it("should create a new event successfully", async () => {
      const resp = await request(app)
        .post('/api/event')
        .send(mockEvent);

      expect(resp.statusCode).toBe(201);
      expect(resp.body.event.name).toBe(mockEvent.name);
    });

    it("should return 400 if body is missing", async () => {
      const resp = await request(app)
        .post('/api/event')
        .send({});

      expect(resp.statusCode).toBe(400);
    });
  });

  describe("EventDelete", () => {
    it("should delete event successfully", async () => {
      // Create event first
      const created = await request(app).post('/api/event').send(mockEvent);
      const eventId = created.body.event._id;

      const resp = await request(app)
        .delete(`/api/event/${eventId}`);

      expect(resp.statusCode).toBe(200);
    });

    it("should return 404 if event not found", async () => {
      const resp = await request(app)
        .delete(`/api/event/64d3c33aa19d4d1d882fc999`); // fake ObjectId

      expect(resp.statusCode).toBe(404);
    });
  });
});
