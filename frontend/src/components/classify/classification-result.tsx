import { BarChart3, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertIcon } from "@/components/ui/alert";

interface ClassificationCategory {
  name: string;
  percentage: number;
  color: "emerald" | "blue" | "red" | "amber" | "purple";
}

interface ClassificationResultProps {
  results?: ClassificationCategory[];
  loading?: boolean;
  error?: string;
  className?: string;
}

const ClassificationResult = ({
  results = [],
  loading = false,
  error,
  className = "",
}: ClassificationResultProps) => {
  if (loading) {
    return (
      <Card
        className={`shadow-sm border border-gray-200 bg-white ${className}`}
      >
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg md:text-xl text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Hasil Klasifikasi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="text-center py-8 md:py-12">
            <div className="w-12 md:w-16 h-12 md:h-16 bg-emerald-100 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center">
              <BarChart3 className="w-6 md:w-8 h-6 md:h-8 text-emerald-600 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Sedang Menganalisis...
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Memproses gambar Anda dengan teknologi AI
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className={`shadow-sm border border-gray-200 bg-white ${className}`}
      >
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg md:text-xl text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Hasil Klasifikasi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Alert variant="destructive">
            <AlertIcon variant="destructive" />
            <AlertDescription>
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return (
      <Card
        className={`shadow-sm border border-gray-200 bg-white ${className}`}
      >
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg md:text-xl text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Hasil Klasifikasi</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="text-center py-8 md:py-12">
            <div className="w-12 md:w-16 h-12 md:h-16 bg-gray-100 rounded-full mx-auto mb-4 md:mb-6 flex items-center justify-center">
              <BarChart3 className="w-6 md:w-8 h-6 md:h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Menunggu Upload
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Upload gambar sampah terlebih dahulu untuk melihat hasil
              klasifikasi dan rekomendasi pengelolaan
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dominantCategory = results.reduce((prev, current) =>
    prev.percentage > current.percentage ? prev : current
  );

  return (
    <Card className={`shadow-sm border border-gray-200 bg-white ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg md:text-xl text-gray-900 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Hasil Klasifikasi</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {/* Classification Results - Confidence Scores */}
        <div className="space-y-4 mb-6">
          {results.map((category, index) => (
            <Progress
              key={index}
              value={category.percentage}
              label={category.name}
              showPercentage={true}
              color={category.color}
            />
          ))}
        </div>

        {/* Prediction */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-2">
            <Info className="w-5 h-5 text-emerald-600 mr-2" />
            <span className="font-medium text-emerald-900">
              Prediksi Dominan:
            </span>
          </div>
          <p className="text-emerald-900 font-semibold text-lg">
            {dominantCategory.name}
          </p>
        </div>

        {/* Management Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-2">
            <Info className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">
              Saran Pengelolaan:
            </span>
          </div>
          <div className="text-blue-900">
            {dominantCategory.name === "Organik" && (
              <div>
                <p className="font-semibold mb-2">Sampah Organik Terdeteksi</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Buat kompos untuk pupuk tanaman</li>
                  <li>• Pisahkan dari sampah lainnya</li>
                  <li>• Dapat digunakan untuk biogas</li>
                  <li>• Berikan ke fasilitas pengomposan</li>
                </ul>
              </div>
            )}
            {dominantCategory.name === "Anorganik" && (
              <div>
                <p className="font-semibold mb-2">
                  Sampah Anorganik Terdeteksi
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Cuci bersih sebelum didaur ulang</li>
                  <li>• Pisahkan berdasarkan jenis (plastik, kertas, logam)</li>
                  <li>• Serahkan ke bank sampah terdekat</li>
                  <li>• Bisa dijadikan kerajinan tangan</li>
                </ul>
              </div>
            )}
            {dominantCategory.name === "Lainnya" && (
              <div>
                <p className="font-semibold mb-2">
                  Sampah Lainnya/Berbahaya Terdeteksi
                </p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Jangan buang sembarangan</li>
                  <li>• Serahkan ke fasilitas khusus B3</li>
                  <li>• Ikuti program take-back produsen</li>
                  <li>• Simpan terpisah dari sampah lain</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { ClassificationResult, type ClassificationCategory };
