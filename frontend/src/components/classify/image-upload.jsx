import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Upload, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ImageUpload = ({
  onImageUpload,
  onImageRemove,
  loading = false,
  maxSize = 10,
  accept = "image/*",
  className = "",
}) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const validateFile = file => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File terlalu besar. Maksimal ${maxSize}MB`;
    }
    if (!file.type.startsWith("image/")) {
      return "File harus berformat gambar";
    }
    return null;
  };

  const handleFileSelect = file => {
    setError("");

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const preview = e.target?.result;
      const imageData = { file, preview };
      setUploadedImage(imageData);
      onImageUpload?.(file, preview);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = e => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleRemove = () => {
    setUploadedImage(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageRemove?.();
  };

  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className={`shadow-sm border border-gray-200 bg-white ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg md:text-xl text-gray-900 flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>Upload Gambar Sampah</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6">
        {!uploadedImage ? (
          <div
            className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-colors ${
              dragActive
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Camera className="w-12 md:w-16 h-12 md:h-16 text-gray-400 mx-auto mb-4 md:mb-6" />
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              {dragActive ? "Lepaskan file di sini" : "Belum Ada Gambar"}
            </h3>
            <p className="text-gray-600 mb-6 md:mb-8 leading-relaxed">
              Upload gambar sampah untuk melihat hasil klasifikasi dan
              rekomendasi pengelolaan
            </p>

            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Drag & drop gambar di sini</p>
                <p className="text-gray-500 text-sm">atau</p>
              </div>

              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                {loading ? "Memproses..." : "Pilih File"}
              </Button>

              <p className="text-xs text-gray-500">
                Format: JPG, PNG, GIF (Max: {maxSize}MB)
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-gray-300 rounded-xl p-4 bg-white">
              <div className="aspect-square bg-white rounded-lg overflow-hidden mb-4 relative">
                <Image
                  src={uploadedImage.preview}
                  alt="Uploaded waste"
                  fill
                  className="object-cover"
                />
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <RotateCcw className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p>Menganalisis...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-gray-700 font-medium mb-2">
                  {loading
                    ? "Sedang menganalisis..."
                    : "Gambar berhasil diupload!"}
                </p>
                <p className="text-gray-600 text-sm">
                  {uploadedImage.file.name} (
                  {(uploadedImage.file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleReplace}
                disabled={loading}
              >
                Ganti Gambar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleRemove}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-2" />
                Hapus
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};

export { ImageUpload };
