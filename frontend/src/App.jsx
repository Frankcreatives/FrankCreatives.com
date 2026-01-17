import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Projects from './pages/Projects';
import Feedback from './pages/Feedback';
import AdminDashboard from './pages/AdminDashboard';
import Polls from './pages/Polls';
import ResetPassword from './pages/ResetPassword';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Placeholders for now if files don't exist yet, but I'm creating them next.
// To avoid errors during the brief millisecond between calls, ensuring import order.
// Actually I will create App.jsx last in a real flow or assume concurrent creation.
// I'll keep this file simple.

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Projects />} />
            <Route path="/polls" element={<Polls />} />
            <Route path="/feedback" element={<Feedback />} />
          </Route>
        </Route>

         <Route element={<ProtectedRoute adminOnly={true} />}>
          <Route element={<Layout />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
