const users = require("./../models/User.js")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({path: [".env.local"]});


// const tokenSign = (userId: String) => {
//   return jwt.sign({ userId }, secret_key, { expiresIn: "1d" });
// }

const LoginUser = async (req, res) => {
  try {
    const {_id, username, email, password}= req.body; 

    // getting the user from the db.
    const query = username ? { username } : { email }
    const user = await users.findOne(query)



    //checking all the required fields are given by user or not.
    if (!username && !email || !password) {
      return res.status(400).json({message: "Please provide username, email  or password"})
    }

    //chekc is user exist or not... username or email.
    if (!user) return res.status(400).json({message: "user not foudn"})

    const isPswdCorrect = await bcrypt.compare(password, user.password);
    if (!isPswdCorrect) return res.status(400).json({message: "password incorrect!"}) 

    // sing the token for autherization.
    const token = jwt.sign({ _id: user.id }, process.env.SECRET_KEY, { expiresIn: "1d" });

    return res.status(200).json({
      message: "User Successfully login!",
      token
    })

  } catch (err) {
    console.log(`got the error - ${err}`) 
    return res.status(500).json({message: `got the error -- ${err}`});
  }
}


const RegisterUser = async (req, res) => {
  try {
    const {username, email, password, confirm_password} = req.body

    // does all the fields exists.
    if (!username || !email || !password || !confirm_password) {
      return res.status(400).json("Please Fill the form");
    }

    // does both the password match
    const isPswdMatch = password === confirm_password ? true : false
    if (!isPswdMatch) return res.status(400).json({message: "Password Incorrect"})

    // does user exists.
    const query = username ? { username } : { email }
    const user = await users.findOne(query);

    if (user) return res.status(400).json({message: "user already exists!"})

    const hashPswd = await bcrypt.hash(password, 8);
    const newUser = new users({
      username, 
      email,
      password: hashPswd
    })

    await newUser.save();
    return res.status(200).json({message: "User Created Successfully!"});

  } catch (err) {
    console.log(`register error --- ${err}`);
    return res.status(500).json(`register error --- ${err}`);
  }
}


module.exports = { LoginUser, RegisterUser };
