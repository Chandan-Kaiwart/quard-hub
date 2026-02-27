import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Users, Lightbulb } from "lucide-react";

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 relative">
      <div className="section-divider mb-24" />
      <div className="container mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em]">
            // About the Workshop
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold mt-4 mb-6">
            Defending the <span className="text-gradient-gold">Digital Frontier</span>
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            QUARD² brings together leading cybersecurity researchers, AI experts, and quantum computing pioneers
            for an intensive two-day workshop at the National Forensics Science University, Chennai Campus.
            Explore cutting-edge topics from post-quantum cryptography to UAV forensics.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Hands-On Labs",
              desc: "Interactive sessions with real-world cybersecurity scenarios, forensic analysis tools, and quantum-safe encryption implementations.",
            },
            {
              icon: Users,
              title: "Expert Network",
              desc: "Connect with industry leaders, academic researchers, and fellow cybersecurity enthusiasts from across the nation.",
            },
            {
              icon: Lightbulb,
              title: "Future-Ready Skills",
              desc: "Master emerging technologies in AI-driven security, blockchain forensics, and post-quantum cryptographic standards.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 * (i + 1) }}
              className="gold-border rounded-xl p-8 bg-card/50 backdrop-blur-sm group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
