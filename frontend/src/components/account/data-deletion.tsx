import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Trash2, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface DataDeletionProps {
  onDeleteAccount?: () => Promise<void>;
  onClearHistory?: () => Promise<void>;
  className?: string;
}

const DataDeletion = ({
  onDeleteAccount,
  onClearHistory,
  className = "",
}: DataDeletionProps) => {
  const [isDeleteAccountLoading, setIsDeleteAccountLoading] = useState(false);
  const [isClearHistoryLoading, setIsClearHistoryLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleteAccountLoading(true);
    try {
      await onDeleteAccount?.();
    } finally {
      setIsDeleteAccountLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClearHistory = async () => {
    setIsClearHistoryLoading(true);
    try {
      await onClearHistory?.();
    } finally {
      setIsClearHistoryLoading(false);
      setShowClearConfirm(false);
    }
  };

  return (
    <Card className={`border border-red-200 bg-red-50 ${className}`}>
      <CardHeader className="border-b border-red-200">
        <CardTitle className="flex items-center space-x-2 text-red-800">
          <Shield className="w-5 h-5" />
          <span>Zona Bahaya</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Clear History Section */}
        <div className="bg-white rounded-lg p-4 border border-red-100">
          <div className="flex items-start space-x-3">
            <Trash2 className="w-5 h-5 text-orange-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">
                Hapus Riwayat Klasifikasi
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Menghapus semua riwayat klasifikasi sampah Anda. Data yang
                dihapus tidak dapat dikembalikan.
              </p>

              {showClearConfirm ? (
                <div className="space-y-3">
                  <Alert className="bg-orange-50 border-orange-200 text-orange-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      Yakin ingin menghapus semua riwayat klasifikasi?
                    </span>
                  </Alert>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowClearConfirm(false)}
                      disabled={isClearHistoryLoading}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleClearHistory}
                      disabled={isClearHistoryLoading}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {isClearHistoryLoading ? "Menghapus..." : "Ya, Hapus"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Riwayat
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="bg-white rounded-lg p-4 border border-red-100">
          <div className="flex items-start space-x-3">
            <Trash2 className="w-5 h-5 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">Hapus Akun</h3>
              <p className="text-sm text-gray-600 mb-4">
                Menghapus akun Anda secara permanen beserta semua data yang
                terkait. Tindakan ini tidak dapat dibatalkan.
              </p>

              {showDeleteConfirm ? (
                <div className="space-y-3">
                  <Alert className="bg-red-50 border-red-200 text-red-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      <strong>PERINGATAN:</strong> Akun dan semua data akan
                      dihapus permanen!
                    </span>
                  </Alert>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleteAccountLoading}
                    >
                      Batal
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDeleteAccount}
                      disabled={isDeleteAccountLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleteAccountLoading
                        ? "Menghapus..."
                        : "Ya, Hapus Akun"}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Akun
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { DataDeletion };
