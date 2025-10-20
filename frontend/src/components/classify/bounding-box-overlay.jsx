/**
 * BoundingBoxOverlay Component
 * Displays bounding boxes for detected waste objects in real-time camera feed
 * Handles coordinate transformation for different aspect ratios and object-fit modes
 */
const BoundingBoxOverlay = ({
  detections = [],
  videoSize,
  displaySize,
  objectFit = "cover",
  className = "",
}) => {
  if (!detections || detections.length === 0) {
    return null;
  }

  // Validate sizes
  if (
    !videoSize?.width ||
    !videoSize?.height ||
    !displaySize?.width ||
    !displaySize?.height
  ) {
    return null;
  }

  /**
   * Calculate transformation for bounding box coordinates
   * Handles both 'cover' and 'contain' object-fit modes
   */
  const calculateTransform = () => {
    const videoAspect = videoSize.width / videoSize.height;
    const displayAspect = displaySize.width / displaySize.height;

    let scale = { x: 1, y: 1 };
    let offset = { x: 0, y: 0 };

    if (objectFit === "cover") {
      // Video is scaled to cover the container (may be cropped)
      if (videoAspect > displayAspect) {
        // Video is wider - height matches, width is cropped
        scale.y = displaySize.height / videoSize.height;
        scale.x = scale.y;
        offset.x = (displaySize.width - videoSize.width * scale.x) / 2;
      } else {
        // Video is taller - width matches, height is cropped
        scale.x = displaySize.width / videoSize.width;
        scale.y = scale.x;
        offset.y = (displaySize.height - videoSize.height * scale.y) / 2;
      }
    } else {
      // contain - Video is scaled to fit within container (may have letterboxing)
      if (videoAspect > displayAspect) {
        // Video is wider - width matches, height has letterbox
        scale.x = displaySize.width / videoSize.width;
        scale.y = scale.x;
        offset.y = (displaySize.height - videoSize.height * scale.y) / 2;
      } else {
        // Video is taller - height matches, width has letterbox
        scale.y = displaySize.height / videoSize.height;
        scale.x = scale.y;
        offset.x = (displaySize.width - videoSize.width * scale.x) / 2;
      }
    }

    return { scale, offset };
  };

  const { scale, offset } = calculateTransform();

  /**
   * Transform bbox coordinates from video space to display space
   */
  const transformBbox = bbox => {
    return {
      x: bbox.x * scale.x + offset.x,
      y: bbox.y * scale.y + offset.y,
      width: bbox.width * scale.x,
      height: bbox.height * scale.y,
    };
  };

  return (
    <svg
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        width: "100%",
        height: "100%",
      }}
    >
      {detections.map((detection, index) => {
        // Extract bbox coordinates (handle both flat and nested bbox)
        const bbox = detection.bbox || detection;
        const { x, y, width, height } = bbox;
        const category = detection.category || detection.label;
        const confidence = detection.confidence;

        // Validate coordinates - skip if invalid
        if (
          !Number.isFinite(x) ||
          !Number.isFinite(y) ||
          !Number.isFinite(width) ||
          !Number.isFinite(height)
        ) {
          console.warn(
            `Invalid bbox coordinates for detection ${index}:`,
            detection
          );
          return null;
        }

        // Skip if width or height is 0 or negative
        if (width <= 0 || height <= 0) {
          console.warn(`Invalid bbox size for detection ${index}:`, {
            x,
            y,
            width,
            height,
          });
          return null;
        }

        // Transform coordinates to display space
        const transformed = transformBbox({ x, y, width, height });

        // Color based on waste category
        const colorMap = {
          organik: "#22c55e", // green
          anorganik: "#3b82f6", // blue
          lainnya: "#eab308", // yellow
        };

        const color = colorMap[category?.toLowerCase()] || "#6b7280"; // default gray

        // Calculate responsive sizes
        const cornerLength = Math.min(
          20,
          transformed.width * 0.15,
          transformed.height * 0.15
        );
        const strokeWidth = Math.max(2, Math.min(4, transformed.width * 0.01));

        return (
          <g key={`detection-${index}`}>
            {/* Bounding box rectangle */}
            <rect
              x={transformed.x}
              y={transformed.y}
              width={transformed.width}
              height={transformed.height}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              rx="4"
            />

            {/* Corner markers - Top Left */}
            <line
              x1={transformed.x}
              y1={transformed.y}
              x2={transformed.x + cornerLength}
              y2={transformed.y}
              stroke={color}
              strokeWidth={strokeWidth + 1}
            />
            <line
              x1={transformed.x}
              y1={transformed.y}
              x2={transformed.x}
              y2={transformed.y + cornerLength}
              stroke={color}
              strokeWidth={strokeWidth + 1}
            />

            {/* Corner markers - Top Right */}
            <line
              x1={transformed.x + transformed.width}
              y1={transformed.y}
              x2={transformed.x + transformed.width - cornerLength}
              y2={transformed.y}
              stroke={color}
              strokeWidth={strokeWidth + 1}
            />
            <line
              x1={transformed.x + transformed.width}
              y1={transformed.y}
              x2={transformed.x + transformed.width}
              y2={transformed.y + cornerLength}
              stroke={color}
              strokeWidth={strokeWidth + 1}
            />

            {/* Corner markers - Bottom Left */}
            <line
              x1={transformed.x}
              y1={transformed.y + transformed.height}
              x2={transformed.x + cornerLength}
              y2={transformed.y + transformed.height}
              stroke={color}
              strokeWidth={strokeWidth + 1}
            />
            <line
              x1={transformed.x}
              y1={transformed.y + transformed.height}
              x2={transformed.x}
              y2={transformed.y + transformed.height - cornerLength}
              stroke={color}
              strokeWidth={strokeWidth + 1}
            />

            {/* Corner markers - Bottom Right */}
            <line
              x1={transformed.x + transformed.width}
              y1={transformed.y + transformed.height}
              x2={transformed.x + transformed.width - cornerLength}
              y2={transformed.y + transformed.height}
              stroke={color}
              strokeWidth={strokeWidth + 1}
            />
            <line
              x1={transformed.x + transformed.width}
              y1={transformed.y + transformed.height}
              x2={transformed.x + transformed.width}
              y2={transformed.y + transformed.height - cornerLength}
              stroke={color}
              strokeWidth={strokeWidth + 1}
            />

            {/* Label background */}
            <rect
              x={transformed.x}
              y={transformed.y - 30}
              width={Math.max((category?.length || 0) * 8 + 40, 100)}
              height="28"
              fill={color}
              rx="4"
              opacity="0.9"
            />

            {/* Label text */}
            <text
              x={transformed.x + 8}
              y={transformed.y - 10}
              fill="white"
              fontSize="14"
              fontWeight="600"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {category || "Unknown"}{" "}
              {confidence ? `${Math.round(confidence * 100)}%` : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export { BoundingBoxOverlay };
