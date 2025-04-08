// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null); // Stores user profile
  const [error, setError] = useState(null); // Error handling
  const [loading, setLoading] = useState(true); // Track loading state

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
        setLoading(false); // Set loading to false after data is fetched
      } catch (err) {
        console.error('❌ Error fetching profile:', err);
        setLoading(false); // Set loading to false in case of error
        setError('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

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
