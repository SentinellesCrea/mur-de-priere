import User from "@/models/User";
import VolunteerProfile from "@/models/VolunteerProfile";
import SupervisorProfile from "@/models/SupervisorProfile";
import AdminProfile from "@/models/AdminProfile";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function legacyStatusToUserStatus(account) {
  if (account?.deletedAt) return "disabled";
  if (account?.status === "rejected") return "rejected";
  if (account?.isValidated || account?.status === "validated" || account?.role === "admin") {
    return "validated";
  }
  return "pending";
}

export function publicAuthUser(user, profile = null) {
  const legacyId = user.legacyId || user._id;
  const rawUser = user.toObject?.() || user;
  const base = {
    ...rawUser,
    _id: legacyId,
    userId: user._id,
    role: user.role,
    legacyId,
    legacyModel: user.legacyModel || null,
  };

  delete base.password;
  if (profile) base.profile = profile.toObject?.() || profile;

  return base;
}

export async function ensureRoleProfile(user, legacyAccount = null) {
  if (user.role === "admin") {
    return AdminProfile.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { userId: user._id, legacyAdminId: user.legacyId || legacyAccount?._id || null } },
      { upsert: true, new: true }
    );
  }

  if (user.role === "supervisor") {
    return SupervisorProfile.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { userId: user._id, legacyVolunteerId: user.legacyId || legacyAccount?._id || null } },
      { upsert: true, new: true }
    );
  }

  return VolunteerProfile.findOneAndUpdate(
    { userId: user._id },
    {
      $setOnInsert: {
        userId: user._id,
        legacyVolunteerId: user.legacyId || legacyAccount?._id || null,
        isAvailable: Boolean(legacyAccount?.isAvailable),
        gender: legacyAccount?.gender || user.gender || "",
        dateOfBirth: legacyAccount?.dateOfBirth || user.dateOfBirth || null,
        address: legacyAccount?.address || user.address || "",
      },
    },
    { upsert: true, new: true }
  );
}

export async function findUserByEmail(email) {
  return User.findOne({ email: normalizeEmail(email) }).select("+password +passwordResetVersion +deletedAt");
}

export async function findUserById(id) {
  return User.findById(id).select("+deletedAt");
}

export async function upsertUserFromLegacyAdmin(admin) {
  const user = await User.findOneAndUpdate(
    { email: normalizeEmail(admin.email) },
    {
      $set: {
        firstName: admin.firstName || "Admin",
        lastName: admin.lastName || "",
        email: normalizeEmail(admin.email),
        password: admin.password,
        phone: admin.phone || "",
        profileImage: admin.profileImage || "",
        role: "admin",
        status: "validated",
        isValidated: true,
        legacyModel: "Admin",
        legacyId: admin._id,
      },
    },
    { upsert: true, new: true }
  ).select("+password +passwordResetVersion +deletedAt");

  await ensureRoleProfile(user, admin);
  return user;
}

export async function upsertUserFromLegacyVolunteer(volunteer) {
  const role = volunteer.role === "supervisor" ? "supervisor" : "volunteer";
  const user = await User.findOneAndUpdate(
    { email: normalizeEmail(volunteer.email) },
    {
      $setOnInsert: {
        firstName: volunteer.firstName || "Membre",
        lastName: volunteer.lastName || "",
        email: normalizeEmail(volunteer.email),
        password: volunteer.password,
        phone: volunteer.phone || "",
        gender: volunteer.gender || "",
        dateOfBirth: volunteer.dateOfBirth || null,
        address: volunteer.address || "",
        profileImage: volunteer.profileImage || "",
        role,
        status: legacyStatusToUserStatus(volunteer),
        isValidated: Boolean(volunteer.isValidated),
        passwordResetVersion: volunteer.passwordResetVersion || 0,
        deletedAt: volunteer.deletedAt || null,
        legacyModel: "Volunteer",
        legacyId: volunteer._id,
      },
    },
    { upsert: true, new: true }
  ).select("+password +passwordResetVersion +deletedAt");

  await ensureRoleProfile(user, volunteer);
  return user;
}
