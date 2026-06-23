import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import { currentUser } from './data/mock';
import { useAuth } from './context/auth-context';

function App() {
  const { session, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return (
    <Routes>
      <Route
        path="/signin"
        element={session ? <Navigate to="/" replace /> : <SignInPage />}
      />
      <Route
        path="/signup"
        element={session ? <Navigate to="/" replace /> : <SignUpPage />}
      />
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/:id" element={<PostPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route
          path="/profile"
          element={<Navigate to={`/profile/${currentUser.id}`} replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
