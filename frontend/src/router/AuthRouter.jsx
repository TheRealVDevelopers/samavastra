import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import ForgetPassword from '@/pages/ForgetPassword';
import ResetPassword from '@/pages/ResetPassword';
import Setup from '@/pages/Setup';

import { useDispatch } from 'react-redux';

export default function AuthRouter() {
  const dispatch = useDispatch();

  return (
    <Routes>
      <Route element={<LandingPage />} path="/" />
      <Route element={<Login />} path="/login" />
      <Route element={<Navigate to="/login" replace />} path="/logout" />
      <Route element={<ForgetPassword />} path="/forgetpassword" />
      <Route element={<ResetPassword />} path="/resetpassword/:userId/:resetToken" />
      <Route element={<Setup />} path="/setup" />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
