
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    // Password minimum 8 characters validation
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      const response = await axios.get(
        `${API_URL}/users`
      );

      const existingUser = response.data.find(
        (item) => item.email === email
      );

      if (existingUser) {
        toast.error("Email already registered!");
        return;
      }

      await axios.post(`${API_URL}/users`, {
        name,
        email,
        password,
        role: "user"
      });

      toast.success("Registration successful!");
      navigate("/login");

    } catch (error) {
      toast.error("Registration failed");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(245,241,232)] flex items-center justify-center p-5">

      <form
        onSubmit={handleRegister}
        className="bg-white w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl border border-[rgba(59,42,34,0.1)]"
      >

        <h1 className="text-3xl font-bold text-[rgb(59,42,34)] text-center mb-2">
          Create Account
        </h1>

        <p className="text-center text-[rgba(59,42,34,0.6)] mb-8">
          Join TREDORA and find your perfect pair.
        </p>

        <label className="block text-[rgb(59,42,34)] font-medium mb-2">
          Full Name
        </label>

        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 mb-5 rounded-xl border border-[rgba(59,42,34,0.2)] bg-[rgb(245,241,232)] text-[rgb(59,42,34)] outline-none focus:ring-2 focus:ring-[rgb(59,42,34)]"
        />

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
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full p-3 mb-6 rounded-xl border border-[rgba(59,42,34,0.2)] bg-[rgb(245,241,232)] text-[rgb(59,42,34)] outline-none focus:ring-2 focus:ring-[rgb(59,42,34)]"
        />

        <button
          type="submit"
          className="w-full bg-[rgb(59,42,34)] text-[rgb(245,241,232)] py-3 rounded-full font-semibold hover:bg-[rgb(81,57,46)] transition"
        >
          Create Account
        </button>

        <p className="text-center text-[rgba(59,42,34,0.7)] mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-[rgb(59,42,34)] underline"
          >
            Login
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

export default Register;
