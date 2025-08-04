import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRScanner } from '@/components/qr-scanner';
import { useLocation } from 'wouter';
import QrScanner from 'qr-scanner';
import { Camera, CameraOff, ExternalLink } from 'lucide-react';
import { useGetPaymentChannelsByQr } from '@/api/payguppy-api';

interface PaymentChannelInfo {
  id: number;
  name: string;
  raw_code: string;
  type: number;
  merchant_id: number;
  blockchains: string[];
  tokens: string[];
  wallet_id?: any;
  merchant: {
    id: number;
    name: string;
    owner_id: number;
    owner: {
      id: number;
      name: string;
      handle?: any;
    };
  };
  wallet?: {
    id: number;
    user_id?: any;
    addresses: any[];
    evmAddress?: string;
  };
}

export default function Scanner() {
  const [, setLocation] = useLocation();
  const [showScanner, setShowScanner] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedQrText, setScannedQrText] = useState<string | null>(null);
  const [paymentChannelInfo, setPaymentChannelInfo] = useState<PaymentChannelInfo | null>(null);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  // Query payment channel by QR text
  const { data: paymentChannelResponse, isLoading: isLoadingChannel } = useGetPaymentChannelsByQr(
    scannedQrText || '',
    { swr: { enabled: !!scannedQrText } }
  );

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      initializeCamera();
    }, 100);
    
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  // Handle payment channel response
  useEffect(() => {
    if (paymentChannelResponse?.data) {
      setPaymentChannelInfo(paymentChannelResponse.data as PaymentChannelInfo);
      setShowPaymentInfo(true);
      stopCamera();
    }
  }, [paymentChannelResponse]);

  const initializeCamera = async () => {
    if (!videoRef.current) {
      console.log('Video ref not available');
      return;
    }

    try {
      setCameraError(null);
      console.log('Initializing camera...');
      
      // Check if camera is available
      const hasCamera = await QrScanner.hasCamera();
      console.log('Has camera:', hasCamera);
      
      if (!hasCamera) {
        setCameraError('No camera available');
        return;
      }

      // Create QR scanner instance
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data);
          handleQRScan(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
          returnDetailedScanResult: true,
        }
      );

      console.log('Starting QR scanner...');
      // Start the scanner
      await qrScannerRef.current.start();
      console.log('QR scanner started successfully');
      setCameraActive(true);
      
    } catch (error) {
      console.error('Error initializing camera:', error);
      
      // Fallback: Try direct camera access
      try {
        console.log('Attempting fallback camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
          console.log('Fallback camera stream started');
        }
      } catch (fallbackError) {
        console.error('Fallback camera access failed:', fallbackError);
        
        let errorMessage = 'Camera access failed';
        if (fallbackError instanceof Error) {
          if (fallbackError.name === 'NotAllowedError') {
            errorMessage = 'Camera permission denied. Please allow camera access and refresh.';
          } else if (fallbackError.name === 'NotSecureError' || fallbackError.message.includes('secure')) {
            errorMessage = 'Camera requires HTTPS. Please use https://localhost:5173 or allow insecure localhost.';
          } else {
            errorMessage = `Camera error: ${fallbackError.message}`;
          }
        }
        
        // Check if we're not on HTTPS
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
          errorMessage = 'Camera access requires HTTPS. Please use https:// or localhost.';
        }
        
        setCameraError(errorMessage);
        setCameraActive(false);
      }
    }
  };

  const stopCamera = () => {
    // Stop QR scanner if active
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    
    // Stop direct media stream if active
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
    console.log('Camera stopped');
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      initializeCamera();
    }
  };

  const handleQRScan = (data: string) => {
    console.log('QR Code scanned:', data);
    setScannedQrText(data);
    // The API query will be triggered by the useEffect above
  };

  const handleManualEntry = () => {
    if (manualInput.trim()) {
      setScannedQrText(manualInput);
    }
  };


  console.log({
    cameraActive,
    cameraError
  })

  return (
    <div className="px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Scan QR Code</h2>
          <p className="text-muted-foreground">Point your camera at the merchant's QR code</p>
        </div>

        {/* Payment Channel Information */}
        {showPaymentInfo && paymentChannelInfo && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-green-600 mb-2">✓ Payment Channel Found</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">{paymentChannelInfo.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Merchant: {paymentChannelInfo.merchant.name}
                  </p>
                </div>

                {paymentChannelInfo.wallet?.evmAddress && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-mono break-all">
                      Wallet: {paymentChannelInfo.wallet.evmAddress}
                    </p>
                    <a 
                      href={`https://sepolia-blockscout.lisk.com/address/${paymentChannelInfo.wallet.evmAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      See wallet in Explorer
                    </a>
                  </div>
                )}

                {/* <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Blockchains</p>
                    <div className="flex flex-wrap gap-1">
                      {paymentChannelInfo.blockchains.map((blockchain, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {blockchain}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tokens</p>
                    <div className="flex flex-wrap gap-1">
                      {paymentChannelInfo.tokens.map((token, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>
                </div> */}

                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => {
                      // Store payment channel data for payment page
                      sessionStorage.setItem('paymentChannelData', JSON.stringify(paymentChannelInfo));
                      setLocation('/payment');
                    }}
                    className="flex-1"
                  >
                    Proceed to Payment
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowPaymentInfo(false);
                      setPaymentChannelInfo(null);
                      setScannedQrText(null);
                      initializeCamera();
                    }}
                  >
                    Scan Another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoadingChannel && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Looking up payment channel...</p>
            </CardContent>
          </Card>
        )}

        {/* Camera Stream */}
        {!showPaymentInfo && (
        <div className="bg-black rounded-2xl overflow-hidden mb-6 relative">
          <video
            ref={videoRef}
            className="w-full h-80 object-cover"
            autoPlay
            muted
            playsInline
            // style={{ display: cameraActive ? 'block' : 'none' }}
          />
          
          {(!cameraActive || cameraError) && (
            <div className="w-full h-80 bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                {cameraError ? (
                  <>
                    <CameraOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-red-400 mb-2">{cameraError}</p>
                    {(location.protocol !== 'https:' && location.hostname !== 'localhost') && (
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-3 text-yellow-200 text-sm">
                        <p className="font-medium mb-1">For camera access:</p>
                        <p>• Use https://localhost:5173</p>
                        <p>• Or enable "Insecure origins treated as secure" in Chrome</p>
                      </div>
                    )}
                    <Button onClick={initializeCamera} variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Retry Camera
                    </Button>
                  </>
                ) : (
                  <>
                    <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="mb-4">Camera loading...</p>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Camera Toggle Button */}
          <div className="absolute top-4 right-4">
            <Button
              onClick={toggleCamera}
              variant="outline"
              size="sm"
              className="bg-black/50 hover:bg-black/70 text-white border-white/20"
            >
              {cameraActive ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Scanning Frame Overlay */}
          {cameraActive && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-white/30 rounded-2xl relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Manual Entry */}
        {!showPaymentInfo && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Can't scan? Enter manually</h3>
            <div className="space-y-4">
              <Input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Paste payment code here..."
              />
              <Button onClick={handleManualEntry} className="w-full">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Demo Button */}
        {/* <Button 
          onClick={handleDemoPayment}
          variant="outline" 
          className="w-full"
        >
          Try Demo Payment
        </Button> */}

        <QRScanner
          isOpen={showScanner}
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      </div>
    </div>
  );
}
