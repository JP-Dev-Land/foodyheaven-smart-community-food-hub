import React, { useState } from 'react';
import { CreateUserRequest, availableRoles, AppRole } from '../../types/api';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';

interface UserCreateFormProps {
  onSubmit: (data: CreateUserRequest) => void;
  isSubmitting: boolean;
  error?: string | null;
}

const UserCreateForm: React.FC<UserCreateFormProps> = ({
  onSubmit,
  isSubmitting,
  error
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // Email
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roles, setRoles] = useState<Set<AppRole>>(new Set(['ROLE_USER'])); // Default to ROLE_USER
  const [enabled, setEnabled] = useState(true);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleRoleChange = (role: AppRole, isChecked: boolean) => {
    setRoles(prevRoles => {
      const newRoles = new Set(prevRoles);
      if (isChecked) {
        newRoles.add(role);
      } else {
         // Prevent removing the last role or ROLE_USER if it's the only one
         if (newRoles.size > 1 || role !== 'ROLE_USER') {
              newRoles.delete(role);
         }
         // Ensure ROLE_USER remains if set becomes empty after deletion
         if (newRoles.size === 0) {
             newRoles.add('ROLE_USER');
         }
      }
      return newRoles;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null); // Clear previous password error

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
       setPasswordError("Password must be at least 8 characters.");
       return;
    }
     if (roles.size === 0) {
        // This shouldn't happen due to logic in handleRoleChange, but as a safeguard
         alert("User must have at least one role (ROLE_USER recommended).");
         return;
     }

    const formData: CreateUserRequest = {
      name,
      username,
      password, // Send plain password, backend will hash
      roles: Array.from(roles),
      enabled,
    };
    onSubmit(formData);
  };

  // Combine potential API error with local validation errors
  const displayError = error || passwordError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
         <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {displayError}
         </div>
       )}
      <Input
        label="Full Name"
        id="create-user-name"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        disabled={isSubmitting}
        autoComplete="name"
      />
       <Input
        label="Email (Login Username)"
        id="create-user-username"
        name="username"
        type="email"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        disabled={isSubmitting}
        autoComplete="email"
      />
      <Input
        label="Initial Password"
        id="create-user-password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={isSubmitting}
        autoComplete="new-password"
        error={passwordError && passwordError.includes("characters") ? passwordError : undefined}
      />
      <Input
        label="Confirm Password"
        id="create-user-confirm-password"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        disabled={isSubmitting}
        autoComplete="new-password"
         error={passwordError && passwordError.includes("match") ? passwordError : undefined}
      />

      {/* Roles Selection */}
       <div className="my-4">
           <label className="block text-sm font-medium text-gray-700 mb-2">Assign Roles</label>
           <div className="grid grid-cols-2 gap-2"> {/* Layout roles */}
              {availableRoles.map(role => (
                  <Checkbox
                    key={role}
                    label={role.replace('ROLE_', '')}
                    id={`create-role-${role}`}
                    name="roles"
                    checked={roles.has(role)}
                    onChange={(e) => handleRoleChange(role, e.target.checked)}
                    disabled={isSubmitting || (role === 'ROLE_USER' && roles.size === 1 && roles.has('ROLE_USER'))}
                    wrapperClassName="mb-0" // No bottom margin needed here
                  />
              ))}
           </div>
       </div>

       {/* Enabled Status */}
       <Checkbox
          label="Enable Account Immediately"
          id="create-user-enabled"
          name="enabled"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          disabled={isSubmitting}
          wrapperClassName="my-4" // Add margin
      />

      <Button
        type="submit"
        variant="primary"
        className="w-full mt-6" // Add margin top
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating User...' : 'Create User'}
      </Button>
    </form>
  );
};

export default UserCreateForm;