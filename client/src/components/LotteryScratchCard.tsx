import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, Trophy, Key, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface LotteryScratchCardProps {
  customer: {
    id: string;
    activationKey: string | null;
    activationKeyRevealed: boolean;
    extensionActivated: boolean;
    totalSpent: string | number;
  };
  onKeyRevealed?: (activationKey: string) => void;
}

export function LotteryScratchCard({ customer, onKeyRevealed }: LotteryScratchCardProps) {
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(customer.activationKeyRevealed);
  const [revealedKey, setRevealedKey] = useState(customer.activationKeyRevealed ? customer.activationKey : null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const hasPaid = parseFloat(customer.totalSpent?.toString() || '0') > 0;

  useEffect(() => {
    if (canvasRef.current && hasPaid && !isRevealed) {
      initializeScratchCard();
    }
  }, [hasPaid, isRevealed]);

  const initializeScratchCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 320;
    canvas.height = 180;

    // Create scratch-off layer with gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#8B5CF6');
    gradient.addColorStop(0.5, '#A855F7');
    gradient.addColorStop(1, '#9333EA');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add "SCRATCH TO REVEAL" text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '14px Arial';
    ctx.fillText('YOUR ACTIVATION KEY', canvas.width / 2, canvas.height / 2 + 15);

    // Set composite operation for erasing
    ctx.globalCompositeOperation = 'destination-out';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hasPaid || isRevealed) return;
    setIsDrawing(true);
    scratch(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !hasPaid || isRevealed) return;
    scratch(e);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    checkScratchProgress();
  };

  const scratch = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.arc(x, y, 25, 0, 2 * Math.PI);
    ctx.fill();
  };

  const checkScratchProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let scratchedPixels = 0;
    const totalPixels = pixels.length / 4;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        scratchedPixels++;
      }
    }

    const progress = (scratchedPixels / totalPixels) * 100;
    setScratchProgress(progress);

    if (progress > 40) {
      revealKey();
    }
  };

  const revealKey = async () => {
    setIsScratching(true);
    
    try {
      const response = await apiRequest(`/api/customer/${customer.id}/reveal-key`, 'POST');
      
      setIsRevealed(true);
      setRevealedKey(response.activationKey);
      
      toast({
        title: '🎉 Activation Key Revealed!',
        description: 'Your extension is now fully activated and ready to use!',
      });

      if (onKeyRevealed) {
        onKeyRevealed(response.activationKey);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reveal activation key. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsScratching(false);
    }
  };

  const copyActivationKey = () => {
    if (revealedKey) {
      navigator.clipboard.writeText(revealedKey);
      toast({
        title: 'Copied!',
        description: 'Activation key copied to clipboard.',
      });
    }
  };

  if (!hasPaid) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Gift className="w-8 h-8 text-gray-400" />
          </div>
          <CardTitle className="text-lg text-gray-600">Activation Key Waiting</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 mb-4">
            Complete your purchase to reveal your unique activation key!
          </p>
          <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
            Payment Required
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (isRevealed && revealedKey) {
    return (
      <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-lg text-green-800 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Activation Key Revealed!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-white/80 rounded-lg p-4 border border-green-200">
            <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">Your Unique Activation Key</p>
            <div className="font-mono text-lg font-bold text-gray-900 bg-yellow-100 px-3 py-2 rounded border border-yellow-200">
              {revealedKey}
            </div>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button onClick={copyActivationKey} variant="outline" size="sm">
              <Key className="w-4 h-4 mr-2" />
              Copy Key
            </Button>
            <Badge className="bg-green-600 text-white">
              Extension Activated
            </Badge>
          </div>

          <p className="text-xs text-green-700 leading-relaxed">
            🎉 Congratulations! Your extension is now fully activated with unlimited job searches. 
            Use the activation key above in the extension settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
        </div>
        <CardTitle className="text-lg text-purple-800">Scratch to Reveal Your Prize!</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-sm text-purple-700">
          Your payment was successful! Scratch the card below to reveal your unique activation key.
        </p>
        
        <div className="relative mx-auto w-80 h-45 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg overflow-hidden border-4 border-yellow-300 shadow-lg">
          {/* Background content (revealed when scratched) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            <Key className="w-12 h-12 text-yellow-600 mb-2" />
            <p className="text-xs text-yellow-800 mb-2 uppercase tracking-wide">Your Activation Key</p>
            <div className="font-mono text-sm font-bold text-gray-900 bg-white px-3 py-2 rounded shadow">
              {customer.activationKey || 'Loading...'}
            </div>
            <p className="text-xs text-yellow-700 mt-2">Extension Fully Activated!</p>
          </div>
          
          {/* Scratch layer */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-pointer"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ touchAction: 'none' }}
          />
        </div>

        <div className="flex justify-center gap-2">
          <Badge variant="outline" className="bg-purple-100 border-purple-200 text-purple-700">
            Payment Confirmed
          </Badge>
          {scratchProgress > 0 && (
            <Badge className="bg-green-600 text-white">
              {Math.round(scratchProgress)}% Revealed
            </Badge>
          )}
        </div>

        <p className="text-xs text-purple-600 leading-relaxed">
          💡 Tip: Use your mouse to scratch off the silver layer and reveal your unique activation key!
        </p>
      </CardContent>
    </Card>
  );
}