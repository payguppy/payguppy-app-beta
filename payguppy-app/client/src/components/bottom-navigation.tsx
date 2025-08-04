import { Link, useLocation } from 'wouter';
import { Home, QrCode, Store, User } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useFindUserByAuthWallet } from '@/api/payguppy-api';

export function BottomNavigation() {
  const [location] = useLocation();
  const { address, isConnected } = useAccount();
  
  // Get user data to check user type
  const { data: userData } = useFindUserByAuthWallet(
    address || '', 
    { 
      swr: { 
        enabled: !!address && isConnected 
      } 
    }
  );

  // Check if user is a merchant
  const isMerchant = userData?.data?.type === 'merchant';

  const baseNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/scanner', icon: QrCode, label: 'Scan' },
    { path: '/user-profile', icon: User, label: 'Profile' },
  ];

  const merchantNavItem = { path: '/merchant', icon: Store, label: 'Merchant' };

  // Add merchant item only if user is a merchant
  const navItems = isMerchant 
    ? [baseNavItems[0], baseNavItems[1], merchantNavItem, baseNavItems[2]]
    : baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-card border-t border-border px-4 py-2 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Link key={path} href={path}>
            <div className={`nav-btn flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
              location === path ? 'active' : 'text-muted-foreground hover:text-foreground'
            }`}>
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
