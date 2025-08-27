// Example usage of the ProSurf API hooks
// This file demonstrates how to use the custom TanStack Query hooks

import { useState } from 'react';
import { 
  useLogin, 
  useRegister, 
  useLogout,
  useUserProfile,
  useEventSessions,
  useEventSession,
  useUpcomingEventSessions,
  useEventSessionsByType
} from '@/shared/api';

// Authentication example
export const AuthExample = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { mutate: login, isPending: isLoggingIn, error: loginError } = useLogin();
  const { mutate: register, isPending: isRegistering, error: registerError } = useRegister();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { data: user, isLoading: isLoadingProfile } = useUserProfile();

  const handleLogin = () => {
    login({ email, password });
  };

  const handleRegister = () => {
    register({ email, password, name: 'John Doe' });
  };

  const handleLogout = () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      logout({ refreshToken });
    }
  };

  return (
    <div>
      <h2>Authentication Example</h2>
      
      {user ? (
        <div>
          <p>Welcome, {user.name || user.email}!</p>
          <button onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      ) : (
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button onClick={handleLogin} disabled={isLoggingIn}>
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </button>
          
          <button onClick={handleRegister} disabled={isRegistering}>
            {isRegistering ? 'Registering...' : 'Register'}
          </button>
          
          {loginError && <p>Login error: {loginError.message}</p>}
          {registerError && <p>Register error: {registerError.message}</p>}
        </div>
      )}
      
      {isLoadingProfile && <p>Loading profile...</p>}
    </div>
  );
};

// Event sessions example
export const EventSessionsExample = () => {
  const { 
    data: eventSessions, 
    isLoading, 
    error 
  } = useEventSessions({
    offset: 0,
    limit: 10,
    filters: {
      types: ['surfingTraining', 'tour'],
      minRemainingSeats: 1
    }
  });

  const { data: upcomingSessions } = useUpcomingEventSessions();
  const { data: surfingSessions } = useEventSessionsByType('surfingTraining');

  if (isLoading) return <p>Loading event sessions...</p>;
  if (error) return <p>Error loading sessions: {error.message}</p>;

  return (
    <div>
      <h2>Event Sessions Example</h2>
      
      <h3>All Sessions</h3>
      {eventSessions?.map((session) => (
        <div key={`${session.title}-${session.start}`}>
          <h4>{session.title}</h4>
          <p>Type: {session.type}</p>
          <p>Location: {session.location}</p>
          <p>Price: {session.price.amount} {session.price.currency}</p>
          <p>Remaining seats: {session.remainingSeats}</p>
          <p>Date: {new Date(session.start).toLocaleDateString()}</p>
        </div>
      ))}
      
      <h3>Upcoming Sessions ({upcomingSessions?.length || 0})</h3>
      <h3>Surfing Sessions ({surfingSessions?.length || 0})</h3>
    </div>
  );
};

// Single event session example
export const EventSessionDetailExample = ({ sessionId }: { sessionId: string }) => {
  const { data: session, isLoading, error } = useEventSession(sessionId);

  if (isLoading) return <p>Loading session details...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!session) return <p>Session not found</p>;

  return (
    <div>
      <h2>{session.title}</h2>
      <p><strong>Type:</strong> {session.type}</p>
      <p><strong>Location:</strong> {session.location}</p>
      <p><strong>Start:</strong> {new Date(session.start).toLocaleString()}</p>
      {session.end && (
        <p><strong>End:</strong> {new Date(session.end).toLocaleString()}</p>
      )}
      <p><strong>Price:</strong> {session.price.amount} {session.price.currency}</p>
      {session.bookingPrice && (
        <p><strong>Booking Price:</strong> {session.bookingPrice.amount} {session.bookingPrice.currency}</p>
      )}
      <p><strong>Capacity:</strong> {session.capacity}</p>
      <p><strong>Remaining Seats:</strong> {session.remainingSeats}</p>
      
      <h3>Description</h3>
      {session.description.map((desc, index) => (
        <div key={index}>
          <h4>{desc.heading}</h4>
          <p>{desc.body}</p>
        </div>
      ))}
    </div>
  );
};