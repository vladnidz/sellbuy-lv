'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeliveryPicker } from '@/components/delivery-picker';

interface EscrowCheckoutProps {
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  currency: string;
  buyerId: string;
  sellerId: string;
  buyerName?: string;
  sellerName?: string;
  onPaymentSuccess?: (transactionId: string) => void;
  onClose?: () => void;
}

const PAYMENT_PROVIDERS = {
  montonio: 'Montonio',
  stripe: 'Stripe',
  paysera: 'Paysera',
  mock: 'Mock Payment'
};

export function EscrowCheckout({
  listingId,
  listingTitle,
  listingPrice,
  currency,
  buyerId,
  sellerId,
  buyerName = 'Pirētājs',
  sellerName = 'Pārdevējs',
  onPaymentSuccess,
  onClose
}: EscrowCheckoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('montonio');
  const [selectedLocker, setSelectedLocker] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const calculatePlatformFee = (amount: number): number => {
    // 3% platform fee capped at €15
    const fee = amount * 0.03;
    return Math.min(fee, 15);
  };

  const handleInitiateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          buyerId,
          sellerId,
          paymentMethod,
          lockerId: selectedLocker
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate checkout');
      }

      const { transaction } = await response.json();

      // Simulate payment processing for mock
      if (paymentMethod === 'mock') {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      setSuccess(true);
      onPaymentSuccess?.(transaction.id);
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Apmaksas veiksmīgi veikta</CardTitle>
          <CardDescription>Apmaksa tiks noraidīta uz escrow kontu un izsniegta pēc preces apstiprināšanas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Maksājuma veids</span>
            <Badge>{PAYMENT_PROVIDERS[paymentMethod as keyof typeof PAYMENT_PROVIDERS]}</Badge>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Pircējs</span>
            <span>{buyerName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Pārdevējs</span>
            <span>{sellerName}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Prece</span>
            <span>{listingTitle}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">Preces cena</span>
            <span className="font-semibold">
              {currency} {listingPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Platformas maksājums</span>
            <span className="font-semibold text-red-500">
              -{currency} {calculatePlatformFee(listingPrice).toFixed(2)}
            </span>
          </div>
          <Button
            className="w-full"
            onClick={() => router.push(`/listings/${listingId}`)}
          >
            Skatīt transakciju
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Apmaksa ar escrow</CardTitle>
        <CardDescription>
          {sellerName} prece: {listingTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="payment" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment">Apmaksa</TabsTrigger>
            <TabsTrigger value="delivery">Piegāde</TabsTrigger>
          </TabsList>

          <TabsContent value="payment">
            <form onSubmit={handleInitiateCheckout} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-method">Maksājuma veids</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid grid-cols-2 gap-4"
                >
                  {Object.entries(PAYMENT_PROVIDERS).map(([key, label]) => (
                    <div key={key} className="relative">
                      <RadioGroupItem value={key} id={`method-${key}`} className="peer sr-only" />
                      <label
                        htmlFor={`method-${key}`}
                        className="flex flex-col items-center justify-center rounded-lg border-2 p-4 cursor-pointer transition-colors hover:bg-muted peer-checked:border-primary peer-checked:bg-primary/10"
                      >
                        <span className="font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">
                          {key === 'montonio' && 'Montonio + Piegāde'}
                          {key === 'stripe' && 'Credit Card'}
                          {key === 'paysera' && 'Bank Transfer'}
                          {key === 'mock' && 'Demo'}
                        </span>
                      </label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Preces cena</span>
                <span className="font-semibold">
                  {currency} {listingPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Platformas maksājums (3%)</span>
                <span className="font-semibold text-red-500">
                  -{currency} {calculatePlatformFee(listingPrice).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-lg font-semibold">Kopā</span>
                <span className="text-xl font-bold">
                  {currency} {(listingPrice + calculatePlatformFee(listingPrice)).toFixed(2)}
                </span>
              </div>

              <div className="pt-4 space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Apstrādā...' : 'Maksāt un apstiprināt'}
                </Button>
                {onClose && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="w-full"
                  >
                    Atcelt
                  </Button>
                )}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Pirms maksāšanas pārliecinieties, ka prece ir pieejama.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="delivery">
            <div className="space-y-4 pt-2">
              <p className="text-xs text-muted-foreground">
                Izvēlieties piegādes pakomātu preces saņemšanai:
              </p>
              <DeliveryPicker
                selectedLockerId={selectedLocker}
                onSelect={(locker) => setSelectedLocker(locker.id)}
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
