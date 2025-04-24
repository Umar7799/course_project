import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const SignUp = () => {
  const { darkToggle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/auth/signup', {
        name,
        email,
        password,
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing up', error);
    }
  };

  return (
    <div className={darkToggle ? 'pt-36 bg-gray-700 h-screen text-white' : 'pt-36 h-screen'}>
      <h2 className='mb-4 text-center text-2xl font-semibold'>Sign Up</h2>
      <form onSubmit={handleSignUp} className='flex justify-center'>
        <div className='space-y-4'>
          <div>
            <label className="font-semibold">Name</label>
            <input className="bg-gray-50 block w-80 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="font-semibold">Email</label>
            <input className="bg-gray-50 block w-80 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="font-semibold">Password</label>
            <input className="bg-gray-50 block w-80 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className='flex justify-center mt-4'>
            <button type="submit" className="text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5">Sign Up</button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default SignUp;
