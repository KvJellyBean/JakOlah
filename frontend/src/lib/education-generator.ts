/**
 * Education Content Generator
 * Generates contextual waste disposal recommendations based on classification results
 * This replaces static education_content in waste_categories table
 */

export interface ClassificationResult {
  categoryCode: "ORG" | "ANO" | "LAI";
  confidence: number;
  allConfidences: {
    organik: number;
    anorganik: number;
    lainnya: number;
  };
}

export interface EducationContent {
  category: string;
  disposal_guidance: string;
  local_facilities: string[];
  tips: string[];
  environmental_impact: string;
  confidence_note?: string | undefined;
}

/**
 * Generate education content based on classification result
 * Rule-based system considering confidence level and classification outcome
 */
export function generateEducationContent(
  result: ClassificationResult
): EducationContent {
  const { categoryCode, confidence } = result;

  const lowConfidence = confidence < 70;
  const confidenceNote = lowConfidence
    ? `⚠️ Tingkat kepercayaan rendah (${confidence.toFixed(1)}%). Silakan periksa kembali atau konsultasikan dengan petugas.`
    : undefined;

  switch (categoryCode) {
    case "ORG":
      return {
        category: "Sampah Organik",
        disposal_guidance:
          "Sampah organik dapat dikompos atau dibuang ke TPS terdekat. Pisahkan dari sampah lainnya untuk hasil terbaik.",
        local_facilities: [
          "TPS (Tempat Pembuangan Sementara)",
          "Bank Sampah yang menerima kompos",
          "Fasilitas pengomposan komunal",
        ],
        tips: [
          "Buat kompos di rumah jika memungkinkan",
          "Kemas dalam kantong yang mudah terurai",
          "Buang sebelum membusuk untuk menghindari bau",
          "Koordinasi dengan jadwal pengangkutan sampah organik",
        ],
        environmental_impact:
          "Kompos dari sampah organik dapat mengurangi volume sampah di TPA hingga 40% dan menghasilkan pupuk berkualitas tinggi.",
        confidence_note: confidenceNote,
      };

    case "ANO":
      return {
        category: "Sampah Anorganik",
        disposal_guidance:
          "Sampah anorganik sebaiknya didaur ulang melalui Bank Sampah atau pemulung untuk nilai ekonomis dan kelestarian lingkungan.",
        local_facilities: [
          "Bank Sampah (prioritas utama)",
          "Pemulung atau pengepul barang bekas",
          "TPS dengan fasilitas pemilahan",
        ],
        tips: [
          "Bersihkan wadah dari sisa makanan sebelum dibuang",
          "Pisahkan berdasarkan jenis material (plastik, kertas, logam)",
          "Cari Bank Sampah terdekat via aplikasi Jakarta Smart City",
          "Manfaatkan nilai ekonomis: plastik PET Rp 3.000-5.000/kg",
        ],
        environmental_impact:
          "Daur ulang 1 ton plastik dapat menghemat 2.000 liter minyak dan mengurangi beban TPA Bantargebang.",
        confidence_note: confidenceNote,
      };

    case "LAI":
      return {
        category: "Sampah Khusus/B3",
        disposal_guidance:
          "Sampah kategori lainnya memerlukan penanganan khusus. JANGAN dicampur dengan sampah biasa karena dapat berbahaya.",
        local_facilities: [
          "Fasilitas Limbah B3",
          "E-waste collection center",
          "Apotek (untuk obat kadaluarsa)",
          "Service center elektronik",
        ],
        tips: [
          "Identifikasi jenis sampah khusus (baterai, elektronik, obat)",
          "Kemas terpisah dan beri label yang jelas",
          "Gunakan sarung tangan saat menangani",
          "Hubungi Call Center DKI: 106 untuk panduan",
        ],
        environmental_impact:
          "Pembuangan yang salah dapat menyebabkan pencemaran tanah dan air serta membahayakan petugas kebersihan.",
        confidence_note: confidenceNote,
      };

    default:
      throw new Error(`Unknown category code: ${categoryCode}`);
  }
}

/**
 * Generate confidence-based recommendation
 * Additional guidance based on confidence levels across all categories
 */
export function generateConfidenceRecommendation(
  allConfidences: ClassificationResult["allConfidences"]
): string {
  const { organik, anorganik, lainnya } = allConfidences;
  const maxConfidence = Math.max(organik, anorganik, lainnya);
  const sortedConfidences = [organik, anorganik, lainnya].sort((a, b) => b - a);
  const secondMax = sortedConfidences[1] || 0;
  const confidenceDiff = maxConfidence - secondMax;

  if (maxConfidence < 50) {
    return "🤔 Gambar sulit diidentifikasi. Coba ambil foto dengan pencahayaan lebih baik atau sudut yang berbeda.";
  }

  if (confidenceDiff < 15) {
    return `⚠️ Hasil klasifikasi kurang pasti. Pertimbangkan untuk memisahkan sampah atau konsultasi dengan petugas kebersihan.`;
  }

  if (maxConfidence > 85) {
    return "✅ Klasifikasi sangat yakin. Ikuti panduan pembuangan yang diberikan.";
  }

  return "👍 Klasifikasi cukup yakin. Silakan ikuti panduan pembuangan.";
}

/**
 * Get facility recommendations based on classification and user location
 * This would integrate with the facilities API
 */
export function getFacilityRecommendations(
  categoryCode: ClassificationResult["categoryCode"],
  userLocation?: { lat: number; lng: number }
): string[] {
  const baseRecommendations: Record<string, string[]> = {
    ORG: ["TPS terdekat", "Bank Sampah dengan fasilitas kompos"],
    ANO: ["Bank Sampah terdekat", "Pengepul barang bekas"],
    LAI: ["Fasilitas Limbah B3", "Drop-off point khusus"],
  };

  const recommendations = baseRecommendations[categoryCode] || [];

  if (userLocation) {
    return [...recommendations, "Lihat peta fasilitas terdekat →"];
  }

  return recommendations;
}
