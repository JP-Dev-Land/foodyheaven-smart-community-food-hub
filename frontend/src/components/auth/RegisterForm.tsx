import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useRegister } from '../../services/authService';
import { RegisterRequest } from '../../types/api';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // Email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null); // For password mismatch etc.

  const navigate = useNavigate();
  const { mutate: registerUser, isPending, error: apiError } = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous form errors

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    const userData: RegisterRequest = { name, username, password };

    registerUser(userData, {
      onSuccess: (message) => {
        console.log('Registration Success:', message);
        alert('Registration successful! Please log in.'); // TODO: replace with better UI feedback
        navigate('/login'); // Redirect to login on success
      },
      onError: () => {
         // Error message is derived from apiError state below
      }
    });
  };

   // Extract user-friendly error message (e.g., "Username is already taken")
   const errorMessage = formError || apiError?.message || (apiError as any)?.response?.data || 'Registration failed. Please try again.';

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
       {(formError || apiError) && (
         <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
         </div>
       )}
      <Input
        label="Full Name"
        type="text"
        id="register-name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoComplete="name"
        disabled={isPending}
      />
      <Input
        label="Email"
        type="email"
        id="register-email"
        name="username" // Backend expects 'username' for email
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        autoComplete="email"
        disabled={isPending}
      />
      <Input
        label="Password"
        type="password"
        id="register-password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="new-password"
        disabled={isPending}
      />
      <Input
        label="Confirm Password"
        type="password"
        id="register-confirm-password"
        name="confirmPassword"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        autoComplete="new-password"
        disabled={isPending}
        error={formError && formError.includes("Passwords do not match") ? formError : undefined} // Show specific error on this field
      />
      <Button
        type="submit"
        variant="primary"
        className="w-full mt-4"
        isLoading={isPending}
        disabled={isPending}
      >
        {isPending ? 'Registering...' : 'Register'}
      </Button>
    </form>
  );
};

export default RegisterForm;