import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PriceDisplayProps {
  className?: string;
  showSavings?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'hero' | 'card' | 'minimal';
}

interface ProductPricing {
  id: number;
  name: string;
  price: string;
  beforePrice?: string;
  currency: string;
}

export function PriceDisplay({ 
  className = "", 
  showSavings = true, 
  size = 'md',
  variant = 'default'
}: PriceDisplayProps) {
  const { data: product, isLoading } = useQuery<ProductPricing>({
    queryKey: ['/api/products/pricing'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/products/pricing');
      return await response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-8 w-24"></div>;
  }

  const currentPrice = parseFloat(product?.price || '250');
  const originalPrice = product?.beforePrice ? parseFloat(product.beforePrice) : null;
  const currency = product?.currency || 'eur';
  const savings = originalPrice && currentPrice ? originalPrice - currentPrice : 0;

  // Currency formatting based on locale
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Size classes for different components
  const sizeClasses = {
    sm: {
      current: 'text-lg font-bold',
      before: 'text-sm',
      savings: 'text-xs'
    },
    md: {
      current: 'text-xl font-bold',
      before: 'text-base',
      savings: 'text-sm'
    },
    lg: {
      current: 'text-2xl font-bold',
      before: 'text-lg',
      savings: 'text-base'
    },
    xl: {
      current: 'text-3xl font-bold',
      before: 'text-xl',
      savings: 'text-lg'
    }
  };

  // Variant-specific styling
  const variantClasses = {
    default: 'flex items-center gap-2',
    hero: 'flex flex-col items-center text-center',
    card: 'flex items-baseline gap-2',
    minimal: 'inline-flex items-center gap-1'
  };

  const currentPriceClass = `${sizeClasses[size].current} text-slate-900 dark:text-white`;
  const beforePriceClass = `${sizeClasses[size].before} text-slate-500 dark:text-slate-400 line-through`;
  const savingsClass = `${sizeClasses[size].savings} text-green-600 dark:text-green-400 font-medium`;

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {/* Before Price (if exists) */}
      {originalPrice && originalPrice > currentPrice && (
        <span className={beforePriceClass}>
          {formatPrice(originalPrice)}
        </span>
      )}
      
      {/* Current Price */}
      <span className={currentPriceClass}>
        {formatPrice(currentPrice)}
      </span>
      
      {/* Savings Display */}
      {showSavings && originalPrice && originalPrice > currentPrice && savings > 0 && (
        <span className={savingsClass}>
          {variant === 'hero' ? (
            <>Save {formatPrice(savings)}</>
          ) : (
            <>-{formatPrice(savings)}</>
          )}
        </span>
      )}
      
      {/* Discount Percentage */}
      {originalPrice && originalPrice > currentPrice && variant === 'hero' && (
        <span className="text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full">
          -{Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}%
        </span>
      )}
    </div>
  );
}

// Helper component for quick inline pricing
export function InlinePrice({ className = "" }: { className?: string }) {
  return <PriceDisplay variant="minimal" size="sm" className={className} showSavings={false} />;
}

// Hero pricing component for main pages
export function HeroPrice({ className = "" }: { className?: string }) {
  return <PriceDisplay variant="hero" size="xl" className={className} showSavings={true} />;
}

// Card pricing for product listings
export function CardPrice({ className = "" }: { className?: string }) {
  return <PriceDisplay variant="card" size="lg" className={className} showSavings={true} />;
}