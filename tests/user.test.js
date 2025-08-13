const app = require("../app.js")
const request = require("supertest")
const bcrypt = require("bcrypt")

const User = require("../models/User.js");
// import {authLogin, authRegister} from "../controllers/user-controller.js";




describe('Login Test', () => {
  let mockFindOne;
  beforeEach(() => {
    // mock the User data.
    mockFindOne = jest.spyOn(User, "findOne");
  })

  afterEach(() => {
    // restore the mock data. 
    mockFindOne.mockRestore();
  })

  const hashPswd = (plainText) => bcrypt.hash(plainText, 8);
  const mockUserName = { username: "omkar", password: "Hello@123" }
  const mockUserEmail = { email: "omkar.bulbule@gmail.com", password: "Hello@123" }

  describe('Creds are given', () => {
    // should save the username and password to the db.
    // should respond with json object containing the user_id.

    it("shoudl respond with 400 if username not found", async () => {
      mockFindOne.mockImplementation( async (query) => {{
        return query.username === "omkar" ? mockUserName : null
      }})

      const resp = await request(app)
        .post('/api/login')
        .send({
          username: "wrong",
          password: "Hello@123"
        })
      expect(resp.statusCode).toBe(400)
    })

    it("should respond with 400 if email not found", async () => {
      mockFindOne.mockImplementation(async (query) => {
        return query.email === "omkar.bulbule@gmail.com" ? mockUserEmail : null
      })

      const resp = await request(app)
        .post('/api/login')
        .send({
          email: "wrong.email@gmail.com",
          password: "Hello@123"
        })
      expect(resp.statusCode).toBe(400);
    })

    // shold respond with 400 if password is incorrect.
    it("should respond with 400 if password is incorrect", async () => {
//      mockFindOne.mockImplementation( async (query) => {
//        const isMatch = await bcrypt.compare(query.password, hashPswd("Hello@123"))
//        return isMatch ? mockUserEmail : null;
//      })
      mockFindOne.mockResolvedValue(mockUserEmail); //jest.spyOn(User, "findOne")
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);          //jest.spyOn(bcrypt, "compare")
      
      const resp = await request(app)
        .post('/api/login')
        .send({
          email: "omkar.bulbule@gmail.com",
          password: "wrongPswd"
        })
      expect(resp.statusCode).toBe(400);
    })

    it("should respond with 200 if password is correct", async () => {
      mockFindOne.mockResolvedValue(mockUserEmail)
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const resp = await request(app)
        .post('/api/login')
        .send({
          email: "omkar.bulbule@gmail.com",
          password: "Hello@123"
        })
      expect(resp.statusCode).toBe(200)
    })

    // should respond with 200 status code
    it("should respond 200 if email and password provided", async () => {
      //mock the user
      mockFindOne.mockResolvedValue(mockUserEmail)

      const resp = await request(app)
        .post('/api/login')
        .send({
          email: "omkar.bulbule@gmail.com",
          password: "Hello@123"
        })
      expect(resp.statusCode).toBe(200);
    })

    it("should repond 200 if username and password provided", async () => {
      mockFindOne.mockResolvedValue(mockUserName);

      const resp = await request(app)
        .post('/api/login')
        .send({
          username: "omkar", 
          password: "Hello@123"
        })
      expect(resp.statusCode).toBe(200)
    })

    // should specify the json in content-type
    it("should be content type - json", async () => {
      mockFindOne.mockResolvedValue(mockUserEmail);

      const resp = await request(app)
        .post('/api/login')
        .send({
          email: "omkar.bulbule@gmail.com",
          password: "Hello@123"
        })
      expect(resp.headers['content-type']).toMatch(/json/);
    })
    // data should be encrypt in session_id.
  })

  describe('Creds are incomplete', () => {
    it("should respond 400 if no data provided.", async () => {
      mockFindOne.mockResolvedValue(mockUserEmail);

      const resp = await request(app)
        .post('/api/login')
        .send({})
      expect(resp.statusCode).toBe(400);
    })
    //should respone with 400 if no username or email provided.
    //should respond with 400 if no password given.
  })
})



describe('Register Test', () => {
  let mockFindOne; 
  let mockSave;
  beforeEach(() => {
    mockFindOne = jest.spyOn(User, "findOne")
    mockSave = jest.spyOn(User.prototype, "save");
  })

  afterEach(() => {
    mockFindOne.mockRestore();
    mockSave.mockRestore();
  })

  const mockUser = {
    username: "omkar", 
    email: "omkar.bulbule@gmail.com",
    password: "Hello@123",
    confirm_password: "Hello@123"
  };

  it("should respond 400 if user already exists", async () => {
    await mockFindOne.mockResolvedValue(mockUser);

    const resp = await request(app)
      .post('/api/register')
      .send(mockUser)
    expect(resp.statusCode).toBe(400);
  })
  it("should respond 200 if all fields are provided", async () => {
    await mockFindOne.mockResolvedValue(null); //set the mock data as empty.
    await mockSave.mockResolvedValue({ _id: "123", username: "omkar" })

    const resp = await request(app)
      .post('/api/register')
      .send(mockUser)
    expect(resp.statusCode).toBe(200);
  })
  it("should respond 400 if none fields are provided",async () => {
    mockFindOne.mockResolvedValue(mockUser);
    const resp = await request(app)
      .post('/api/register')
      .send({});
    expect(resp.statusCode).toBe(400);
  })
  it("should respond 400 if both password does not match", async () => {
    mockFindOne.mockImplementation(async (query) => {
      return query.password === query.confirm_password ? mockUser : null;  
    })

    const resp = await request(app)
      .post('/api/register')
      .send({
        username: "omkar",
        email: "omkar.bulbule@gmail.com",
        password: "Hello@123",
        confirm_password: "wrongPswd"
      })
    expect(resp.statusCode).toBe(400)
  })
})
