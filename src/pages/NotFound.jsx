
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex flex-col items-center justify-center text-center px-4">

      <h1 className="text-8xl font-bold text-[#3B2A22]">
        404
      </h1>

      <h2 className="text-2xl font-semibold text-[#3B2A22] mt-4">
        Page Not Found
      </h2>

      <p className="text-[#8B776B] mt-3 max-w-md">
        Sorry! The page you are looking for
        doesn't exist or may have been moved.
      </p>

      <button
        onClick={() => navigate("/home")}
        className="mt-7 bg-[#3B2A22] text-white px-6 py-3 rounded-lg hover:bg-[#51392e] transition"
      >
        Back to Home
      </button>

    </div>
  );
}

export default NotFound;
