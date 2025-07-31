import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  CameraOff, 
  FlashlightOff, 
  Flashlight,
  SwitchCamera,
  X,
  Scan
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { BarcodeScannerProps, ScanResult } from '../mobile.types';

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onError,
  continuous = false,
  formats = ['code128', 'ean13', 'ean8', 'qr_code'],
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Mock scanner function (in real app, would use a library like ZXing or QuaggaJS)
  const mockScanBarcode = () => {
    // Simulate random successful scans
    if (Math.random() > 0.95) {
      const mockBarcodes = [
        { type: 'barcode', format: 'code128', value: '1234567890123' },
        { type: 'qrcode', format: 'qr_code', value: 'PROD-001-LOT-2024' },
        { type: 'barcode', format: 'ean13', value: '5901234123457' }
      ];
      
      const mockResult = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
      const result: ScanResult = {
        ...mockResult,
        timestamp: new Date()
      };
      
      // Prevent duplicate scans
      if (result.value !== lastScan) {
        setLastScan(result.value);
        onScan(result);
        
        if (!continuous) {
          stopScanning();
        }
      }
    }
  };

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setIsScanning(true);
      setError(null);
      
      // Start scanning loop
      scanLoop();
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
      setHasCamera(false);
      onError?.(err as Error);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setIsScanning(false);
    setLastScan(null);
  };

  const scanLoop = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Mock barcode detection
      mockScanBarcode();
    }
    
    animationFrameRef.current = requestAnimationFrame(scanLoop);
  };

  const toggleFlash = async () => {
    if (!streamRef.current) return;
    
    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;
    
    if (capabilities.torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !flashEnabled }]
        });
        setFlashEnabled(!flashEnabled);
      } catch (err) {
        console.error('Flash toggle error:', err);
      }
    }
  };

  const switchCamera = () => {
    stopScanning();
    setFacingMode(facingMode === 'user' ? 'environment' : 'user');
    setTimeout(startCamera, 100);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className={cn('relative', className)}>
      <Card className="overflow-hidden">
        {/* Camera View */}
        <div className="relative aspect-[4/3] bg-black">
          {isScanning ? (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Scan Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-64 h-64 border-2 border-primary rounded-lg"
                    animate={{
                      borderColor: ['rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 1)', 'rgba(59, 130, 246, 0.5)']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                  >
                    {/* Corner markers */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                    
                    {/* Scan line */}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-primary"
                      animate={{
                        top: ['0%', '100%', '0%']
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                  </motion.div>
                </div>
                
                {/* Instructions */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <p className="text-white text-sm bg-black/50 rounded-lg px-4 py-2 inline-block">
                    Position barcode within frame
                  </p>
                </div>
              </div>
              
              {/* Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={toggleFlash}
                  className="bg-black/50 hover:bg-black/70"
                >
                  {flashEnabled ? (
                    <Flashlight className="h-4 w-4" />
                  ) : (
                    <FlashlightOff className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={switchCamera}
                  className="bg-black/50 hover:bg-black/70"
                >
                  <SwitchCamera className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={stopScanning}
                  className="bg-black/50 hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                {hasCamera ? (
                  <>
                    <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                    <Button onClick={startCamera} size="lg">
                      <Scan className="h-5 w-5 mr-2" />
                      Start Scanning
                    </Button>
                  </>
                ) : (
                  <>
                    <CameraOff className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">Camera not available</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Last Scan Result */}
        {lastScan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 border-t"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last scan:</p>
                <p className="font-mono font-medium">{lastScan}</p>
              </div>
              {continuous && (
                <div className="text-sm text-muted-foreground">
                  Continuous mode
                </div>
              )}
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
};