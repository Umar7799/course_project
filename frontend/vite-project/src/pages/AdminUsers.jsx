import { useEffect, useState } from "react";
import axios from "axios";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');  // Get token from localStorage

            const response = await axios.get('http://localhost:5000/auth/allUsers', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true, // optional (in case you need cookies too)
            });

            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const promoteToAdmin = async (userId) => {
        try {
            const token = localStorage.getItem('token'); // ✅

            await axios.post('http://localhost:5000/auth/promoteUser',
                { userId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                }
            );

            alert("✅ User promoted successfully!");
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error("Error promoting user:", error);
            alert("❌ Failed to promote user.");
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) {
        return <div className="text-center text-lg mt-10">Loading users...</div>;
    }

    return (
        <div className="p-8 mt-14">
            <h1 className="text-3xl font-bold mb-6 text-center">👑 Promote Users to Admin</h1>

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
                                <td className="py-3 px-6 text-center">
                                    {user.role !== 'ADMIN' ? (
                                        <button
                                            onClick={() => promoteToAdmin(user.id)}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                                        >
                                            Promote
                                        </button>
                                    ) : (
                                        <span className="text-green-600 font-semibold">Already Admin</span>
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
