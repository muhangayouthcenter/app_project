import { Navigate, useOutletContext } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const context = useOutletContext();
  const { authToken } = context || {};
  console.log('ProtectedRoute authToken:', authToken);
  if (!authToken) {
    return <Navigate to="/" replace />;
  }
  return children;
}
