import { useEffect, useState } from 'react';
import AuthStack from './AuthStack';
import AppStack from './AppStack';
import { getToken } from '../services/token.service';

export default function RootNavigator() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const token = await getToken();
      if (token) setIsAuthenticated(true);
      setLoading(false);
    };
    checkSession();
  }, []);

  if (loading) return null;

  return isAuthenticated ? <AppStack /> : <AuthStack />;
}