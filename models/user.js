// import { ObjectId } from "mongodb";
// import mongoose from "mongoose";

// const UserSchema = new mongoose.Schema({
//   first_name: { type: String, required: true },
//   last_name: { type: String, required: true },
//   email: { type: String, required: true },
//   password: { type: String, required: true },
//   phone: { type: Number, required: true },
//   address: { type: String, required: true },
//   credits: { type: Number, required: true },
//   stocks: { type: Array, required: true },
//   tokens: [
//     {
//       token: { type: String, required: true }
//     }
//   ]
// });

// const User = mongoose.model("User", UserSchema);

// export default User;

// backend/models/user.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  first_name: { type: String },                 // not required for google users
  last_name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },                   // optional for google users
  phone: { type: Number },
  address: { type: String },
  credits: { type: Number, default: 1000000 },
  stocks: { type: Array, default: [] },
  tokens: [
    {
      token: { type: String, required: true },
    },
  ],
  // Google-specific fields
  googleId: { type: String, index: true, unique: false }, // unique false to avoid issues if same email used
  picture: { type: String },
});

const User = mongoose.model("User", UserSchema);
export default User;

