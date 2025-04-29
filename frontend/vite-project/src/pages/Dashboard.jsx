// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null); // Stores user profile
  const [error, setError] = useState(null); // Error handling
  const [loading, setLoading] = useState(true); // Track loading state
  
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token'); // JWT from login

        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!token) {
            setError('No token found. Please log in.');
            return;
          }
        setUser(response.data);
        setLoading(false); // Set loading to false after data is fetched
      } catch (err) {
        console.error('❌ Error fetching profile:', err);
        setLoading(false); // Set loading to false in case of error
        setError('Failed to load profile');
      }
    };

    fetchProfile();
  }, [API_URL]);

  if (loading) {
    return <div>Loading user profile...</div>; // Show loading message while fetching data
  }

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
