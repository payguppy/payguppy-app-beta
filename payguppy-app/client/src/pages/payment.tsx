import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AmountInput } from '@/components/amount-input';
import { Store, Wallet, ExternalLink, AlertTriangle } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { parseEther } from 'viem';
import { useFindUserByAuthWallet, useSubmitTx } from '@/api/payguppy-api';

interface PaymentChannelData {
  id: number;
  name: string;
  merchant: {
    name: string;
    owner: {
      name: string;
    };
  };
  wallet?: {
    evmAddress?: string;
  };
}

// Lisk Sepolia testnet chain ID
const LISK_SEPOLIA_CHAIN_ID = 4202;

export default function Payment() {
  const [, setLocation] = useLocation();
  const { address, isConnected } = useAccount();
  const { open } = useAppKit();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const [paymentChannelData, setPaymentChannelData] = useState<PaymentChannelData | null>(null);
  const [ethAmount, setEthAmount] = useState('0.0015');

  // Get current user data
  const { data: currentUser } = useFindUserByAuthWallet(
    address || '', 
    { 
      swr: { 
        enabled: !!address && isConnected,
        shouldRetryOnError: false,
        errorRetryCount: 0
      } 
    }
  );

  // Submit transaction API hook
  const { trigger: submitTransaction } = useSubmitTx();
  
  const { 
    sendTransaction, 
    data: txHash, 
    error: sendError, 
    isPending: isSending 
  } = useSendTransaction();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: confirmError 
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const isOnLiskSepolia = chainId === LISK_SEPOLIA_CHAIN_ID;

  useEffect(() => {
    // Try to get payment channel data from scanner
    const scannerData = sessionStorage.getItem('paymentChannelData');
    if (scannerData) {
      const parsed = JSON.parse(scannerData);
      setPaymentChannelData(parsed);
      
      // Check if there's a preset amount from scanner
      if (parsed.amount) {
        setEthAmount(parsed.amount);
      }
    } else {
      // Fallback to old payment data structure for backwards compatibility
      const data = sessionStorage.getItem('paymentData');
      if (data) {
        const parsed = JSON.parse(data);
        // Convert old structure to new structure
        setPaymentChannelData({
          id: Date.now(),
          name: 'Legacy Payment',
          merchant: {
            name: parsed.merchantName || 'Unknown Merchant',
            owner: {
              name: 'Unknown'
            }
          }
        });
        
        // Check if there's a preset amount from old data
        if (parsed.amount && parsed.amount !== '0') {
          setEthAmount(parsed.amount);
        }
      } else {
        setLocation('/scanner');
      }
    }
  }, [setLocation]);

  const handleSwitchToLiskSepolia = async () => {
    try {
      await switchChain({ chainId: LISK_SEPOLIA_CHAIN_ID });
    } catch (error) {
      console.error('Failed to switch to Lisk Sepolia:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to switch network';
      alert(`Failed to switch to Lisk Sepolia: ${errorMessage}`);
    }
  };

  const handlePayment = async () => {
    if (!isConnected || !address || !paymentChannelData?.wallet?.evmAddress) {
      alert('Please connect your wallet and ensure payment channel has a valid address.');
      return;
    }

    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      alert('Please enter a valid ETH amount.');
      return;
    }

    try {
      // Send transaction using wagmi
      sendTransaction({
        to: paymentChannelData.wallet.evmAddress as `0x${string}`,
        value: parseEther(ethAmount),
        gas: 21000n, // Standard ETH transfer gas limit
      });

    } catch (error) {
      console.error('Transaction failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Transaction failed: ${errorMessage}`);
    }
  };

  // Handle calling create tx API when transaction hash is available
  useEffect(() => {
    if (txHash && currentUser?.data && paymentChannelData) {
      const callCreateTxAPI = async () => {
        try {
          const transactionData = {
            sender_id: (currentUser.data as any).id,
            payment_channel_id: paymentChannelData.id,
            txHash: txHash,
            chain: 'lisk-sepolia',
            token: 'ETH',
            amount: parseEther(ethAmount).toString()
          };
          
          console.log('Submitting transaction data:', transactionData);
          
          await submitTransaction(transactionData);
          console.log('Transaction record created successfully');
          
          // Only navigate after successful API call
          setLocation('/user-profile');
        } catch (apiError) {
          console.error('Failed to create transaction record:', apiError);
          alert('Transaction sent but failed to record. Please check your transaction history.');
          // Still navigate on API error so user isn't stuck
          setLocation('/user-profile');
        }
      };
      
      callCreateTxAPI();
    }
  }, [txHash, currentUser, paymentChannelData, ethAmount, submitTransaction, setLocation]);

  // Handle transaction errors
  useEffect(() => {
    if (sendError) {
      console.error('Send error:', sendError);
      alert(`Transaction failed: ${sendError.message}`);
    }
    if (confirmError) {
      console.error('Confirmation error:', confirmError);
      alert(`Transaction confirmation failed: ${confirmError.message}`);
    }
  }, [sendError, confirmError]);

  if (!paymentChannelData) {
    return (
      <div className="flex items-center justify-center min-h-screen pb-20">
        <p>Loading payment data...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">
        {/* Payment Channel Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">{paymentChannelData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Merchant: {paymentChannelData.merchant.name}
                </p>
              </div>
            </div>
            
            {paymentChannelData.wallet?.evmAddress && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-mono break-all">
                  To: {paymentChannelData.wallet.evmAddress}
                </p>
                <a 
                  href={`https://sepolia-blockscout.lisk.com/address/${paymentChannelData.wallet.evmAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on Explorer
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wallet Connection */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Wallet Connection</h3>
            {!isConnected ? (
              <Button onClick={() => open()} className="w-full" variant="outline">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600">
                  <Wallet className="h-4 w-4" />
                  <span className="text-sm font-medium">Wallet Connected</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {address}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ETH Amount Input */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <AmountInput
              value={ethAmount}
              onChange={setEthAmount}
              currency="ETH"
            />
          </CardContent>
        </Card>

        {/* Transaction Status */}
        {txHash && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2 text-green-600">
                {isConfirmed ? 'Transaction Confirmed' : 'Transaction Sent'}
              </h3>
              <p className="text-xs text-muted-foreground font-mono break-all mb-2">
                {txHash}
              </p>
              <a 
                href={`https://sepolia-blockscout.lisk.com/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View Transaction
              </a>
              {isConfirming && (
                <div className="flex items-center gap-2 mt-2 text-orange-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-600"></div>
                  <span className="text-xs">Waiting for confirmation...</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}


        {/* Pay Button */}
        <Button 
          onClick={handlePayment} 
          className="w-full py-4 text-lg font-semibold"
          disabled={!isConnected || !paymentChannelData.wallet?.evmAddress || isSending || isConfirming || parseFloat(ethAmount) <= 0}
        >
          {isSending ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending Transaction...
            </div>
          ) : isConfirming ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Confirming...
            </div>
          ) : (
            `Send ${ethAmount} ETH`
          )}
        </Button>

        {/* Back Button */}
        <Button 
          onClick={() => setLocation('/user-profile')}
          variant="outline"
          className="w-full mt-4"
        >
          Back to Profile
        </Button>
      </div>
    </div>
  );
}
