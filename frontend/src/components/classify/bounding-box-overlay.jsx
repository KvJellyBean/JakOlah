/**
 * BoundingBoxOverlay Component
 * Displays bounding boxes for detected waste objects in real-time camera feed
 */
const BoundingBoxOverlay = ({ detections = [], videoSize, className = "" }) => {
  if (!detections || detections.length === 0) {
    return null;
  }

  return (
    <svg
      className={`absolute inset-0 pointer-events-none ${className}`}
      viewBox={`0 0 ${videoSize.width} ${videoSize.height}`}
      preserveAspectRatio="xMidYMid slice"
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

        // Color based on waste category
        const colorMap = {
          organik: "#22c55e", // green
          anorganik: "#3b82f6", // blue
          lainnya: "#eab308", // yellow
        };

        const color = colorMap[category?.toLowerCase()] || "#6b7280"; // default gray

        return (
          <g key={`detection-${index}`}>
            {/* Bounding box rectangle */}
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="none"
              stroke={color}
              strokeWidth="3"
              rx="4"
            />

            {/* Corner markers */}
            <line
              x1={x}
              y1={y}
              x2={x + 20}
              y2={y}
              stroke={color}
              strokeWidth="4"
            />
            <line
              x1={x}
              y1={y}
              x2={x}
              y2={y + 20}
              stroke={color}
              strokeWidth="4"
            />

            <line
              x1={x + width}
              y1={y}
              x2={x + width - 20}
              y2={y}
              stroke={color}
              strokeWidth="4"
            />
            <line
              x1={x + width}
              y1={y}
              x2={x + width}
              y2={y + 20}
              stroke={color}
              strokeWidth="4"
            />

            <line
              x1={x}
              y1={y + height}
              x2={x + 20}
              y2={y + height}
              stroke={color}
              strokeWidth="4"
            />
            <line
              x1={x}
              y1={y + height}
              x2={x}
              y2={y + height - 20}
              stroke={color}
              strokeWidth="4"
            />

            <line
              x1={x + width}
              y1={y + height}
              x2={x + width - 20}
              y2={y + height}
              stroke={color}
              strokeWidth="4"
            />
            <line
              x1={x + width}
              y1={y + height}
              x2={x + width}
              y2={y + height - 20}
              stroke={color}
              strokeWidth="4"
            />

            {/* Label background */}
            <rect
              x={x}
              y={y - 30}
              width={Math.max((category?.length || 0) * 8 + 40, 100)}
              height="28"
              fill={color}
              rx="4"
              opacity="0.9"
            />

            {/* Label text */}
            <text
              x={x + 8}
              y={y - 10}
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
