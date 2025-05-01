import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  // Wrap fetchUsers with useCallback to prevent unnecessary re-renders and include in the dependency array
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_URL}/auth/allUsers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, [API_URL]); // API_URL is a dependency here

  const promoteToAdmin = async (userId) => {
    try {
      const token = localStorage.getItem('token');

      await axios.post(`${API_URL}/auth/promoteUser`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      alert("✅ User promoted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error promoting user:", error);
      alert("❌ Failed to promote user.");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('⚠️ Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');

      await axios.delete(`${API_URL}/auth/deleteUser/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      alert('✅ User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Failed to delete user.');
    }
  };

  const selfDemote = async () => {
    if (!window.confirm('⚠️ Are you sure you want to remove your admin rights?')) return;

    try {
      const token = localStorage.getItem('token');

      await axios.post(`${API_URL}/auth/selfDemote`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      alert("✅ You are now a regular user!");
      window.location.reload(); // Or navigate to a different page
    } catch (error) {
      console.error("Error self-demoting:", error);
      alert("❌ Failed to self-demote.");
    }
  };

  const demoteUser = async (userId) => {
    if (!window.confirm('⚠️ Are you sure you want to demote this admin to a user?')) return;

    try {
      const token = localStorage.getItem('token');

      await axios.post(`${API_URL}/auth/demoteUser`,
        { userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      alert("✅ User demoted successfully!");
      fetchUsers();
    } catch (error) {
      console.error("Error demoting user:", error);
      alert("❌ Failed to demote user.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUser(decoded);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Fetch users when the component mounts or fetchUsers changes

  if (loading) {
    return <div className="text-center text-lg mt-24">Loading users...</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 mt-10 md:mt-14">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center">
        👑 Manage Users
      </h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md text-sm sm:text-base">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-3 sm:py-3 sm:px-6 text-left">Name</th>
              <th className="py-2 px-3 sm:py-3 sm:px-6 text-left">Email</th>
              <th className="py-2 px-3 sm:py-3 sm:px-6 text-left">Role</th>
              <th className="py-2 px-3 sm:py-3 sm:px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3 sm:py-3 sm:px-6">{user.name}</td>
                <td className="py-2 px-3 sm:py-3 sm:px-6">{user.email}</td>
                <td className="py-2 px-3 sm:py-3 sm:px-6">{user.role}</td>
                <td className="py-2 px-3 sm:py-3 sm:px-6 text-center space-y-1 space-x-0 sm:space-x-2 sm:space-y-0">
                  {user.role !== "ADMIN" ? (
                    <>
                      <button className="block sm:inline bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm"
                        onClick={() => promoteToAdmin(user.id)}>Promote</button>
                      <button className="block sm:inline bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm"
                        onClick={() => deleteUser(user.id)}>Delete</button>
                    </>
                  ) : currentUser?.id === user.id ? (
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm"
                      onClick={selfDemote}>Self Demote</button>
                  ) : (
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm"
                      onClick={() => demoteUser(user.id)}>Demote</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  );
};

export default AdminUsers;
