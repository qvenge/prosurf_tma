import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui/button';
import { useLogin } from '@/shared/api';

import styles from './LoginPage.module.scss';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    login(
      { email, password },
      {
        onSuccess: () => {
          navigate('/', { replace: true });
        },
        onError: (error: unknown) => {
          if (error && typeof error === 'object' && 'type' in error) {
            if (error.type === 'auth') {
              setErrorMessage('Invalid email or password');
            } else if (error.type === 'rate-limit') {
              setErrorMessage('Too many login attempts. Please try again later.');
            } else {
              setErrorMessage((error as { message?: string }).message || 'Login failed. Please try again.');
            }
          } else {
            setErrorMessage('Login failed. Please try again.');
          }
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        <h1 className={styles.title}>Login</h1>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="Enter your password"
            />
          </div>

          {errorMessage && (
            <div className={styles.error}>{errorMessage}</div>
          )}

          <Button
            type="submit"
            stretched
            loading={isPending}
            disabled={!email || !password}
          >
            Login
          </Button>
        </form>
      </div>
    </div>
  );
};