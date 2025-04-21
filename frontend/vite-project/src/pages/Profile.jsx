import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, darkToggle } = useAuth();  // Fetch user from context
  const [profileData, setProfileData] = useState(null);

  const navigate = useNavigate();

  // Fetch user profile data from the backend
  useEffect(() => {
    if (!user) {
      navigate('/login');  // Redirect to login if user is not authenticated
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,  // Assuming token is saved in localStorage
          },
        });
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  if (!profileData) {
    return <div>Loading...</div>;
  }

  return (
    <div className={darkToggle ? "pt-24 bg-gray-900 text-white min-h-screen font-semibold px-8" : "pt-24 font-semibold px-8"}>
      <h1 className='text-xl'>Profile</h1>
      <div className='space-y-2 mt-4'>
        <p>Name: {profileData.name}</p>
        <p>Email: {profileData.email}</p>
      </div>
      <button onClick={logout} className="border rounded-md px-3 py-1 mt-2 shadow">Logout</button>
    </div>
  );
};

export default Profile;
