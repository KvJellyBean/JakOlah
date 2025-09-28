import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ClassificationHistoryItem {
  id: string;
  imageUrl: string;
  result: string;
  confidence: number;
  date: string;
  status: "success" | "error";
}

interface ClassificationHistoryProps {
  history: ClassificationHistoryItem[];
  onViewDetails?: (id: string) => void;
  className?: string;
}

const ClassificationHistory = ({
  history,
  onViewDetails,
  className = "",
}: ClassificationHistoryProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = history.slice(startIndex, endIndex);
  const getStatusColor = (status: ClassificationHistoryItem["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={`border border-gray-200 bg-white ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Riwayat Klasifikasi</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-6">
        {history.length === 0 ? (
          <div className="text-center py-8 px-6">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada riwayat klasifikasi</p>
          </div>
        ) : (
          <>
            {/* Mobile optimized list for small screens */}
            <div className="block md:hidden">
              <div className="space-y-4 p-4">
                {currentItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <Image
                        src={item.imageUrl}
                        alt="Klasifikasi"
                        width={40}
                        height={40}
                        className="object-cover rounded-md flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm truncate">
                            {item.result}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}
                          >
                            {item.status === "success" ? "✓" : "✗"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>{(item.confidence * 100).toFixed(1)}%</div>
                          <div>{item.date}</div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails?.(item.id)}
                      className="ml-2 flex-shrink-0"
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop table for larger screens */}
            <div className="hidden md:block overflow-x-auto">
              <div className="px-6">
                <div className="space-y-4">
                  {currentItems.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <Image
                          src={item.imageUrl}
                          alt="Klasifikasi"
                          width={48}
                          height={48}
                          className="object-cover rounded-md"
                        />
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {item.result}
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}
                            >
                              {item.status === "success" ? "Berhasil" : "Error"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>
                              Akurasi: {(item.confidence * 100).toFixed(1)}%
                            </span>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{item.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails?.(item.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detail
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100 px-4 md:px-6 space-y-3 sm:space-y-0">
                <div className="text-sm text-gray-500 order-2 sm:order-1">
                  {startIndex + 1}-{Math.min(endIndex, history.length)} dari{" "}
                  {history.length} riwayat
                </div>
                <div className="flex items-center space-x-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(prev => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="text-xs"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Sebelumnya</span>
                  </Button>
                  <span className="text-sm text-gray-600 px-2">
                    {currentPage}/{totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage(prev => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="text-xs"
                  >
                    <span className="hidden sm:inline">Selanjutnya</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 sm:ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export { ClassificationHistory };
export type { ClassificationHistoryItem };
