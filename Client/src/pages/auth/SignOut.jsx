import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { sessionLogout } from '../../api/auth';
import { useNavigate } from 'react-router-dom';

export default function SignOut() {
  const navigate = useNavigate();
  useEffect(() => {
    async function doSignOut() {
      try {
        await sessionLogout();
      } catch (err) {
        console.warn('sessionLogout failed', err);
      }
      try {
        await signOut(auth);
      } catch (err) {
        console.error(err);
      } finally {
        navigate('/signin');
      }
    }
    doSignOut();
  }, [navigate]);

  return <div className="p-4">Signing out...</div>;
}
