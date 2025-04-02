import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthContextProvider from "./context/AuthContextProvider"; // Import the new AuthContextProvider
import React from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";


function App() {
  return (
    <AuthContextProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        
      </Routes>
    </Router>
    </AuthContextProvider>
  );
}

export default App;

