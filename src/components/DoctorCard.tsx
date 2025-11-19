import { ChevronRight } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  image: string;
}

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <button className="w-[263px] h-[93px] bg-white rounded-2xl p-3 flex items-center justify-between shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-[60px] h-[60px] rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          <ImageWithFallback
            src={doctor.image}
            alt={doctor.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 text-left min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">
            {doctor.name}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5 truncate">
            {doctor.specialty}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            {doctor.experience}
          </p>
        </div>
      </div>

      <ChevronRight
        size={18}
        className="text-gray-400 flex-shrink-0 ml-2"
      />
    </button>
  );
}