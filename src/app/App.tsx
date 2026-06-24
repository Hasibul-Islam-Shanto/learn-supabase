import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '@/shared/layout/AppLayout';
import { useAuth } from '@/features/auth/context/auth-context';
import HomePage from '@/features/posts/pages/HomePage';
import PostPage from '@/features/posts/pages/PostPage';
import SearchPage from '@/features/search/pages/SearchPage';
import UsersPage from '@/features/users/pages/UsersPage';
import MessagesPage from '@/features/messages/pages/MessagesPage';
import ProfilePage from '@/features/profile/pages/ProfilePage';
import SignInPage from '@/features/auth/pages/SignInPage';
import SignUpPage from '@/features/auth/pages/SignUpPage';
import NotFoundPage from './NotFoundPage';

function ProfileRedirect() {
  const { session } = useAuth();
  const userId = session?.user.id;
  if (!userId) return <Navigate to="/signin" replace />;
  return <Navigate to={`/profile/${userId}`} replace />;
}

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
        <Route path="/search" element={<SearchPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/messages/:conversationId" element={<MessagesPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfileRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
