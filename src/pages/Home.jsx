
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
    localStorage.removeItem("wishlist");

    alert("Logged out successfully!");

    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <div className="flex justify-between items-center">

        <h1 className="text-3xl font-bold">
          Welcome User!
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Home;
