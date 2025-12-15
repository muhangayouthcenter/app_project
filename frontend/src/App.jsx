import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layout.jsx';
import DefaultPage from './pages/default/index.jsx';
import Dashboard from './pages/dashboard/index.jsx';
import Login from './pages/login/Login.jsx';
import ProtectedRoute from './components/protected-route/ProtectedRoute.jsx';
import './App.css';
import RecordsData from './pages/display-recordbook-data/RecordsData.jsx';
import RecordBooks from './pages/dashboard/RecordBooks.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DefaultPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          >

            <Route path='/dashboard' element={<>Default page</>} />
            <Route path='/dashboard/recordbooks' element={<RecordBooks />} />
            <Route path='/dashboard/recordbook/:recordbook_name' element={< RecordsData />} />
            <Route path='*' element={<>Not Found</>} />

          </Route>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </Router>
  );
}