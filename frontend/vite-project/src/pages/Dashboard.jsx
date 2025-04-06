// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null); // Stores user profile
  const [error, setError] = useState(null); // Error handling

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // JWT from login

        const response = await axios.get('http://localhost:5000/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!token) {
            setError('No token found. Please log in.');
            return;
          }
          

        setUser(response.data);
      } catch (err) {
        console.error('❌ Error fetching profile:', err);
        setError('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📋 Dashboard</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {user ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      ) : (
        !error && <p>Loading user info...</p>
      )}
    </div>
  );
};

export default Dashboard;
