import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layout.jsx';
import DefaultPage from './pages/default/index.jsx';
import Dashboard from './pages/dashboard/index.jsx';
import Login from './pages/login/Login.jsx';
import ProtectedRoute from './components/protected-route/ProtectedRoute.jsx';
import './App.css';
import RecordsData from './pages/display-recordbook-data/RecordsData.jsx';
import RecordBooks from './pages/dashboard/RecordBooks.jsx';
import Reports from './pages/dashboard/Reports.jsx';
import ReportResults from './pages/dashboard/ReportResults.jsx';
import Emails from './pages/dashboard/Emails.jsx';
import CreateRecordBook from './pages/dashboard/CreateRecordBook.jsx';
import SearchResults from './pages/dashboard/SearchResults.jsx';

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
            <Route path='/dashboard/recordbooks/create' element={<CreateRecordBook />} />
            <Route path='/dashboard/recordbook/:recordbook_name' element={< RecordsData />} />
            <Route path='/dashboard/reports' element={<Reports />} />
            <Route path='/dashboard/reports/results' element={<ReportResults />} />
            <Route path='/dashboard/emails-linkage' element={<Emails />} />
            <Route path='/dashboard/search' element={<SearchResults />} />
            <Route path='*' element={<>Not Found</>} />

          </Route>
          <Route path="/login" element={<Login />} />
        </Route>
      </Routes>
    </Router>
  );
}