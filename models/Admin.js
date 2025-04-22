// /models/Admin.js

import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: "admin" },
});

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
