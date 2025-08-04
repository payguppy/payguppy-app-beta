import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Filter, ExternalLink, CreditCard, DollarSign, QrCode } from 'lucide-react';
import { Link } from 'wouter';
import { useGetPaymentChannelsByMerchantId, useGetTxByPaymentChannelId } from '@/api/payguppy-api';
import QRCode from 'qrcode';
import { formatEther } from 'viem';

interface ApiPaymentChannel {
  id: string;
  name: string;
  qr_text: string;
  raw_code?: string;
  merchant_id: number;
  blockchains: string[];
  tokens: string[];
  wallet_id?: number;
  wallet?: {
    id: number;
    user_id?: any;
    addresses: any[];
    evmAddress?: string;
  };
}

export default function Merchant() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<ApiPaymentChannel | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [smallQrCodes, setSmallQrCodes] = useState<Record<string, string>>({});
  const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);

  // TODO: Get actual merchant ID from context/auth
  const merchantId = "1"; // Placeholder - replace with actual merchant ID
  
  const { data: paymentChannelsResponse, isLoading } = useGetPaymentChannelsByMerchantId(merchantId);

  const paymentChannelList = (paymentChannelsResponse?.data as unknown as ApiPaymentChannel[]) || [];

  // Get transactions for expanded channel
  const { data: channelTransactions, isLoading: isLoadingTransactions } = useGetTxByPaymentChannelId(
    expandedChannelId ? parseInt(expandedChannelId) : 0,
    {
      swr: {
        enabled: !!expandedChannelId,
        shouldRetryOnError: false,
        errorRetryCount: 0
      }
    }
  );

  const filteredChannels = paymentChannelList.filter(channel =>
    (channel.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    //  || channel.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Generate small QR codes for the list
  useEffect(() => {
    const generateSmallQrCodes = async () => {
      const qrCodes: Record<string, string> = {};
      
      for (const channel of paymentChannelList) {
        try {
          const qrData = channel.raw_code || channel.qr_text || 'No QR code available';
          const qrUrl = await QRCode.toDataURL(qrData, {
            width: 80,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          qrCodes[channel.id] = qrUrl;
        } catch (error) {
          console.error(`Error generating QR code for channel ${channel.id}:`, error);
        }
      }
      
      setSmallQrCodes(qrCodes);
    };

    if (paymentChannelList.length > 0) {
      generateSmallQrCodes();
    }
  }, [paymentChannelList]);

  const handleViewQR = async (channel: ApiPaymentChannel) => {
    setSelectedChannel(channel);
    
    try {
      const qrData = channel.raw_code || channel.qr_text || 'No QR code available';
      const qrUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setQrCodeUrl('');
    }
    
    setShowQRModal(true);
  };

  const handleCloseQR = () => {
    setShowQRModal(false);
    setSelectedChannel(null);
    setQrCodeUrl('');
  };

  const handleCardClick = (channel: ApiPaymentChannel, event: React.MouseEvent) => {
    // Prevent triggering when clicking the QR code area
    if ((event.target as HTMLElement).closest('.qr-code-area')) {
      return;
    }
    
    setExpandedChannelId(expandedChannelId === channel.id ? null : channel.id);
  };

  const calculateTotals = (transactions: any[]) => {
    if (!transactions || !Array.isArray(transactions)) return { totalETH: 0, totalUSD: 0 };
    
    const totalWei = transactions.reduce((sum, tx) => {
      const amount = tx.amount ? BigInt(tx.amount) : BigInt(0);
      return sum + amount;
    }, BigInt(0));
    
    const totalETH = parseFloat(formatEther(totalWei));
    const totalUSD = totalETH * 3500; // 1 ETH = $3500
    
    return { totalETH, totalUSD };
  };

  return (
    <div className="px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Payment Channels</h2>
          <Link href="/add-channel">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </Link>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search channels..."
                  className="pl-10"
                />
              </div>
              <Button size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Channels List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredChannels.map((channel) => {
              const isExpanded = expandedChannelId === channel.id;
              const transactions = isExpanded ? (channelTransactions?.data as any[]) || [] : [];
              const { totalETH, totalUSD } = calculateTotals(transactions);
              
              return (
                <Card key={channel.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6" onClick={(e) => handleCardClick(channel, e)}>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <QrCode className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold">{channel.name}</h3>
                        </div>
                        {channel.wallet?.evmAddress && (
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-mono break-all">
                              Wallet: {channel.wallet.evmAddress}
                            </p>
                            <a 
                              href={`https://sepolia-blockscout.lisk.com/address/${channel.wallet.evmAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                              See wallet in Explorer
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {smallQrCodes[channel.id] && (
                        <div 
                          className="qr-code-area cursor-pointer bg-white p-2 rounded-lg border shadow-sm hover:shadow-md transition-shadow"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewQR(channel);
                          }}
                        >
                          <img 
                            src={smallQrCodes[channel.id]} 
                            alt={`QR Code for ${channel.name}`}
                            className="w-16 h-16"
                          />
                        </div>
                      )}
                    </div>

                    {/* Expanded Transaction Details */}
                    {isExpanded && (
                      <div className="mt-6 pt-4 border-t">
                        <div className="flex items-center gap-2 mb-4">
                          <CreditCard className="h-4 w-4" />
                          <h4 className="font-medium">Transaction History</h4>
                        </div>
                        
                        {isLoadingTransactions ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                            <span className="ml-2 text-sm text-muted-foreground">Loading transactions...</span>
                          </div>
                        ) : transactions.length > 0 ? (
                          <>
                            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                              {transactions.map((tx: any, index: number) => (
                                <div key={tx.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="h-3 w-3 text-green-600" />
                                    <span className="font-medium">
                                      {tx.amount ? formatEther(BigInt(tx.amount)) : '0'} {tx.token || 'ETH'}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    {tx.txHash && (
                                      <a
                                        href={`https://sepolia-blockscout.lisk.com/tx/${tx.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Totals */}
                            <div className="border-t pt-3 space-y-2">
                              <div className="flex items-center justify-between text-sm font-medium">
                                <span className="flex items-center gap-1">
                                  <CreditCard className="h-4 w-4" />
                                  Total ETH:
                                </span>
                                <span>{totalETH.toFixed(6)} ETH</span>
                              </div>
                              <div className="flex items-center justify-between text-sm font-medium text-green-600">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  Total USD:
                                </span>
                                <span>${totalUSD.toFixed(5)}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <CreditCard className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No transactions yet</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredChannels.length === 0 && !isLoading && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No payment channels found</p>
              <Link href="/add-channel">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Channel
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* QR Code Modal */}
        <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                QR Code - {selectedChannel?.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseQR}
                >
                  {/* <X className="h-4 w-4" /> */}
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center">
              <div className="mb-4 flex justify-center">
                {qrCodeUrl ? (
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <img 
                      src={qrCodeUrl} 
                      alt={`QR Code for ${selectedChannel?.name}`}
                      className="w-64 h-64"
                    />
                  </div>
                ) : (
                  <div className="bg-muted p-8 rounded-lg border-2 border-dashed w-64 h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">Loading QR code...</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Scan this QR code to make a payment to this channel
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
