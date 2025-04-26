import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  sub?: string; // sub is optional, reflecting reality
}

function Welcome() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('jwt');
      if (token) {
        try {
          const decoded: TokenPayload = jwtDecode<TokenPayload>(token);
          const email = decoded.sub;
          if (email) {
            const response = await fetch(`http://localhost:8000/user?email=${encodeURIComponent(email)}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });

            console.log(response)
            if (!response.ok) {
              throw new Error('Failed to fetch user data');
            }
            const data = await response.json();
            setUsername(data.username);
          } else {
            // No email in token, treat as invalid
            setUsername(null);
          }
        } catch (error) {
          console.error('Error:', error);
          setUsername(null);
        }
      } else {
        setUsername(null);
      }
    };

    fetchUserData();
  }, []);

  return (
    <h1 className="text-3xl font-bold text-gray-800 mt-2">
      Welcome back, {username ? username : 'Guest'}!
    </h1>
  );
}

export default Welcome;