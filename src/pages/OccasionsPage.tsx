import { motion } from "framer-motion";
import { useOccasions } from "@/hooks/useOccasions";
import { OccasionCard } from "@/components/OccasionCard";
import { Skeleton } from "@/components/ui/skeleton";

const OccasionsPage = () => {
  const { data: occasions, isLoading } = useOccasions();

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold font-amiri mb-4">
            المناسبات
          </h1>
          <p className="text-muted-foreground">
            تصفح القصائد حسب المناسبة الدينية
          </p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="w-24 h-px bg-gradient-to-r from-transparent to-primary" />
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-24 h-px bg-gradient-to-l from-transparent to-primary" />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {occasions?.map((occasion, index) => (
              <OccasionCard key={occasion.id} occasion={occasion} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OccasionsPage;
