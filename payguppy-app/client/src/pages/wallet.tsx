import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Wallet as WalletIcon } from 'lucide-react';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useToast } from '@/hooks/use-toast';
import { useWalletControllerFindAll, useCreateWallet } from '@/api/payguppy-api';

interface ApiWallet {
  id: string;
  seed: string;
  user_id?: number;
  payment_channel_id?: number;
  // Additional fields that might be returned by the API
  address?: string;
  network?: string;
  balance?: string;
}

export default function Wallet() {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWallet, setNewWallet] = useState({
    seed: ''
  });

  // Use real API calls
  const { data: walletsResponse, isLoading } = useWalletControllerFindAll();
  const { trigger: createWallet, isMutating } = useCreateWallet({
    swr: {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Wallet created successfully",
        });
        setShowCreateModal(false);
        setNewWallet({ seed: '' });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create wallet",
          variant: "destructive",
        });
      }
    }
  });

  const walletList = (walletsResponse?.data as unknown as ApiWallet[]) || [];
  
  // Transform API data to display format with fallback values
  const displayWallets = walletList.map(wallet => ({
    ...wallet,
    name: `Wallet ${String(wallet.id || 'Unknown').substring(0, 8)}`,
    address: wallet.address || (wallet.seed ? String(wallet.seed).substring(0, 20) + '...' : 'No address'),
    network: wallet.network || 'Ethereum',
    isConnected: false,
    balance: wallet.balance || '0.00'
  }));

  const handleCreateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWallet.seed) {
      toast({
        title: "Error",
        description: "Please enter a wallet seed",
        variant: "destructive",
      });
      return;
    }

    await createWallet({
      seed: newWallet.seed,
      user_id: 1 // TODO: Get from auth context
    });
  };



  return (
    <div className="px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">My Wallets</h2>
          <div className="flex space-x-2">
            {!isConnected && (
              <Button 
                size="sm" 
                variant="default"
                onClick={() => open()}
              >
                <WalletIcon className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button size="sm" variant={isConnected ? "default" : "outline"}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Wallet</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateWallet} className="space-y-4">
                  <div>
                    <Label htmlFor="walletSeed">Wallet Seed</Label>
                    <Input
                      id="walletSeed"
                      value={newWallet.seed}
                      onChange={(e) => setNewWallet(prev => ({ ...prev, seed: e.target.value }))}
                      placeholder="Enter wallet seed phrase or private key"
                      className="mt-2"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter your wallet seed phrase or private key</p>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={isMutating}
                    >
                      {isMutating ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Wallet Connection Status */}
        {isConnected && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Wallet Connected</p>
                    <p className="text-sm text-muted-foreground">{address}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wallets List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayWallets.map((wallet) => (
              <Card key={wallet.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <WalletIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{wallet.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {wallet.address}
                        </p>
                      </div>
                    </div>
                    <Badge variant={wallet.isConnected ? "default" : "secondary"}>
                      {wallet.isConnected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Balance</p>
                      <p className="font-medium">${wallet.balance}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Network</p>
                      <p className="font-medium">{wallet.network}</p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    {wallet.isConnected ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          View Details
                        </Button>
                        <Button size="sm" className="flex-1">
                          Send
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => open()}
                        >
                          Connect
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          Remove
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Web3 Connectors */}
        {!isConnected && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Connect Wallet</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => open()}
                >
                  <WalletIcon className="h-4 w-4 mr-2" />
                  Connect with Reown
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}