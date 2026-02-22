import { motion } from "framer-motion";
import { useOccasions } from "@/hooks/useOccasions";
import { usePoems } from "@/hooks/usePoems";
import { OccasionCard } from "@/components/OccasionCard";
import { PoemCard } from "@/components/PoemCard";
import { Skeleton } from "@/components/ui/skeleton";
import patternBg from "@/assets/islamic-pattern-bg.jpg";
import heroImage from "@/assets/hero-image.jpg";
import logo from "@/assets/logo.png";

const Index = () => {
  const { data: occasions, isLoading: occasionsLoading } = useOccasions();
  const { data: poems, isLoading: poemsLoading } = usePoems();

  const latestPoems = poems?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${patternBg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <motion.div
              className="text-center lg:text-right flex-1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-4 mb-6">
                <img
                  src={logo}
                  alt="شعار موكب عزاء جدحفص"
                  className="w-24 h-24 rounded-full border-4 border-primary glow-gold object-cover"
                />
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-gold mb-4 font-amiri">
                موكب عزاء جدحفص
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                منصة القصائد الحسينية - إحياء الشعائر
              </p>
              <p className="text-foreground/70 max-w-lg mx-auto lg:mr-0">
                اكتشف وشارك القصائد الحسينية المتعلقة بالمناسبات الدينية المختلفة
              </p>
            </motion.div>

            <motion.div
              className="flex-1 relative max-w-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img
                src={heroImage}
                alt="المقام الشريف"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
              <div className="absolute -inset-4 border-2 border-primary/20 rounded-2xl -z-10" />
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
      </section>

      {/* Occasions Section */}
      <section className="py-16 pattern-overlay" id="occasions">
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-gold font-amiri mb-4">
              اختر المناسبة
            </h2>
            <p className="text-muted-foreground">
              تصفح القصائد حسب المناسبة الدينية
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-primary" />
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-primary" />
            </div>
          </motion.div>

          {occasionsLoading ? (
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
      </section>

      {/* Latest Poems Section */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-gold font-amiri mb-4">
              أحدث القصائد
            </h2>
            <p className="text-muted-foreground">
              آخر القصائد المضافة إلى المنصة
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-primary" />
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-primary" />
            </div>
          </motion.div>

          {poemsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : latestPoems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestPoems.map((poem, index) => (
                <PoemCard key={poem.id} poem={poem} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                لا توجد قصائد حتى الآن. كن أول من يضيف قصيدة!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;
