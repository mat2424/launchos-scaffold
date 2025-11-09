import { useState, useRef } from 'react';
import { Camera, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void;
  onAnalyzing?: (analyzing: boolean) => void;
}

export const CameraCapture = ({ onCapture, onAnalyzing }: CameraCaptureProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setIsOpen(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast({
        title: 'Camera Error',
        description: 'Unable to access camera. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsOpen(false);
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
      }
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onAnalyzing?.(true);
      onCapture(capturedImage);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <>
      <Button 
        onClick={startCamera} 
        variant="outline" 
        size="sm"
        className="gap-2"
      >
        <Camera className="w-4 h-4" />
        Take Photo
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="relative w-full h-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center p-4">
            <Button
              onClick={stopCamera}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>

            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain rounded-lg"
                />
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="absolute bottom-8 rounded-full w-16 h-16 p-0"
                >
                  <Camera className="w-6 h-6" />
                </Button>
              </>
            ) : (
              <>
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-contain rounded-lg"
                />
                <div className="absolute bottom-8 flex gap-4">
                  <Button
                    onClick={retakePhoto}
                    variant="outline"
                    size="lg"
                    className="gap-2"
                  >
                    <X className="w-5 h-5" />
                    Retake
                  </Button>
                  <Button
                    onClick={confirmCapture}
                    size="lg"
                    className="gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Use Photo
                  </Button>
                </div>
              </>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </>
  );
};
