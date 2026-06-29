// /models/Admin.js

import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
{
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true },
  profileImage: { type: String, default: "" },
  role: { type: String, default: "admin" },
  date: { type: Date, default: Date.now },
},
{ timestamps: false }
);

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
