import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useLogin } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { AuthRequest } from '../../types/api';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState(''); // email
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login: loginContext } = useAuth(); // Get login function from context
  const { mutate: loginUser, isPending, error } = useLogin(); // Get mutation hook state

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const credentials: AuthRequest = { username, password };

    loginUser(credentials, {
      onSuccess: (data) => {
        loginContext(data.token); // Update global context and localStorage
        navigate('/'); // Redirect to home page on success
      },
      // onError is handled by the 'error' state from useLogin
    });
  };

  // Extract user-friendly error message
  const errorMessage = error?.message || (error as any)?.response?.data || 'Login failed. Please try again.';


  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
       {error && (
         <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
         </div>
       )}
      <Input
        label="Email"
        type="email"
        id="login-email"
        name="username" // Backend expects 'username' for email
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoComplete="username"
        disabled={isPending}
      />
      <Input
        label="Password"
        type="password"
        id="login-password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        disabled={isPending}
      />
      <Button
        type="submit"
        variant="primary"
        className="w-full mt-4"
        isLoading={isPending}
        disabled={isPending}
      >
        {isPending ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm;