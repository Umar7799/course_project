import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Login = () => {
    const { login, darkToggle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        

        try {
            await login(email, password);  // Call the login function from context
            navigate('/dashboard');  // Redirect to the dashboard after successful login
        } catch (err) {
            console.log(err);  // For debugging purposes
            setError('Invalid credentials');  // Show this error if login fails
        }
    };

    return (
        <div className={darkToggle ? 'pt-36 bg-gray-700 h-screen' : 'pt-36 h-screen'}>

            <div className={darkToggle ? "text-white" : ""}>
                <h2 className="mb-4 text-center text-2xl font-semibold">Login</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit} className='flex justify-center'>
                    <div>
                        <div className="mb-3">
                            <label className="font-semibold">Email</label>
                            <input
                                type="email"
                                className="bg-gray-50 block w-80 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                                value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@example.com" />
                        </div>
                        <div className="mb-3">
                            <label className="font-semibold">Password</label>
                            <input
                                type="password"
                                className="bg-gray-50 block w-80 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                                value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter your password" />
                        </div>
                        <div className='flex justify-center'>
                            <button type="submit" className="text-white bg-blue-600 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm sm:w-auto px-5 py-2.5">Login</button>
                        </div>

                    </div>
                </form>
            </div>

        </div>
    );
};

export default Login;
