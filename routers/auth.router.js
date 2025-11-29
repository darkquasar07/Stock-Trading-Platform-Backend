// import express from "express";
// import User from '../models/user.js'
// import jwt from "jsonwebtoken";
// import auth from "../middlewere/auth.middle.js";
// import dotenv from "dotenv";
// const router = express.Router();
// dotenv.config();
// const SECRET_KEY = "secret_key";

// // Handling post request
// router.post("/login", async (req, res, next) => {
//   let { email, password } = req.body;

//   let existingUser;
//   try {
//     existingUser = await User.findOne({ email: email });
//   } catch {
//     const error = new Error("Error! Something went wrong.");
//     return next(error);
//   }
//   if (!existingUser || existingUser.password != password) {
//     const error = Error("Wrong details please check at once");
//     return next(error);
//   }
//   let token;
//   try {
//     //Creating jwt token
//     token = jwt.sign(
//       { userId: existingUser.id, email: existingUser.email },
//       SECRET_KEY,
//       { expiresIn: "1h" }
//     );
//   } catch (err) {
//     console.log(err);
//     const error = new Error("Error! Something went wrong.");
//     return next(error);
//   }
//   var newUser = await User.findById(existingUser.id);

//   res.status(200).json({
//     success: true,
//     data: {
//       userId: newUser.id,
//       email: newUser.email,
//       token: token,
//       first_name: newUser.first_name,
//       last_name: newUser.last_name,
//     },
//   });
// });

// // Handling post request
// router.post("/signup", async (req, res, next) => {
//   const { first_name, last_name, email, password, phone, address } = req.body;

//   User.findOne({
//     email: email 
//   }).then(async (user) => {
//     if (user) {
//       console.log(user);
//       console.log('user already exists');
//       return res.status(400).json({
//         success: false,
//         data:{
//           message: "User already exists"
//         }
//       });
//     }else{
//       const newUser = await User({
//                           first_name,
//                           last_name,
//                           email,
//                           password,
//                           phone,
//                           address,
//                           credits: 1000000,
//                           stocks: [],
//                         });
//             newUser.save().then((result) => {
//               console.log(result);
//             }).catch((err) => {
//               console.log(err);
//             });
//             let token;
//             try {
//               token = jwt.sign(
//                 { userId: newUser.id, email: newUser.email },
//                 SECRET_KEY,
//                 { expiresIn: "1h" }
//               );
//             } catch (err) {
//               const error = new Error("Error! Something went wrong. 2");
//               return next(error);
//             }
//             res.status(201).json({
//               success: true,
//               data: { userId: newUser.id, email: newUser.email, token: token,first_name: newUser.first_name, last_name: newUser.last_name }
//             });
//           }
// });


// router.delete('/logout',auth,async(req,res,next)=>{
//   try{
//     req.user.tokens = req.user.tokens.filter((token)=>{
//       return token.token != req.token;
//     });
//     await req.user.save();
//     res.send('Logged out successfully');
//   }catch(e){
//     res.status(500).send(e);
//   }
//   });
// });


// export default router;

// backend/routers/auth.router.js
import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.js";
import auth from "../middlewere/auth.middle.js";

dotenv.config();
const router = express.Router();

const SECRET_KEY = process.env.JWT_SECRET || "secretkey";
const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  "613864712862-u8qe0vi59a3c28jlrv0obvenqtd4af94.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Helper: create JWT
async function createAndSaveJwt(user) {
  const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY, { expiresIn: "7d" });
  user.tokens = user.tokens || [];
  user.tokens.push({ token });
  await user.save();
  return token;
}

// --- LOGIN (email/password) ---

// Handling post request
router.post("/login", async (req, res, next) => {
  let { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch {
    const error = new Error("Error! Something went wrong.");
    return next(error);
  }
  if (!existingUser || existingUser.password != password) {
    const error = Error("Wrong details please check at once");
    return next(error);
  }
  let token;
  try {
    //Creating jwt token
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    console.log(err);
    const error = new Error("Error! Something went wrong.");
    return next(error);
  }
  var newUser = await User.findById(existingUser.id);

  res.status(200).json({
    success: true,
    data: {
      userId: newUser.id,
      email: newUser.email,
      token: token,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
    },
  });
});
// --- SIGNUP (email/password) ---
router.post("/signup", async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone, address } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "User already exists" });

    const newUser = new User({
      first_name,
      last_name,
      email,
      password,
      phone,
      address,
      credits: 1000000,
      stocks: [],
      tokens: [],
    });
    await newUser.save();
    const token = await createAndSaveJwt(newUser);

    res.status(201).json({
      success: true,
      data: {
        userId: newUser.id,
        email: newUser.email,
        token,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// --- GOOGLE LOGIN / SIGNUP ---
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: "No token provided" });

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId, given_name, family_name, picture } = payload;
    if (!email) return res.status(400).json({ success: false, message: "No email in Google token" });

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        first_name: given_name || "",
        last_name: family_name || "",
        email,
        password: undefined,
        credits: 1000000,
        stocks: [],
        tokens: [],
        googleId,
        picture,
      });
      await user.save();
    } else {
      let changed = false;
      if (!user.googleId && googleId) { user.googleId = googleId; changed = true; }
      if (!user.picture && picture) { user.picture = picture; changed = true; }
      if (changed) await user.save();
    }

    const appToken = await createAndSaveJwt(user);

    res.json({
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        token: appToken,
        first_name: user.first_name,
        last_name: user.last_name,
        picture: user.picture,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
});

export default router;
