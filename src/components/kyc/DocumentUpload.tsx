import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, X, Check, Loader2, Video, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DocumentUploadProps {
  label: string;
  onUpload: (url: string) => void;
  uploadedUrl: string | null;
  isSelfie?: boolean;
}

export function DocumentUpload({ 
  label,
  onUpload,
  uploadedUrl,
  isSelfie = false
}: DocumentUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setCameraActive(true);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Camera error:', err);
      
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please grant permission in your browser settings and try again.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device. Please use a device with a camera.');
      } else {
        setCameraError('Failed to access camera. Please try again or upload a file instead.');
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setCameraError(null);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !user) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Mirror the image for selfie (front camera)
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    
    // Convert to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      // Stop camera
      stopCamera();
      
      // Show preview
      const previewUrl = URL.createObjectURL(blob);
      setPreview(previewUrl);
      
      // Upload to Supabase
      setUploading(true);
      try {
        const fileName = `${user.id}/${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`;
        
        const { data, error } = await supabase.storage
          .from('kyc-documents')
          .upload(fileName, blob, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'image/jpeg'
          });

        if (error) throw error;

        onUpload(data.path);
        toast.success('Photo captured and uploaded successfully');
      } catch (error: unknown) {
        console.error('Upload error:', error);
        toast.error((error as Error).message || 'Failed to upload photo');
        setPreview(null);
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg', 0.9);
  }, [user, label, onUpload, stopCamera]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${label.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get the URL (private bucket, so we use the path)
      const url = data.path;
      onUpload(url);
      toast.success('Document uploaded successfully');
    } catch (error: unknown) {
      console.error('Upload error:', error);
      toast.error((error as Error).message || 'Failed to upload document');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const clearUpload = () => {
    setPreview(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploaded = !!uploadedUrl;

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {cameraActive ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/50 aspect-[4/3] bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {/* Camera overlay guides */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-white/60 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-white/60 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-white/60 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-white/60 rounded-br-lg" />
              </div>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopCamera}
                  className="bg-background/80 backdrop-blur"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  onClick={capturePhoto}
                  className="bg-primary hover:bg-primary/90 px-8"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
              </div>
            </div>
            
            <p className="text-center text-sm text-muted-foreground mt-3">
              Position your face within the frame and tap Capture
            </p>
          </motion.div>
        ) : preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative"
          >
            <div className="relative rounded-xl overflow-hidden border-2 border-primary/20 aspect-[4/3]">
              <img
                src={preview}
                alt={`${label} preview`}
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                </div>
              )}
              {isUploaded && !uploading && (
                <div className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full">
                  <Check className="h-4 w-4" />
                </div>
              )}
            </div>
            
            {!uploading && (
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={clearUpload}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retake
                </Button>
              </div>
            )}
          </motion.div>
        ) : isUploaded ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full aspect-[4/3] rounded-xl border-2 border-green-500/50 bg-green-500/5 flex flex-col items-center justify-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-center">
              <p className="font-medium text-green-600">{label} Uploaded</p>
              <p className="text-sm text-muted-foreground">
                Click below to replace
              </p>
            </div>
            {isSelfie ? (
              <Button
                variant="outline"
                size="sm"
                onClick={startCamera}
              >
                <Camera className="h-4 w-4 mr-1" />
                Retake Photo
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Replace
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
          >
            {cameraError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                {cameraError}
              </div>
            )}
            
            {isSelfie ? (
              <div className="space-y-3">
                {/* Primary: Camera button */}
                <button
                  onClick={startCamera}
                  className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-primary/50 hover:border-primary transition-colors flex flex-col items-center justify-center gap-4 bg-primary/5 hover:bg-primary/10"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center px-4">
                    <p className="font-medium text-foreground">
                      Use Camera
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Take a live photo using your device camera
                    </p>
                  </div>
                </button>
                
                {/* Secondary: File upload option */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border border-border hover:border-primary/50 transition-colors flex items-center justify-center gap-2 bg-muted/30 hover:bg-muted/50"
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Or upload an existing photo
                  </span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-4 bg-muted/30 hover:bg-muted/50"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground">
                    Upload {label}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Click to browse files
                  </p>
                </div>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-foreground">Tips for a successful upload:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          {isSelfie ? (
            <>
              <li>• Ensure good lighting on your face</li>
              <li>• Remove glasses and hats</li>
              <li>• Look directly at the camera</li>
              <li>• Keep a neutral expression</li>
            </>
          ) : (
            <>
              <li>• Place document on a dark, flat surface</li>
              <li>• Ensure all corners are visible</li>
              <li>• Make sure text is clearly readable</li>
              <li>• Avoid glare or shadows</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
