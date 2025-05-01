import React from 'react';
import { useAuth } from '../../context/useAuth'

const AccessManager = ({ template, setTemplate, templateId }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { darkToggle } = useAuth();


    const handleAddUser = async (e) => {
        e.preventDefault();
        const email = e.target.elements.email.value;
        try {
            const res = await fetch(`${API_URL}/auth/templates/${templateId}/allow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error(await res.text());
            alert(`Access granted to ${email}`);
            e.target.reset();
        } catch (err) {
            console.error('Error adding user:', err);
            alert('Failed to add user');
        }
    };

    const handleRemoveUser = async (email) => {
        try {
            await fetch(`${API_URL}/auth/templates/${templateId}/allow`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ email }),
            });
            alert(`${email} removed`);
            setTemplate((prev) => ({
                ...prev,
                allowedUsers: prev.allowedUsers.filter((u) => u.email !== email),
            }));
        } catch (err) {
            console.error('Error removing user:', err);
            alert('Failed to remove user');
        }
    };

    return (
        <div className={darkToggle ? 'mt-4 border border-gray-800 bg-gray-800 p-4 rounded-md' : 'mt-4 border border-gray-400 bg-gray-400 p-4 rounded-md'}>
            <h3 className="text-lg font-bold mb-2">Manage Access</h3>
            <form onSubmit={handleAddUser} className="flex gap-2 items-center mb-4">
                <input type="email" name="email" placeholder="Enter user email" className="placeholder-gray-500 border border-gray-300 px-3 py-1 rounded bg-gray-50 flex-grow focus:ring-blue-500 focus:border-blue-500" required />
                <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Allow User</button>
            </form>
            {template.allowedUsers?.length > 0 && (
                <div>
                    <h4 className="font-semibold mb-1">Allowed Users:</h4>
                    <ul className="space-y-1">
                        {template.allowedUsers.map((u) => (
                            <li key={u.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                <span>{u.email}</span>
                                <button className="bg-red-500 text-white px-2 py-1 rounded text-sm" onClick={() => handleRemoveUser(u.email)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AccessManager;
