// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [user, setUser] = useState(null); // Stores user profile
  const [error, setError] = useState(null); // Error handling
  const [loading, setLoading] = useState(true); // Track loading state

  const [showCRMForm, setShowCRMForm] = useState(false);
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [syncMessage, setSyncMessage] = useState('');
  const [syncError, setSyncError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('No token found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
      } catch (err) {
        console.error('❌ Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [API_URL]);

  const handleCRMSync = async (e) => {
    e.preventDefault();
    setSyncMessage('');
    setSyncError('');

    try {
      const response = await axios.post('http://localhost:5000/auth/salesforce/sync', {
        company,
        phone,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setSyncMessage(`✅ Synced! Account ID: ${response.data.accountId}`);
      setCompany('');
      setPhone('');
    } catch (error) {
      if (error.response?.status === 409) {
        const { message, existingContactId, accountId } = error.response.data;
        setSyncError(`⚠️ ${message} (Contact ID: ${existingContactId}, Account ID: ${accountId})`);
      } else {
        console.error("CRM Sync failed:", error.response?.data || error.message);
        setSyncError('❌ Failed to sync with Salesforce. ' + (error.response?.data?.error || ''));
      }
    }

  };

  if (loading) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div className='mt-24 ml-4'>
      <h1>📋 Dashboard</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {user ? (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>

          {(user.role === 'ADMIN' || user.id === user.id) && (  // Always true for now, but makes intention clear
            <button
              onClick={() => setShowCRMForm(!showCRMForm)}
              className="mt-4 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded-md px-3 py-1"
            >
              {showCRMForm ? "Hide CRM Form" : "Sync to Salesforce CRM"}
            </button>
          )}


          {showCRMForm && (
            <form onSubmit={handleCRMSync} className="mt-4 space-y-4 max-w-md">
              <div>
                <label htmlFor="company" className="block text-sm font-medium">Company Name</label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  className="w-full border px-3 py-1 rounded-md text-black"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border px-3 py-1 rounded-md text-black"
                />
              </div>

              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md shadow">
                Submit to Salesforce
              </button>

              {syncMessage && <p className="text-green-600">{syncMessage}</p>}
              {syncError && <p className="text-red-600">{syncError}</p>}
            </form>
          )}
        </div>
      ) : (
        !error && <p>Loading user info...</p>
      )}
    </div>
  );
};

export default Dashboard;
