"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
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
const LiveCameraView = forwardRef(
  (
    {
      onTabChange,
      enableRealTimeClassification = false,
      classificationInterval = 1000,
      onClassificationResult,
      className = "",
    },
    ref
  ) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const processingRef = useRef(false);
    const intervalRef = useRef(null);
    const retryTimeoutRef = useRef(null);
    const isMountedRef = useRef(true); // Track component mount status
    const processFrameRef = useRef(null); // Stable reference to processFrame

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
    const [serviceUnavailable, setServiceUnavailable] = useState(false); // Track service availability
    const MAX_RETRIES = 1; // Only 1 retry - fail fast for better UX

    const stopStream = useCallback((keepError = false) => {
      // FORCE stop all media tracks immediately
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Aggressively clear and reset video element
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.load(); // Reset video element to release camera
        videoRef.current.currentTime = 0; // Reset playback position
      }

      setIsStreaming(false);

      // Clear detections when camera stops
      setDetections([]);

      // Clear classification interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Clear retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      // Clear processing ref
      processingRef.current = false;
      setIsProcessing(false);

      // Only clear error if not keeping it for display
      if (!keepError) {
        setRetryCount(0); // Reset retry count
        setProcessingError(null); // Clear error
        setServiceUnavailable(false); // Reset service status
      }

      // Mark component as unmounted to stop any pending retries
      isMountedRef.current = false;
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
        // Silently fail - camera enumeration not critical
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
      // Check if component is still mounted
      if (!isMountedRef.current || processingRef.current || !isStreaming) {
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
        // T050: Error handling with user feedback
        setProcessingError(error.message);

        // T051: Retry logic (max 3 attempts)
        if (retryCount < MAX_RETRIES) {
          const nextRetry = retryCount + 1;
          setRetryCount(nextRetry);
          const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 5000);

          // Retry after delay (exponential backoff) - store timeout ID
          retryTimeoutRef.current = setTimeout(() => {
            // Double-check component is still mounted before retrying
            if (!isMountedRef.current) {
              return;
            }
            processingRef.current = false;
            processFrame();
          }, backoffMs);
        } else {
          // Max retries reached - service unavailable
          setServiceUnavailable(true);

          // CRITICAL: Clear interval FIRST to stop retry loop
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }

          // Stop camera stream but KEEP error for display
          stopStream(true); // Pass true to preserve error state
          setIsProcessing(false);
        }
      } finally {
        if (retryCount >= MAX_RETRIES || !processingError) {
          setIsProcessing(false);
        }
        processingRef.current = false;
      }
    }, [isStreaming, onClassificationResult, retryCount, processingError]);

    // Update processFrameRef whenever processFrame changes
    useEffect(() => {
      processFrameRef.current = processFrame;
    }, [processFrame]);

    /**
     * Start/stop real-time classification
     */
    useEffect(() => {
      if (enableRealTimeClassification && isStreaming) {
        // Start interval for frame processing
        intervalRef.current = setInterval(() => {
          if (processFrameRef.current) {
            processFrameRef.current(); // Use ref to avoid dependency
          }
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
      // Removed processFrame dependency to prevent infinite loop
    ]);

    const startStream = useCallback(
      async (opts = {}) => {
        try {
          setError("");
          stopStream();

          // Mark component as mounted when starting stream
          isMountedRef.current = true;

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

    // Auto-start camera on mount
    useEffect(() => {
      if (
        typeof navigator !== "undefined" &&
        navigator.mediaDevices?.getUserMedia
      ) {
        startStream().catch(() => {});
      } else {
        setError("Browser tidak mendukung akses kamera (getUserMedia).");
      }

      // Cleanup on unmount
      return () => {
        stopStream();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount/unmount

    // Expose stopStream to parent component via ref
    useImperativeHandle(
      ref,
      () => ({
        stopStream,
      }),
      [stopStream]
    );

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
          else if (document.webkitExitFullscreen)
            document.webkitExitFullscreen();
        }
      } catch (err) {
        console.error("Fullscreen error:", err);
      }
    };

    return (
      <div
        ref={containerRef}
        className={`relative flex-1 bg-black ${className}`}
      >
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
              <span className="text-white text-sm font-medium">
                Memproses...
              </span>
            </div>
          </div>
        )}

        {/* T050: Service Unavailable - User-Friendly Message */}
        {serviceUnavailable && !isStreaming && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="max-w-sm mx-4 text-center">
              {/* Friendly Icon */}
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center animate-pulse">
                  <svg
                    className="w-8 h-8 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* User-Friendly Message */}
              <h3 className="text-lg font-semibold text-white mb-2">
                Layanan Sedang Tidak Tersedia
              </h3>
              <p className="text-sm text-gray-300 mb-6">
                Sistem klasifikasi tidak dapat dijangkau saat ini. Kamera telah
                dinonaktifkan untuk menghemat daya perangkat Anda.
              </p>

              {/* Refresh Action Button */}
              <button
                onClick={() => {
                  window.location.reload(); // Refresh page to retry
                }}
                className="px-6 py-3 text-sm font-semibold text-black bg-emerald-500 hover:bg-emerald-400 rounded-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105"
              >
                � Muat Ulang Halaman
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
  }
);

LiveCameraView.displayName = "LiveCameraView";

export { LiveCameraView };
