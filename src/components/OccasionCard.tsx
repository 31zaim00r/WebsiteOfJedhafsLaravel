import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame,
  Footprints,
  Heart,
  Star,
  Moon,
  Sunset,
  Calendar,
  Image as ImageIcon
} from "lucide-react";
import type { Occasion } from "@/hooks/useOccasions";
import { getImageUrl } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  flame: Flame,
  footprints: Footprints,
  heart: Heart,
  star: Star,
  moon: Moon,
  sunset: Sunset,
  calendar: Calendar,
};

interface OccasionCardProps {
  occasion: Occasion;
  index?: number;
}

export const OccasionCard = ({ occasion, index = 0 }: OccasionCardProps) => {
  const IconComponent = (occasion.icon && iconMap[occasion.icon]) ? iconMap[occasion.icon] : ImageIcon;
  const imageSrc = occasion.icon_url || getImageUrl(occasion.icon);

  return (
    <Link to={`/poems?occasion=${occasion.id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="h-full group"
      >
        <Card className="relative h-full flex flex-col items-center pt-8 pb-6 px-6 bg-card border-2 border-primary/10 group-hover:border-primary/40 transition-all duration-500 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5">
          {/* Decorative background element */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Image Container */}
          <div className="relative mb-6">
            {/* Outer Glow Wrapper */}
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700" />

            {/* Border and Image */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/20 p-1 group-hover:border-primary transition-colors duration-500 bg-background shadow-inner">
              <div className="w-full h-full rounded-full overflow-hidden">
                {imageSrc ? (
                  <img
                    src={imageSrc}
                    alt={occasion.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement?.classList.add('flex', 'items-center', 'justify-center', 'bg-muted');
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <IconComponent className="w-12 h-12 text-primary/40 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Small floating icon badge */}
            <div className="absolute -bottom-1 -right-1 bg-background border-2 border-primary/20 p-2 rounded-xl shadow-lg group-hover:border-primary/50 transition-colors z-10">
              <IconComponent className="w-4 h-4 text-primary" />
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center space-y-3 flex-1 flex flex-col w-full">
            <h3 className="text-xl md:text-2xl font-bold font-amiri group-hover:text-primary transition-colors duration-300">
              {occasion.name}
            </h3>

            {occasion.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                {occasion.description}
              </p>
            )}

            <div className="pt-4 mt-auto">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-primary py-1.5 px-4 rounded-full bg-primary/5 group-hover:bg-primary/20 transition-all duration-300 border border-primary/10 group-hover:border-primary/30">
                <span>عرض القصائد</span>
                <span className="transform group-hover:translate-x-[-4px] transition-transform">←</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
};
