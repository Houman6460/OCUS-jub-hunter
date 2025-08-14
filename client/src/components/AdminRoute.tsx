import { useLocation } from "wouter";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [, setLocation] = useLocation();
  // Check for admin authentication in localStorage
  const isAdmin = localStorage.getItem('admin_authenticated') === 'true';
  
  if (!isAdmin) {
    setLocation('/login');
    return null;
  }
  
  return <>{children}</>;
}
