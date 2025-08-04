import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRScanner } from '@/components/qr-scanner';
import { ArrowLeft, QrCode } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useCreatePaymentChannel } from '@/api/payguppy-api';

export default function AddChannel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { trigger: createPaymentChannel, isMutating } = useCreatePaymentChannel({
    swr: {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Payment channel created successfully",
        });
        setLocation('/merchant');
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to create payment channel",
          variant: "destructive",
        });
      }
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    qr_text: '',
    blockchain: 'lisk'
  });
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.qr_text) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and scan a QR code",
        variant: "destructive",
      });
      return;
    }

    await createPaymentChannel({
      name: formData.name,
      qr_text: formData.qr_text,
      blockchains: [formData.blockchain],
      merchant_id: 1,
      tokens: ['LSK']
    });
  };

  const handleQRScan = (data: string) => {
    // Populate qr_text field with scanned data
    setFormData(prev => ({ ...prev, qr_text: data }));
    setShowQRScanner(false);
    toast({
      title: "QR Code Scanned",
      description: "QR code data has been populated successfully",
    });
  };

  return (
    <div className="px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <Link href="/merchant">
            <Button variant="ghost" size="sm" className="mb-4 text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Channels
            </Button>
          </Link>
          <h2 className="text-2xl font-bold">Add Payment Channel</h2>
          <p className="text-muted-foreground">Create a new channel to accept payments</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Channel Name */}
          <Card>
            <CardContent className="p-6">
              <Label htmlFor="name" className="text-sm font-medium">Channel Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Main Counter, Online Store"
                className="mt-2"
                required
              />
              <p className="text-xs text-muted-foreground mt-2">Give your payment channel a descriptive name</p>
            </CardContent>
          </Card>

          {/* QR Scanner */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-sm font-medium">QR Code Data</Label>
              <div className="mt-2 space-y-3">
                {formData.qr_text ? (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Scanned QR Data:</p>
                    <p className="font-mono text-xs break-all">{formData.qr_text}</p>
                  </div>
                ) : (
                  <div className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
                    <QrCode className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">No QR code scanned yet</p>
                  </div>
                )}
                <Button
                  type="button"
                  onClick={() => setShowQRScanner(true)}
                  className="w-full"
                  variant={formData.qr_text ? "outline" : "default"}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  {formData.qr_text ? 'Scan New QR Code' : 'Scan QR Code'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Scan a QR code to populate the payment channel data</p>
            </CardContent>
          </Card>

          {/* Blockchain Selection */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-sm font-medium">Blockchain</Label>
              <Select 
                value={formData.blockchain} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, blockchain: value }))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lisk">Lisk</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">Select the blockchain network for this payment channel</p>
            </CardContent>
          </Card>

          {/* Currency Selection */}
          {/* <Card>
            <CardContent className="p-6">
              <Label className="text-sm font-medium">Default Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card> */}

          {/* Advanced Settings */}
          {/* <Card>
            <CardContent className="p-6">
              <details open={showAdvanced} onToggle={(e) => setShowAdvanced(e.currentTarget.open)}>
                <summary className="font-medium cursor-pointer">Advanced Settings</summary>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label htmlFor="transactionFee" className="text-sm font-medium">Transaction Fee (%)</Label>
                    <Input
                      id="transactionFee"
                      type="number"
                      step="0.1"
                      value={formData.transactionFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, transactionFee: e.target.value }))}
                      placeholder="1.5"
                      className="mt-2"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="autoAccept"
                      checked={formData.autoAccept}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoAccept: checked as boolean }))}
                    />
                    <Label htmlFor="autoAccept" className="text-sm">Auto-accept payments</Label>
                  </div>
                </div>
              </details>
            </CardContent>
          </Card> */}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full py-4 text-lg font-semibold"
            disabled={isMutating}
          >
            {isMutating ? 'Creating...' : 'Create Payment Channel'}
          </Button>
        </form>

        <QRScanner
          isOpen={showQRScanner}
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      </div>
    </div>
  );
}
