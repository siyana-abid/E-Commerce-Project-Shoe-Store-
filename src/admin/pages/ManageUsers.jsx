
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);

      const customers = response.data.filter(
        (user) => user.role !== "admin"
      );

      setUsers(customers);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (user) => {
    const updatedBlockedStatus = user.blocked !== true;

    try {
      const response = await axios.patch(
        `${API_URL}/users/${user.id}`,
        { blocked: updatedBlockedStatus }
      );

      setUsers((prev) =>
        prev.map((item) =>
          String(item.id) === String(user.id)
            ? response.data
            : item
        )
      );

      if (
        selectedUser &&
        String(selectedUser.id) === String(user.id)
      ) {
        setSelectedUser(response.data);
      }

      toast.success(
        updatedBlockedStatus
          ? "User blocked successfully"
          : "User unblocked successfully"
      );
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const getUserStatus = (user) => {
    if (user.blocked === true) {
      return "Blocked";
    }

    return "Active";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3B2A22]">
          Manage Users
        </h1>

        <p className="text-[#8B776B] mt-2">
          View and manage registered TREDORA customers.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-[#3B2A22]/10 mb-6">
        <p className="text-sm text-[#8B776B]">
          Total Registered Users
        </p>

        <h2 className="text-3xl font-bold text-[#3B2A22] mt-2">
          {loading ? "..." : users.length}
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-[#3B2A22]/10 overflow-hidden">
        <div className="p-6 border-b border-[#3B2A22]/10">
          <h2 className="text-xl font-semibold text-[#3B2A22]">
            All Users
          </h2>
        </div>

        {loading ? (
          <p className="p-6 text-[#8B776B]">
            Loading users...
          </p>
        ) : users.length === 0 ? (
          <p className="p-6 text-[#8B776B]">
            No registered users found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F5F1E8] text-[#3B2A22]">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-[#3B2A22]/10 text-[#3B2A22]"
                  >
                    <td className="p-4">{user.id}</td>

                    <td className="p-4 font-medium">
                      {user.name}
                    </td>

                    <td className="p-4">
                      {user.email}
                    </td>

                    <td className="p-4">
                      {user.role}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          user.blocked === true
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {getUserStatus(user)}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="bg-[#F5F1E8] text-[#3B2A22] px-3 py-2 rounded-lg text-sm hover:bg-[#e8dfd2]"
                        >
                          View
                        </button>

                        <button
                          onClick={() => handleToggleBlock(user)}
                          className="bg-[#3B2A22] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#51392e]"
                        >
                          {user.blocked === true
                            ? "Unblock"
                            : "Block"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual User Details */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-7 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#3B2A22]">
                User Details
              </h2>

              <button
                onClick={() => setSelectedUser(null)}
                className="text-2xl text-[#8B776B]"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-[#3B2A22]">
              <p>
                <strong>ID:</strong> {selectedUser.id}
              </p>

              <p>
                <strong>Name:</strong> {selectedUser.name}
              </p>

              <p>
                <strong>Email:</strong> {selectedUser.email}
              </p>

              <p>
                <strong>Role:</strong> {selectedUser.role}
              </p>

              <p>
                <strong>Status:</strong> {getUserStatus(selectedUser)}
              </p>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-7 bg-[#3B2A22] text-white py-3 rounded-full hover:bg-[#51392e]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
