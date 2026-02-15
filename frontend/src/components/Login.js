import { useState } from "react";
import { apiFetch } from "../api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (res && res.success) {
        // Store role in localStorage
        localStorage.setItem("role", res.role);

        // Trigger parent login state
        onLogin();
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Server error. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>EquipTrack Login</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br /><br />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
