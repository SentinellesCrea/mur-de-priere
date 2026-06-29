import mongoose from "mongoose";

const AdminProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    isOwner: { type: Boolean, default: false },
    legacyAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AdminProfile ||
  mongoose.model("AdminProfile", AdminProfileSchema);
