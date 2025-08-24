import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PayPalButton from "@/components/PayPalButton";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Shield,
  Check,
  CreditCard,
  Mail,
  User,
  Loader2,
  Bot,
  Percent
} from "lucide-react";
import { CheckoutTutorial } from "@/components/tutorials/CheckoutTutorial";
import { useLanguage } from '@/contexts/LanguageContext';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 
  loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) : 
  null;

// Define interfaces for API responses
interface ProductPricing {
  id: number;
  name: string;
  price: string;
  beforePrice?: string;
  currency: string;
}

interface CouponValidationResponse {
  valid: boolean;
  discountAmount: number;
  finalAmount: number;
  message?: string;
  coupon?: { code: string };
}

interface OrderCompletionResponse {
  activationKey: string;
}

export default function Checkout() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [couponValidation, setCouponValidation] = useState<CouponValidationResponse | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const customerSchema = useMemo(() => t.checkout ? z.object({
    customerName: z.string().min(1, t.checkout.customerNameRequired),
    customerEmail: z.string().email(t.checkout.customerEmailInvalid),
    couponCode: z.string().optional(),
  }) : z.object({ // Fallback schema
    customerName: z.string().min(1, "Name is required"),
    customerEmail: z.string().email("Valid email is required"),
    couponCode: z.string().optional(),
  }), [t.checkout]);

  type CustomerForm = z.infer<typeof customerSchema>;

  const StripeCheckoutForm = ({ customerData, finalPrice, onSuccess }: { customerData: CustomerForm, finalPrice: number, onSuccess?: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (!stripe || !elements || !t.checkout) {
        return;
      }
  
      setIsProcessing(true);
  
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
          receipt_email: customerData.customerEmail,
        },
        redirect: 'if_required'
      });
  
      setIsProcessing(false);
  
      if (error) {
        toast({
          title: t.checkout.paymentFailed,
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        try {
          const response = await apiRequest('POST', '/api/complete-stripe-payment', {
            paymentIntentId: paymentIntent.id,
            customerEmail: customerData.customerEmail,
            customerName: customerData.customerName
          });
  
          if (response.ok) {
            const result: OrderCompletionResponse = await response.json();
            if (result.activationKey) {
              localStorage.setItem('latestActivationKey', result.activationKey);
            }
          }
        } catch (err) {
          console.error('Failed to complete order:', err);
        }
        
        toast({
          title: t.checkout.paymentSuccessTitle, 
          description: t.checkout.paymentSuccessDescription,
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    }
  
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <PaymentElement 
            options={{
              layout: "tabs",
              defaultValues: {
                billingDetails: {
                  name: customerData.customerName,
                  email: customerData.customerEmail,
                }
              }
            }}
          />
        </div>
        <Button 
          type="submit" 
          disabled={!stripe || !elements || isProcessing}
          className="w-full bg-primary hover:bg-secondary text-white py-4 text-lg font-semibold"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t.checkout?.processingPayment}
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              {t.checkout?.payWithCard} ${finalPrice}
            </>
          )}
        </Button>
      </form>
    );
  };
  
  const PayPalSection = ({ customerData, onPayPalSuccess, finalPrice, referralCode }: { 
    customerData: CustomerForm, 
    onPayPalSuccess: () => void,
    finalPrice: number,
    referralCode?: string | null
  }) => {
    const { toast } = useToast();
  
    const handlePayPalApprove = async (orderID: string) => {
      if (!t.checkout) return;
      try {
        const response = await apiRequest('POST', '/api/complete-paypal-payment', {
          orderID,
          customerEmail: customerData.customerEmail,
          customerName: customerData.customerName,
          amount: finalPrice,
          referralCode: referralCode
        });
        
        if (response.ok) {
          onPayPalSuccess();
          toast({
            title: t.checkout.paymentSuccessTitle,
            description: t.checkout.paymentSuccessDescription,
          });
        }
      } catch (error: any) {
        toast({
          title: t.checkout.paymentErrorTitle,
          description: error.message || t.checkout.unknownError,
          variant: "destructive",
        });
      }
    };
  
    return (
      <div className="space-y-4">
        <div className="text-center">
          <PayPalButton 
            amount={finalPrice.toString()}
            currency="USD"
            intent="CAPTURE"
            onApprove={handlePayPalApprove}
          />
        </div>
        <p className="text-sm text-slate-600 text-center">
          {t.checkout?.payPalRedirect}
        </p>
      </div>
    );
  };

  // Fetch dynamic pricing from API
  const { data: pricingData, isLoading: pricingLoading } = useQuery<ProductPricing>({
    queryKey: ['/api/products/pricing'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products/pricing');
      if (!response.ok) throw new Error('Failed to fetch pricing');
      return await response.json();
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const originalPrice = pricingData ? parseFloat(pricingData.price) : 250;
  const beforePrice = pricingData?.beforePrice ? parseFloat(pricingData.beforePrice) : null;

  // Extract referral code from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, []);

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      couponCode: "",
    },
  });

  const customerData = form.watch();
  const isFormValid = form.formState.isValid && customerData.customerName && customerData.customerEmail;
  
  const finalPrice = couponValidation ? couponValidation.finalAmount : originalPrice;
  const discount = couponValidation ? couponValidation.discountAmount : 0;
  
  // Show loading state while pricing is being fetched or translations are loading
  if (pricingLoading || !t.checkout) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">{t.checkout?.loadingMessage || 'Loading...'}</p>
        </div>
      </div>
    );
  }
  
  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setCouponValidation(null);
      return;
    }
    
    setCouponLoading(true);
    try {
      const response = await apiRequest("POST", "/api/validate-coupon", {
        code: code.trim(),
        orderAmount: originalPrice
      });
      const data: CouponValidationResponse = await response.json();
      
      if (response.ok && data.valid) {
        setCouponValidation(data);
        toast({
          title: t.checkout?.couponApplied,
          description: `${t.checkout?.couponSaved} $${data.discountAmount.toFixed(2)}`,
        });
      } else {
        setCouponValidation(null);
        toast({
          title: t.checkout?.invalidCoupon,
          description: data.message || t.checkout?.invalidCouponMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      setCouponValidation(null);
      toast({
        title: t.common.error,
        description: t.checkout?.couponValidationError,
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    if (isFormValid && paymentMethod === 'stripe' && !clientSecret) {
      setIsLoading(true);
      apiRequest("POST", "/api/create-payment-intent", { 
        amount: finalPrice,
        customerEmail: customerData.customerEmail,
        customerName: customerData.customerName,
        couponCode: customerData.couponCode || null,
        originalAmount: originalPrice,
        discountAmount: discount,
        referralCode: referralCode || null
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
          toast({
            title: t.common.error,
            description: t.checkout?.paymentInitializationError,
            variant: "destructive",
          });
        });
    }
  }, [isFormValid, paymentMethod, customerData, clientSecret, finalPrice, toast, t]);

  if (isSuccess) {
    const activationKey = localStorage.getItem('latestActivationKey');
    
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="text-center p-8">
            <div className="w-16 h-16 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">{t.checkout.successTitle}</h1>
            <p className="text-slate-600 mb-6">{t.checkout.successMessage}</p>
            
            {activationKey ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">{t.checkout.activationCode}</h3>
                <div className="bg-white border rounded p-3 font-mono text-sm text-slate-900 break-all">
                  {activationKey}
                </div>
                <p className="text-sm text-blue-700 mt-2">
                  {t.checkout.activationCodeHint}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-yellow-900 mb-3">{t.checkout.processingActivationCode}</h3>
                <p className="text-sm text-yellow-700">
                  {t.checkout.processingActivationCodeMessage}
                </p>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <Link href="/">
                <Button variant="outline">
                  {t.checkout.returnHome}
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t.checkout.backToHome}
              </Button>
            </Link>
            <div className="flex items-center">
              <Bot className="text-primary mr-3 h-6 w-6" />
              <span className="text-lg font-semibold text-slate-900">{t.checkout.pageTitle}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Summary */}
            <div data-tutorial="product-summary">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    {t.checkout.orderSummaryTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Product Info */}
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white">
                      <Bot className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{t.checkout.productName}</h3>
                      <p className="text-slate-600 text-sm mt-1">
                        {t.checkout.productDescription}
                      </p>
                      <div className="mt-2">
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          {t.checkout.lifetimeAccess}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      {pricingLoading ? (
                        <div className="animate-pulse bg-gray-200 rounded h-8 w-24 ml-auto"></div>
                      ) : (
                        <>
                          {(discount > 0 || (beforePrice && beforePrice > originalPrice)) && (
                            <div className="text-sm text-slate-500 line-through">
                              ${beforePrice || originalPrice}
                            </div>
                          )}
                          <div className="text-2xl font-bold text-slate-900">${finalPrice}</div>
                          <div className="text-sm text-slate-500">{t.checkout.oneTimePayment}</div>
                        </>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Features Included */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">{t.checkout.whatsIncluded}</h4>
                    <div className="space-y-2">
                      {t.checkout.includedFeatures.map((feature, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-accent" />
                          <span className="text-sm text-slate-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-2" data-tutorial="pricing-breakdown">
                    <div className="flex justify-between text-slate-600">
                      <span>{t.checkout.originalPrice}</span>
                      <span>
                        {pricingLoading ? (
                          <div className="animate-pulse bg-gray-200 rounded h-4 w-12"></div>
                        ) : (
                          `$${originalPrice}`
                        )}
                      </span>
                    </div>
                    {discount > 0 && (
                      <>
                        <div className="flex justify-between text-accent">
                          <span>{t.checkout.discount} ({couponValidation?.coupon?.code})</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                        <Separator />
                      </>
                    )}
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>{t.checkout.total}</span>
                      <span className="text-primary">
                        {pricingLoading ? (
                          <div className="animate-pulse bg-gray-200 rounded h-6 w-16"></div>
                        ) : (
                          `$${finalPrice} ${t.checkout.totalUSD}`
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="bg-slate-50 rounded-lg p-4 text-center" data-tutorial="security-badge">
                    <Shield className="h-6 w-6 text-accent mx-auto mb-2" />
                    <div className="text-sm font-medium text-slate-900">{t.checkout.securePayment}</div>
                    <div className="text-xs text-slate-600">Protected by SSL encryption</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t.checkout.completePurchase}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4" data-tutorial="customer-form">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {t.checkout.yourInformation}
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="customerName">{t.checkout.fullNameLabel}</Label>
                        <Input
                          id="customerName"
                          placeholder={t.checkout.fullNamePlaceholder}
                          {...form.register('customerName')}
                          className={form.formState.errors.customerName ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.customerName && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.customerName.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="customerEmail">{t.checkout.emailLabel}</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          placeholder={t.checkout.emailPlaceholder}
                          {...form.register('customerEmail')}
                          className={form.formState.errors.customerEmail ? 'border-red-500' : ''}
                        />
                        {form.formState.errors.customerEmail && (
                          <p className="text-red-500 text-sm mt-1">
                            {form.formState.errors.customerEmail.message}
                          </p>
                        )}
                        <p className="text-xs text-slate-500 mt-1">
                          <Mail className="h-3 w-3 inline mr-1" />
                          {t.checkout.emailHint}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Coupon Code */}
                  <div className="space-y-4" data-tutorial="coupon-field">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      {t.checkout.couponTitle}
                    </h3>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          id="couponCode"
                          placeholder={t.checkout.couponPlaceholder}
                          {...form.register('couponCode')}
                          className="uppercase"
                          onChange={(e) => {
                            form.setValue('couponCode', e.target.value.toUpperCase());
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => validateCoupon(customerData.couponCode || '')}
                        disabled={couponLoading || !customerData.couponCode?.trim()}
                        className="px-4"
                      >
                        {couponLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          t.checkout.applyButton
                        )}
                      </Button>
                    </div>
                    
                    {couponValidation?.valid && (
                      <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-accent">
                          <Check className="h-4 w-4" />
                          <span className="font-medium">
                            {t.checkout.couponApplied} "{couponValidation.coupon?.code}"
                          </span>
                        </div>
                        <p className="text-sm text-accent/80 mt-1">
                          {t.checkout.couponSaved} ${couponValidation.discountAmount.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Payment Method Selection */}
                  <div data-tutorial="payment-tabs">
                    <h3 className="font-semibold text-slate-900 mb-4">{t.checkout.paymentMethod}</h3>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <Button
                        variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('stripe')}
                        className="h-12"
                        type="button"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        {t.checkout.creditCard}
                      </Button>
                      <Button
                        variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                        onClick={() => setPaymentMethod('paypal')}
                        className="h-12"
                        type="button"
                      >
                        {t.checkout.payPal}
                      </Button>
                    </div>

                    {/* Payment Forms */}
                    {isFormValid ? (
                      <>
                        {paymentMethod === 'stripe' && (
                          <>
                            {clientSecret && !isLoading ? (
                              <Elements stripe={stripePromise} options={{ clientSecret }}>
                                <StripeCheckoutForm customerData={customerData} finalPrice={finalPrice} onSuccess={() => setIsSuccess(true)} />
                              </Elements>
                            ) : (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="ml-2 text-slate-600">{t.checkout.preparingPayment}</span>
                              </div>
                            )}
                          </>
                        )}

                        {paymentMethod === 'paypal' && (
                          <PayPalSection 
                            customerData={customerData}
                            onPayPalSuccess={() => setIsSuccess(true)}
                            finalPrice={finalPrice}
                            referralCode={referralCode}
                          />
                        )}
                      </>
                    ) : (
                      <div className="bg-slate-50 rounded-lg p-6 text-center">
                        <p className="text-slate-600">{t.checkout.fillInfoToContinue}</p>
                      </div>
                    )}
                  </div>

                  {/* Test Mode Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2">{t.checkout.testModeTitle}</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>{t.checkout.testModeSuccess}</strong> 4242 4242 4242 4242</p>
                      <p><strong>{t.checkout.testModeDecline}</strong> 4000 0000 0000 0002</p>
                      <p>{t.checkout.testModeInstructions}</p>
                      <p className="text-xs mt-2">{t.checkout.testModeWarning}</p>
                    </div>
                  </div>

                  {/* Security Info */}
                  <div className="text-center text-sm text-slate-500 space-y-2">
                    <div className="flex justify-center space-x-4">
                      <span>🔒 {t.checkout.sslSecure}</span>
                      <span>💳 {t.checkout.pciCompliant}</span>
                      <span>🔄 {t.checkout.moneyBackGuarantee}</span>
                    </div>
                    <p>Your payment information is encrypted and secure</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial System */}
      <CheckoutTutorial />
    </div>
  );
}
