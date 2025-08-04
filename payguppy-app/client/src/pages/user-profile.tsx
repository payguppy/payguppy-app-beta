import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Wallet as WalletIcon, Edit, CreditCard, ExternalLink, Clock } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useState, useEffect } from 'react';
import { useCreateUser, useFindUserByAuthWallet, useUpdateUser, useGetTxByUserId } from '@/api/payguppy-api';
import { useToast } from '@/hooks/use-toast';
import { formatEther } from 'viem';

export default function UserProfile() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [userCreated, setUserCreated] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    setUserCreated(false);
    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully",
    });
  };

  // Query to check if user exists by auth wallet
  const { data: existingUser, error: findUserError, isLoading: isCheckingUser, mutate: revalidateUser } = useFindUserByAuthWallet(
    address || '', 
    { 
      swr: { 
        enabled: !!address && isConnected,
        shouldRetryOnError: false,
        errorRetryCount: 0
      } 
    }
  );

  const { trigger: createUser, isMutating } = useCreateUser({
    swr: {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User profile created successfully",
        });
        setUserCreated(true);
      },
      onError: (error) => {
        console.error('Create user error:', error);
        toast({
          title: "Error", 
          description: "Failed to create user profile",
          variant: "destructive",
        });
      }
    }
  });

  const { trigger: updateUser, isMutating: isUpdating } = useUpdateUser(
    (existingUser?.data as any)?.id?.toString() || '', {
    swr: {
      onSuccess: async () => {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        setIsEditing(false);
        // Revalidate the user data to get the updated profile
        await revalidateUser();
      },
      onError: (error) => {
        console.error('Update user error:', error);
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
      }
    }
  });

  // Query user transactions
  const { data: userTransactions, isLoading: isLoadingTransactions, error: transactionsError } = useGetTxByUserId(
    (existingUser?.data as any)?.id || 0,
    {
      swr: {
        enabled: !!existingUser?.data && !!(existingUser?.data as any)?.id,
        shouldRetryOnError: false,
        errorRetryCount: 0
      }
    }
  );

  const handleSaveProfile = async () => {
    if (!(existingUser?.data as any)?.id) return;
    
    try {
      await updateUser({
        name: name.trim() || undefined,
        handle: handle.trim() || undefined
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  // Effect to create user when wallet connects and user is not found
  useEffect(() => {
    console.log('Effect triggered:', {
      isConnected,
      address: address?.substring(0, 10),
      userCreated,
      isCheckingUser,
      isMutating,
      findUserError: !!findUserError,
      existingUserData: !!existingUser?.data,
      existingUserStatus: existingUser?.status
    });

    if (isConnected && address && !userCreated && !isCheckingUser && !isMutating) {
      // Check if user lookup completed (either with data, error, or 404 status)
      const userLookupCompleted = existingUser !== undefined || findUserError;
      
      if (userLookupCompleted) {
        // Check if user exists (has data and successful status)
        const userExists = existingUser?.data && existingUser?.status === 200;
        
        if (userExists) {
          console.log('User found, marking as created');
          setUserCreated(true);
          const userData = existingUser.data as any;
          setName(userData?.name || '');
          setHandle(userData?.handle || '');
        } else {
          console.log('User not found (error or 404), creating user...');
          // User not found - create new user
          const handleCreateUser = async () => {
            try {
              await createUser({
                type: 'normal',
                auth_wallet: address
              });
            } catch (error) {
              console.error('Failed to create user:', error);
            }
          };

          handleCreateUser();
        }
      } else {
        console.log('Waiting for user lookup to complete...');
      }
    }
  }, [isConnected, address, userCreated, isCheckingUser, isMutating, findUserError, existingUser, createUser, name]);

  // Effect to sync local state with API data
  useEffect(() => {
    if (existingUser?.data && existingUser?.status === 200) {
      const userData = existingUser.data as any;
      setName(userData?.name || '');
      setHandle(userData?.handle || '');
    }
  }, [existingUser]);

  return (
    <div className="min-h-screen pb-20 px-4 py-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Profile Header - Only show when wallet is connected */}
        {isConnected && (
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback className="text-2xl">
                    <User className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center w-full">
                  {isEditing ? (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="handle">Handle</Label>
                        <Input
                          id="handle"
                          value={handle}
                          onChange={(e) => setHandle(e.target.value)}
                          placeholder="Enter your handle"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setIsEditing(false);
                            const userData = existingUser?.data as any;
                            setName(userData?.name || '');
                            setHandle(userData?.handle || '');
                          }}
                          className="flex-1"
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={handleSaveProfile}
                          className="flex-1"
                          disabled={isUpdating}
                        >
                          {isUpdating ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-2xl font-bold">
                        {(existingUser?.data as any)?.name || name || 'Anonymous User'}
                      </h1>
                      {((existingUser?.data as any)?.handle || handle) && (
                        <p className="text-muted-foreground mt-1">
                          @{(existingUser?.data as any)?.handle || handle}
                        </p>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditing(true)}
                        className="mt-3"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallet Connection */}
        <Card>
          <CardContent className="p-6">
            {isConnected ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Wallet Connected</p>
                    {isCheckingUser ? (
                      <Badge variant="outline" className="mt-1">
                        Checking Profile...
                      </Badge>
                    ) : isMutating ? (
                      <Badge variant="outline" className="mt-1">
                        Creating Profile...
                      </Badge>
                    ) : userCreated || existingUser?.data ? (
                      <Badge variant="secondary" className="mt-1">
                        Profile Ready
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="mt-1">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
                  <p className="text-sm font-mono break-all">{address}</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={handleDisconnect}
                  className="w-full"
                >
                  Disconnect Wallet
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <WalletIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">No Wallet Connected</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Connect your wallet to start using PayGuppy
                  </p>
                  <Button onClick={() => open()} className="w-full">
                    <WalletIcon className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History - Only show when wallet is connected and user exists */}
        {isConnected && existingUser?.data && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-semibold">Transaction History</h3>
              </div>
              
              {isLoadingTransactions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                  <span className="ml-2 text-sm text-muted-foreground">Loading transactions...</span>
                </div>
              ) : transactionsError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">Failed to load transactions</p>
                </div>
              ) : userTransactions?.data && Array.isArray(userTransactions.data) && userTransactions.data.length > 0 ? (
                <div className="space-y-3">
                  {userTransactions.data.map((tx: any, index: number) => (
                    <div key={tx.id || index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {tx.amount ? formatEther(BigInt(tx.amount)) : '0'} {tx.token || 'ETH'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.chain || 'lisk-sepolia'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          {tx.txHash && (
                            <a
                              href={`https://sepolia-blockscout.lisk.com/tx/${tx.txHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : 'Recent'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your payment history will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}