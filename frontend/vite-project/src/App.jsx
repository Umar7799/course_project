import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import TemplatesPage from './pages/TemplatesPage';
import TemplateDetailPage from './pages/TemplateDetailPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';  // Import ProtectedRoute
import CreateTemplate from './pages/CreateTemplate';
import AdminUsers from './pages/AdminUsers';
import TemplateResultPage from './pages/TemplateResultPage';

const App = () => {
  return (
    <AuthProvider>
      <div className="">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/:id" element={<TemplateDetailPage />} />
          <Route path="/templates/:id/results" element={<TemplateResultPage />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/createTemplate" element={<ProtectedRoute element={<CreateTemplate />} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} requiredRole="ADMIN" />} />
          <Route path="/promoteUser" element={<ProtectedRoute element={<AdminUsers />} requiredRole="ADMIN" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
