"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CameraOff,
  FlipHorizontal,
  Maximize2,
  MapPin,
  List,
} from "lucide-react";
import { BoundingBoxOverlay } from "./bounding-box-overlay";
import { classifyFrame, optimizeImage } from "@/lib/api";

/**
 * LiveCameraView Component
 * Handles live camera streaming with device selection, flip, and fullscreen
 * Includes real-time frame capture and ML classification
 */
const LiveCameraView = ({
  onTabChange,
  enableRealTimeClassification = false,
  classificationInterval = 1000,
  onClassificationResult,
  className = "",
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const processingRef = useRef(false);
  const intervalRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [error, setError] = useState("");
  const [objectFit, setObjectFit] = useState("cover");

  // Real-time classification states
  const [detections, setDetections] = useState([]);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const applyStreamToVideo = useCallback(stream => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.playsInline = true;
      videoRef.current.muted = true;
      videoRef.current.autoplay = true;

      // Get video dimensions when metadata loads
      videoRef.current.onloadedmetadata = () => {
        setVideoSize({
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        });
      };
    }
  }, []);

  const enumerateCameras = useCallback(async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all.filter(d => d.kind === "videoinput");
      setDevices(cams);
      if (!selectedDeviceId && cams.length > 0) {
        setSelectedDeviceId(cams[0].deviceId);
      }
    } catch (e) {
      console.error("Failed to enumerate cameras:", e);
    }
  }, [selectedDeviceId]);

  /**
   * Capture frame from video stream and convert to base64
   */
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 JPEG
    return canvas.toDataURL("image/jpeg", 0.8);
  }, []);

  /**
   * Process frame with ML API (T046 + T048 + T050 + T051)
   * - T046: Connect to ML service
   * - T048: Image optimization before upload
   * - T050: Error handling with user feedback
   * - T051: Retry logic for failed requests
   */
  const processFrame = useCallback(async () => {
    if (processingRef.current || !isStreaming) {
      return;
    }

    try {
      processingRef.current = true;
      setIsProcessing(true);
      setProcessingError(null);

      // Capture frame from video
      if (!videoRef.current || !canvasRef.current) {
        throw new Error("Camera not ready");
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // T048: Optimize image before upload (max 1280x720, quality 0.8)
      const optimizedBlob = await optimizeImage(canvas, {
        quality: 0.8,
        maxWidth: 1280,
        maxHeight: 720,
      });

      // T046: Call ML service with optimized image
      const result = await classifyFrame(optimizedBlob);

      // Success - reset retry count
      setRetryCount(0);

      // Process detections
      if (result.success && result.data && result.data.detections) {
        const { detections, metadata } = result.data;

        // Transform detections to component format
        const transformedDetections = detections.map(detection => ({
          id: detection.id,
          category: detection.category,
          confidence: detection.confidence,
          bbox: detection.bbox, // {x, y, width, height}
        }));

        setDetections(transformedDetections);

        // Callback with full result including metadata
        onClassificationResult?.({
          detections: transformedDetections,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        setDetections([]);
      }
    } catch (error) {
      console.error("Frame processing error:", error);

      // T050: Error handling with user feedback
      setProcessingError(error.message);

      // T051: Retry logic (max 3 attempts)
      if (retryCount < MAX_RETRIES) {
        setRetryCount(prev => prev + 1);
        console.log(`Retrying... (${retryCount + 1}/${MAX_RETRIES})`);

        // Retry after delay (exponential backoff)
        setTimeout(
          () => {
            processingRef.current = false;
            processFrame();
          },
          Math.min(1000 * Math.pow(2, retryCount), 5000)
        );
      } else {
        // Max retries reached - show persistent error
        console.error(
          "Max retries reached. Please check ML service connection."
        );
      }
    } finally {
      if (retryCount >= MAX_RETRIES || !processingError) {
        setIsProcessing(false);
      }
      processingRef.current = false;
    }
  }, [isStreaming, onClassificationResult, retryCount, processingError]);

  /**
   * Start/stop real-time classification
   */
  useEffect(() => {
    if (enableRealTimeClassification && isStreaming) {
      // Start interval for frame processing
      intervalRef.current = setInterval(() => {
        processFrame();
      }, classificationInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Clear interval when disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [
    enableRealTimeClassification,
    isStreaming,
    classificationInterval,
    processFrame,
  ]);

  const startStream = useCallback(
    async (opts = {}) => {
      try {
        setError("");
        stopStream();

        const useFacing = opts.facing ?? facingMode;
        const useDeviceId = opts.deviceId ?? selectedDeviceId;

        const constraints = {
          video: useDeviceId
            ? {
                deviceId: { exact: useDeviceId },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }
            : {
                facingMode: { ideal: useFacing },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        applyStreamToVideo(stream);
        setIsStreaming(true);

        await enumerateCameras();
      } catch (e) {
        setError(
          e?.name === "NotAllowedError"
            ? "Akses kamera ditolak. Silakan izinkan akses kamera di browser Anda."
            : e?.name === "NotFoundError"
              ? "Tidak menemukan kamera. Pastikan perangkat memiliki kamera tersedia."
              : "Gagal memulai kamera. Coba pilih perangkat kamera lain atau muat ulang halaman."
        );
        setIsStreaming(false);
      }
    },
    [
      applyStreamToVideo,
      enumerateCameras,
      facingMode,
      selectedDeviceId,
      stopStream,
    ]
  );

  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.mediaDevices?.getUserMedia
    ) {
      startStream().catch(() => {});
    } else {
      setError("Browser tidak mendukung akses kamera (getUserMedia).");
    }
    return () => stopStream();
  }, [startStream, stopStream]);

  const handleFlipCamera = async () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    setSelectedDeviceId("");
    await startStream({ facing: next, deviceId: "" });
  };

  const handleDeviceChange = async deviceId => {
    setSelectedDeviceId(deviceId);
    await startStream({ deviceId, facing: undefined });
  };

  const handleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.msRequestFullscreen) el.msRequestFullscreen();
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  return (
    <div ref={containerRef} className={`relative flex-1 bg-black ${className}`}>
      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video */}
      <video
        ref={videoRef}
        className={`w-full h-full ${objectFit === "cover" ? "object-cover" : "object-contain"} bg-black`}
        autoPlay
        muted
        playsInline
      />

      {/* Bounding Box Overlay */}
      {detections.length > 0 && (
        <BoundingBoxOverlay detections={detections} videoSize={videoSize} />
      )}

      {/* T049: Processing Loading Indicator */}
      {isProcessing && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg px-6 py-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            <span className="text-white text-sm font-medium">Memproses...</span>
          </div>
        </div>
      )}

      {/* T050: Processing Error Display */}
      {processingError && retryCount >= MAX_RETRIES && (
        <div className="absolute top-20 right-4 max-w-sm z-20">
          <div className="px-4 py-3 rounded-lg bg-orange-600/90 text-white shadow">
            <p className="text-xs font-medium mb-1">Gagal memproses gambar</p>
            <p className="text-xs opacity-90">{processingError}</p>
            <button
              onClick={() => {
                setRetryCount(0);
                setProcessingError(null);
                processFrame();
              }}
              className="mt-2 text-xs underline hover:no-underline"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      {/* Status and errors */}
      <div className="absolute top-4 left-4 z-20">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur">
          <span
            className={`inline-block w-2 h-2 rounded-full mr-2 ${isStreaming ? "bg-emerald-400" : "bg-red-400"}`}
          ></span>
          {isStreaming ? "Kamera aktif" : "Kamera mati"}
        </div>
      </div>

      {error && (
        <div className="absolute top-4 right-4 max-w-sm z-20">
          <div className="px-4 py-3 rounded-lg bg-red-600/90 text-white shadow">
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="pointer-events-none h-40 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              {/* Left: Device selector */}
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-2 rounded-lg">
                <Camera className="w-4 h-4 text-white" />
                <select
                  className="bg-transparent text-white text-sm outline-none"
                  value={selectedDeviceId}
                  onChange={e => handleDeviceChange(e.target.value)}
                  aria-label="Pilih kamera"
                >
                  {devices.length === 0 && (
                    <option value="">Pilih kamera</option>
                  )}
                  {devices.map((d, idx) => (
                    <option key={d.deviceId || idx} value={d.deviceId}>
                      {d.label || `Kamera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Center: Main controls */}
              <div className="flex items-center gap-2">
                {!isStreaming ? (
                  <button
                    onClick={() => startStream()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                  >
                    <Camera className="w-4 h-4" />
                    Mulai Kamera
                  </button>
                ) : (
                  <button
                    onClick={stopStream}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
                  >
                    <CameraOff className="w-4 h-4" />
                    Hentikan
                  </button>
                )}

                <button
                  onClick={handleFlipCamera}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                  title="Ganti kamera depan/belakang"
                >
                  <FlipHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Flip</span>
                </button>

                <button
                  onClick={() =>
                    setObjectFit(f => (f === "cover" ? "contain" : "cover"))
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                  title="Mode tampilan"
                >
                  <List className="w-4 h-4 rotate-90" />
                  <span className="hidden sm:inline">
                    {objectFit === "cover" ? "Contain" : "Cover"}
                  </span>
                </button>

                <button
                  onClick={handleFullscreen}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </button>
              </div>

              {/* Right: Quick nav to Lokasi */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onTabChange?.("lokasi")}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white text-gray-900 hover:bg-gray-100 font-medium"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="hidden sm:inline">Lihat Lokasi</span>
                  <span className="sm:hidden">Lokasi</span>
                </button>
              </div>
            </div>

            {/* tips */}
            <p className="text-xs text-white/70 mt-3">
              Tip: Jika kamera tidak muncul, pastikan izin kamera sudah
              diberikan dan coba pilih perangkat kamera yang tersedia.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { LiveCameraView };
