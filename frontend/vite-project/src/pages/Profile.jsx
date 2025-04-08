import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/useAuth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout } = useAuth();  // Fetch user from context
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
    <div className="container">
      <h2>Profile</h2>
      <p><strong>Name:</strong> {profileData.name}</p>
      <p><strong>Email:</strong> {profileData.email}</p>
      <button onClick={logout} className="btn btn-danger">Logout</button>
    </div>
  );
};

export default Profile;
