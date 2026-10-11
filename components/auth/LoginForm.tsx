"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth";
import Link from "next/link";

type Role =
  | "admin"
  | "dispatcher"
  | "customer"
  | "driver"
  | "provider"
  | "supplier"
  | "mechanic";

type Props = {
  role: Role;
  title: string;
  subtitle: string;
  redirectTo: string;
};

export default function LoginForm({
  role,
  title,
  subtitle,
  redirectTo,
}: Props) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      const user = data.user;

      if (user.role?.toLowerCase() !== role.toLowerCase()) {
        setError("You are not allowed to access this panel.");
        setLoading(false);
        return;
      }

      localStorage.setItem("alpha_token", data.token);
      localStorage.setItem("alpha_user", JSON.stringify(user));

      if (user.supplierId || user.SupplierId) {
        localStorage.setItem(
          "supplierId",
          user.supplierId || user.SupplierId
        );
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827]/90 p-6 shadow-2xl">
        <div className="mb-8">
          <p className="text-green-400 text-sm font-bold uppercase">
            Alpha Secure Access
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            {title}
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            {subtitle}
          </p>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleLogin();
          }}
        >
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-green-500"
          />

          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 text-white outline-none focus:border-green-500"
          />

          {error && (
            <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {role === "customer" && (
            <div className="flex items-center justify-between text-sm">
              <Link
                href="/register"
                className="text-green-400 hover:underline"
              >
                Create account
              </Link>

              <Link
                href="/forgot-password"
                className="text-gray-300 hover:text-white"
              >
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-green-500 py-4 font-bold text-black disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
