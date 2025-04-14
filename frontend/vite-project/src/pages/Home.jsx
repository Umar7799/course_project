import React from 'react';
import '../index.css'
import { useAuth } from '../context/useAuth';

const Home = () => {
  const { darkToggle } = useAuth();







  return (
    <div className={darkToggle ? 'bg-gray-900 text-white min-h-screen pt-36' : 'min-h-screen pt-36'}>
      <div className='flex justify-center pt-10 text-xl font-semibold'>
        <h2>Welcome to My Form App!</h2>
      </div>
      <div className='flex justify-center pt-4 text-lg font-semibold text-center px-4'>
        <p>This is the home page. You can login or sign up to access your profile.</p>
      </div>
    </div>

  );
};

export default Home;
