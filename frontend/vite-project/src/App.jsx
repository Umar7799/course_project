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
import AddQuestionForm from './pages/AddQuestionsForm';

const App = () => {
  return (
    <AuthProvider>
      <div className="">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/profile"
            element={<ProtectedRoute element={<Profile />} />}  // Protect Profile route
          />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/templates/:id" element={<TemplateDetailPage />} />
          <Route
            path="/createTemplate"
            element={<ProtectedRoute element={<CreateTemplate />} />}  // Protect TemplateDetail route
          />
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard />} requiredRole="admin" />}  // Protect Dashboard route and require admin role
          />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
