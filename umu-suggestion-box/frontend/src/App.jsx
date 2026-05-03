import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import Home from './components/Home';
import PublicSuggestions from './components/PublicSuggestions';
import Features from './components/Features';
import Support from './components/Support';
import Login from './pages/Login';
import Register from './pages/Register';
import DeanLogin from './pages/DeanLogin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Dashboard from './pages/Dashboard';
import SubmitSuggestion from './pages/SubmitSuggestion';
import AdminPanel from './pages/AdminPanel';
import DeanDashboard from './pages/DeanDashboard';
import { isAuthenticated } from './utils/auth';
import './styles/App.css';

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/public-suggestions" element={<PublicSuggestions />} />
            <Route path="/features" element={<Features />} />
            <Route path="/support" element={<Support />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dean-login" element={<DeanLogin />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/submit-suggestion" 
              element={
                <ProtectedRoute>
                  <SubmitSuggestion />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dean-dashboard" 
              element={
                <ProtectedRoute>
                  <DeanDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <ChatWidget />
        <Footer />
      </div>
    </Router>
  );
}

export default App;