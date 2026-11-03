
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get(
        "http://localhost:3000/users"
      );

      const user = response.data.find(
        (item) =>
          item.email === email &&
          item.password === password
      );

      if (!user) {
        alert("Invalid email or password");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        })
      );

      alert("Login successful!");

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }

    } catch (error) {
      alert("Login failed");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(245,241,232)] flex items-center justify-center p-5">

      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl border border-[rgba(59,42,34,0.1)]"
      >

        <h1 className="text-3xl font-bold text-[rgb(59,42,34)] text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-center text-[rgba(59,42,34,0.6)] mb-8">
          Login to continue your shopping journey.
        </p>

        <label className="block text-[rgb(59,42,34)] font-medium mb-2">
          Email Address
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 mb-5 rounded-xl border border-[rgba(59,42,34,0.2)] bg-[rgb(245,241,232)] text-[rgb(59,42,34)] outline-none focus:ring-2 focus:ring-[rgb(59,42,34)]"
        />

        <label className="block text-[rgb(59,42,34)] font-medium mb-2">
          Password
        </label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 mb-6 rounded-xl border border-[rgba(59,42,34,0.2)] bg-[rgb(245,241,232)] text-[rgb(59,42,34)] outline-none focus:ring-2 focus:ring-[rgb(59,42,34)]"
        />

        <button
          type="submit"
          className="w-full bg-[rgb(59,42,34)] text-[rgb(245,241,232)] py-3 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition"
        >
          Login
        </button>

        <p className="text-center text-[rgba(59,42,34,0.7)] mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-bold text-[rgb(59,42,34)] underline"
          >
            Register
          </Link>
        </p>

        <Link
          to="/"
          className="block text-center text-sm text-[rgba(59,42,34,0.6)] mt-5 hover:underline"
        >
          ← Back to Home
        </Link>

      </form>
    </div>
  );
}

export default Login;
