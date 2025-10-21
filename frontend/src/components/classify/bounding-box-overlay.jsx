/**
 * Komponen BoundingBoxOverlay
 * Menampilkan kotak pembatas untuk objek sampah yang terdeteksi dalam feed kamera real-time
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

  // Validasi ukuran dari video dan display
  if (
    !videoSize?.width ||
    !videoSize?.height ||
    !displaySize?.width ||
    !displaySize?.height
  ) {
    return null;
  }

  /**
   * Hitung transformasi untuk koordinat bounding box
   * Menangani mode object-fit 'cover' dan 'contain'
   */
  const calculateTransform = () => {
    const videoAspect = videoSize.width / videoSize.height;
    const displayAspect = displaySize.width / displaySize.height;

    let scale = { x: 1, y: 1 };
    let offset = { x: 0, y: 0 };

    if (objectFit === "cover") {
      // Video di-scale untuk mengisi container (mungkin terpotong)
      if (videoAspect > displayAspect) {
        // Video lebih lebar - tinggi sesuai, lebar terpotong
        scale.y = displaySize.height / videoSize.height;
        scale.x = scale.y;
        offset.x = (displaySize.width - videoSize.width * scale.x) / 2;
      } else {
        // Video lebih tinggi - lebar sesuai, tinggi terpotong
        scale.x = displaySize.width / videoSize.width;
        scale.y = scale.x;
        offset.y = (displaySize.height - videoSize.height * scale.y) / 2;
      }
    } else {
      // contain - Video di-scale untuk muat dalam container (mungkin ada letterbox)
      if (videoAspect > displayAspect) {
        // Video lebih lebar - lebar sesuai, tinggi ada letterbox
        scale.x = displaySize.width / videoSize.width;
        scale.y = scale.x;
        offset.y = (displaySize.height - videoSize.height * scale.y) / 2;
      } else {
        // Video lebih tinggi - tinggi sesuai, lebar ada letterbox
        scale.y = displaySize.height / videoSize.height;
        scale.x = scale.y;
        offset.x = (displaySize.width - videoSize.width * scale.x) / 2;
      }
    }

    return { scale, offset };
  };

  const { scale, offset } = calculateTransform();

  /**
   * Transformasi koordinat bounding box dari ruang video ke ruang tampilan
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
        // Ekstrak koordinat bbox (handle flat dan nested bbox)
        const bbox = detection.bbox || detection;
        const { x, y, width, height } = bbox;
        const category = detection.category || detection.label;
        const confidence = detection.confidence;

        // Validasi koordinat - skip jika tidak valid
        if (
          !Number.isFinite(x) ||
          !Number.isFinite(y) ||
          !Number.isFinite(width) ||
          !Number.isFinite(height)
        ) {
          console.warn(
            `Koordinat bbox tidak valid untuk deteksi ${index}:`,
            detection
          );
          return null;
        }

        // Skip jika lebar atau tinggi 0 atau negatif
        if (width <= 0 || height <= 0) {
          console.warn(`Ukuran bbox tidak valid untuk deteksi ${index}:`, {
            x,
            y,
            width,
            height,
          });
          return null;
        }

        // Transformasi koordinat ke ruang tampilan
        const transformed = transformBbox({ x, y, width, height });

        // Warna berdasarkan kategori sampah
        const colorMap = {
          organik: "#22c55e", // hijau
          anorganik: "#3b82f6", // biru
          lainnya: "#eab308", // kuning
        };

        const color = colorMap[category?.toLowerCase()] || "#6b7280"; // default abu-abu

        // Hitung ukuran responsif
        const cornerLength = Math.min(
          20,
          transformed.width * 0.15,
          transformed.height * 0.15
        );
        const strokeWidth = Math.max(2, Math.min(4, transformed.width * 0.01));

        return (
          <g key={`detection-${index}`}>
            {/* Persegi panjang bounding box */}
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

            {/* Penanda sudut - Kiri Atas */}
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

            {/* Penanda sudut - Kanan Atas */}
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

            {/* Penanda sudut - Kiri Bawah */}
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

            {/* Penanda sudut - Kanan Bawah */}
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

            {/* Latar belakang label */}
            <rect
              x={transformed.x}
              y={transformed.y - 30}
              width={Math.max((category?.length || 0) * 8 + 40, 100)}
              height="28"
              fill={color}
              rx="4"
              opacity="0.9"
            />

            {/* Teks label */}
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
