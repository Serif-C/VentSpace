import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState("Verifying...");

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setMessage("Invalid verification link.");
      return;
    }

    apiFetch("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
    })
      .then(() => setMessage("Your email has been verified! You can now sign in."))
      .catch(() => setMessage("Verification failed."));
  }, []);

  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <h1 className="text-xl font-semibold">{message}</h1>
    </div>
  );
}