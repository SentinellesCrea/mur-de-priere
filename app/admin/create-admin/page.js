"use client";
import { useState } from "react";

const TransferAdminPage = () => {
  const [email, setEmail] = useState("");

  const handleTransfer = (e) => {
    e.preventDefault();
    console.log("Transfert de l'administration à :", email);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">🔄 Céder l’Administration</h1>
      <form onSubmit={handleTransfer}>
        <input
          type="email"
          className="border p-2 w-full my-2"
          placeholder="Email du nouveau administrateur"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-purple-500 text-white px-4 py-2 rounded-md"
        >
          Confirmer le transfert
        </button>
      </form>
    </div>
  );
};

export default TransferAdminPage;
