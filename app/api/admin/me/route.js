import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Admin from "@/models/Admin";
import { getToken } from "@/lib/auth";
import bcrypt from "bcryptjs";


// ✅ GET : récupérer les infos de l’admin
export async function GET(req) {
  try {
    await dbConnect();
    const admin = await getToken("admin", req);

    if (!admin) {
      return NextResponse.json({ message: "Administrateur non trouvé" }, { status: 401 });
    }

    return NextResponse.json({
      _id: admin._id,
      email: admin.email,
      firstName: admin.firstName || "", // ✅ Ajouté
      lastName: admin.lastName || "",   // ✅ Ajouté
      role: "admin",                    // ✅ Toujours inclure le rôle
    }, { status: 200 });
  } catch (error) {
    console.error("Erreur API /admin/me :", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}


// ✅ PUT : mettre à jour l’email et/ou mot de passe
export async function PUT(req) {
  try {
    await dbConnect();
    const admin = await getToken("admin", req); // ✅ Ajout req ici

    if (!admin) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 });
    }

    const { email, password } = await req.json();

    const updates = {};
    if (email) updates.email = email;
    if (password) updates.password = await bcrypt.hash(password, 10);

    await Admin.findByIdAndUpdate(admin._id, updates);

    return NextResponse.json({
      message: "Profil mis à jour",
      requireReconnect: Boolean(password), // S'il a changé son mot de passe, on demande reconnexion
    }, { status: 200 });
  } catch (err) {
    console.error("Erreur PUT /admin/me :", err);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
