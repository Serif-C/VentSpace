import { useState } from "react";
import { signin } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResendMessage("");

    try {
      const data = await signin(email, password);
      login(data);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleResendVerification() {
    console.log("Resend clicked"); // DEBUG

    setResendMessage("");

    try {
      const res = await apiFetch("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      console.log("Response:", res); // DEBUG
      setResendMessage(res.message);
    } catch (err: any) {
      console.error(err);
      setResendMessage(err.message);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Login</h2>

      {error && (
        <div className="text-red-500 text-sm mb-3">
          {error}

          {error.includes("verify your email") && (
            <div className="mt-2">
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-indigo-500 hover:underline text-sm"
              >
                Resend verification email
              </button>
            </div>
          )}
        </div>
      )}

      {resendMessage && (
        <div className="text-green-600 text-sm mb-3">
          {resendMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="w-full bg-indigo-500 text-white p-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}