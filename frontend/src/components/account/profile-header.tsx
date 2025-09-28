import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Edit } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  email: string;
  joinDate: string;
  onEditClick?: () => void;
  className?: string;
}

const ProfileHeader = ({
  name,
  email,
  joinDate,
  onEditClick,
  className = "",
}: ProfileHeaderProps) => {
  return (
    <Card className={`border border-gray-200 bg-white ${className}`}>
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Profil Pengguna</span>
          </span>
          <Button variant="outline" size="sm" onClick={onEditClick}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">{name}</h2>
            {/* make email text wrap and if the width so full break it */}
            <p className="text-gray-600 mb-2 text-sm break-words">{email}</p>
            <p className="text-sm text-gray-500">Bergabung sejak {joinDate}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { ProfileHeader };
