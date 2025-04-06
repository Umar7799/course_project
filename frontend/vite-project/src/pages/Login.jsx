import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Login = () => {
    const { login } = useAuth();
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
        <div className="container mt-5" style={{ maxWidth: '500px' }}>
            <h2 className="mb-4 text-center">Login</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="you@example.com"
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">Login</button>
            </form>
        </div>
    );
};

export default Login;
