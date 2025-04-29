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
    return <div className="text-center text-lg mt-10">Loading users...</div>;
  }

  return (
    <div className="p-8 mt-14">
      <h1 className="text-3xl font-bold mb-6 text-center">👑 Manage Users</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-3 px-6 text-left">Name</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-6">{user.name}</td>
                <td className="py-3 px-6">{user.email}</td>
                <td className="py-3 px-6">{user.role}</td>
                <td className="py-3 px-6 text-center space-x-2">
                  {user.role !== 'ADMIN' ? (
                    <>
                      <button
                        onClick={() => promoteToAdmin(user.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                      >
                        Promote
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      {currentUser?.id === user.id ? (
                        <button
                          onClick={selfDemote}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                        >
                          Self Demote
                        </button>
                      ) : (
                        <button
                          onClick={() => demoteUser(user.id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                        >
                          Demote
                        </button>
                      )}
                    </>
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
