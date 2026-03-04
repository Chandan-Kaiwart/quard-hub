import { motion } from "framer-motion";
import { Shield, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const HeroSection = () => {
  const [seatsLeft, setSeatsLeft] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/registration-stats");
        const data = await res.json();
        if (data.left !== undefined) {
          setSeatsLeft(data.left);
        }
      } catch (error) {
        console.error("Failed to fetch registration stats:", error);
      }
    };
    fetchStats();
  }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-bg">
      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

      {/* Orbit rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="orbit-ring absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full border border-primary/20" />
        <div className="orbit-ring-reverse absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-primary/10" />
        <div className="orbit-ring-slow absolute w-[200px] h-[200px] md:w-[300px] md:h-[300px] rounded-full border border-primary/30" />

        {/* Orbit dots */}
        <div className="orbit-ring absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full shadow-[0_0_15px_hsl(42,100%,50%,0.8)]" />
        </div>
        <div className="orbit-ring-reverse absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary/60 rounded-full" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs tracking-widest text-primary uppercase">
              National Cybersecurity Workshop
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-8xl font-heading font-extrabold mb-4 tracking-tight"
        >
          <span className="text-gradient-gold">QTF - 2026</span>
          
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-mono text-xs md:text-sm text-muted-foreground tracking-[0.2em] uppercase mb-8"
        >
          Quantum Technologies: A Roadmap for Future
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12"
        >
          <div className="flex items-center gap-3 text-foreground/80">
            <span className="font-mono text-sm">📅 10–11 March 2026</span>
            <span className="text-primary">|</span>
            <span className="font-mono text-sm">📍 NFSU Chennai Campus</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#register"
            className="clip-btn px-10 py-4 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-widest hover:shadow-[var(--shadow-gold)] transition-all duration-300"
          >
            Register Now
          </a>
          <a
            href="#about"
            className="clip-btn px-10 py-4 border border-primary/40 text-foreground font-heading font-bold text-sm uppercase tracking-widest hover:border-primary hover:shadow-[var(--shadow-gold)] transition-all duration-300"
          >
            Learn More
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: "7", label: "Tracks" },
            { value: "2", label: "Days" },
            { value: "8", label: "Speakers" },
            { value: seatsLeft !== null ? seatsLeft.toString() : "...", label: "Seats Left" },
          ].map((stat) => (
            <div key={stat.label} className="stat-card rounded-lg px-6 py-4 text-center">
              <div className="text-2xl md:text-3xl font-heading font-extrabold text-primary">
                {stat.value}
              </div>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-primary/60" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
