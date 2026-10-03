import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { fetchApi } from '@/lib/api';
import { 
  CheckCircle, 
  MapPin, 
  CreditCard, 
  Wallet,
  ChevronRight,
  ShoppingCart,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button, Input, PriceDisplay, EmptyState } from '@/components/ui';

type CheckoutStep = 'address' | 'payment' | 'success';

interface AddressData {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

export function CheckoutPage() {
  const { cart, cartTotal, refreshCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>('address');
  
  // Address State
  const [address, setAddress] = useState<AddressData>({
    fullName: '',
    phone: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'COD'>('CARD');
  
  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Synchronous guard: `isSubmitting` state is still false within the same
  // tick, so a double-click would otherwise place two orders.
  const submittingRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Validate cart on mount
  useEffect(() => {
    if (cart && cart.items.length === 0 && step !== 'success') {
      navigate('/cart');
    }
  }, [cart, navigate, step]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (submittingRef.current) return; // Guard against double submits

    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);
    
    // Format full address for backend
    const shippingAddress = `${address.fullName}\n${address.phone}\n${address.addressLine}\n${address.city}, ${address.state} ${address.pincode}`;
    
    try {
      // Small simulated delay for payment UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await fetchApi<{ id: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress,
          paymentMethod
        })
      });

      if (res.error) throw new Error(res.error);
      
      if (res.data) {
        setOrderId(res.data.id);
        setStep('success');
        refreshCart(); // The backend cleared the cart, this updates frontend state
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-20 px-4">
        <div className="max-w-md w-full bg-card rounded-2xl border border-border p-8 text-center shadow-lg">
          <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for shopping with TECHNOVA. Your order has been placed successfully.
          </p>
          {orderId && (
            <div className="bg-muted/50 rounded-xl p-4 mb-8 border border-border">
              <span className="text-sm text-muted-foreground block mb-1">Order ID</span>
              <span className="font-mono font-bold text-foreground tracking-wider">{orderId}</span>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Button size="xl" fullWidth onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
            <Button size="xl" variant="outline" fullWidth onClick={() => navigate('/account')}>
              View Order Details
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <EmptyState 
          variant="cart" 
          title="Your cart is empty" 
          description="You cannot proceed to checkout with an empty cart." 
          actionLabel="Go back" 
          actionHref="/cart" 
        />
      </div>
    );
  }

  // Calculate order metrics
  const originalTotal = cart.items.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0);
  const totalDiscount = originalTotal - cartTotal;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Checkout Header */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
            
            {/* Steps indicator */}
            <div className="hidden sm:flex items-center gap-4 text-sm font-medium">
              <div className={`flex items-center gap-2 ${step === 'address' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'address' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
                Shipping
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
                Payment
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content Area */}
          <div className="flex-1 max-w-3xl">
            
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {step === 'address' ? (
              <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 text-primary rounded-lg">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">Shipping Address</h2>
                </div>

                <form onSubmit={handleAddressSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input name="fullName" value={address.fullName} onChange={handleAddressChange} required placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <Input name="phone" value={address.phone} onChange={handleAddressChange} required placeholder="+91 9876543210" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address Line</label>
                    <Input name="addressLine" value={address.addressLine} onChange={handleAddressChange} required placeholder="123 Tech Street, Apartment 4B" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input name="city" value={address.city} onChange={handleAddressChange} required placeholder="Bangalore" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State</label>
                      <Input name="state" value={address.state} onChange={handleAddressChange} required placeholder="Karnataka" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">PIN Code</label>
                      <Input name="pincode" value={address.pincode} onChange={handleAddressChange} required placeholder="560001" />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/cart')}>Back to Cart</Button>
                    <Button type="submit" className="flex-1">Continue to Payment</Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Address Summary */}
                <div className="bg-card border border-border rounded-2xl p-6 flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Deliver To</h3>
                    <p className="font-medium text-foreground">{address.fullName} <span className="text-muted-foreground ml-2">{address.phone}</span></p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {address.addressLine}, {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setStep('address')}>Change</Button>
                </div>

                {/* Payment Methods */}
                <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold">Payment Method</h2>
                  </div>
                  
                  <div className="bg-muted/50 text-muted-foreground text-sm p-4 rounded-xl mb-6 border border-border">
                    <AlertCircle className="w-4 h-4 inline mr-2 -mt-0.5" />
                    This is a simulated environment. No actual payment will be processed.
                  </div>

                  <div className="space-y-4">
                    {/* Card Option */}
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'CARD' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="CARD"
                        checked={paymentMethod === 'CARD'}
                        onChange={() => setPaymentMethod('CARD')}
                        className="w-5 h-5 text-primary accent-primary"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <CreditCard className="w-4 h-4" /> Credit / Debit Card
                        </h4>
                        <p className="text-sm text-muted-foreground">Simulate a card payment</p>
                      </div>
                    </label>

                    {/* UPI Option */}
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="UPI"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                        className="w-5 h-5 text-primary accent-primary"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          <Wallet className="w-4 h-4" /> UPI Apps
                        </h4>
                        <p className="text-sm text-muted-foreground">Simulate GPay, PhonePe, Paytm</p>
                      </div>
                    </label>

                    {/* COD Option */}
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="w-5 h-5 text-primary accent-primary"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">Cash on Delivery</h4>
                        <p className="text-sm text-muted-foreground">Pay when you receive the order</p>
                      </div>
                    </label>
                  </div>

                  <div className="mt-8">
                    <Button 
                      size="xl" 
                      fullWidth 
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...
                        </span>
                      ) : (
                        `Pay ₹${cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} & Place Order`
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96 lg:flex-shrink-0">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-bold text-foreground mb-6">Order Summary</h2>
              
              {/* Items preview */}
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border flex items-center justify-center">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingCart className="w-6 h-6 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground truncate">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground mb-1">Qty: {item.quantity}</p>
                      <PriceDisplay price={item.product.price} discount={item.product.discount} size="sm" />
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-border mb-6" />
              
              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{originalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-₹{totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-success">Free</span>
                </div>
              </div>

              <hr className="border-border mb-6" />
              
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-foreground">Total to Pay</span>
                <span className="text-2xl font-black text-foreground">
                  ₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
