import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuthGuard = () => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      router.push('/home');
    }
  }, [router]);
};