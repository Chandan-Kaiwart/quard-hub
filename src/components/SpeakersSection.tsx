import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const speakers = [
  { name: "Dr. Priya Sharma", role: "Quantum Cryptography Lead", org: "IIT Madras", avatar: "PS" },
  { name: "Prof. Rajesh Kumar", role: "AI Security Researcher", org: "IISC Bangalore", avatar: "RK" },
  { name: "Dr. Ananya Menon", role: "Blockchain Forensics Expert", org: "NFSU Gujarat", avatar: "AM" },
  { name: "Mr. Vikram Singh", role: "Ethical Hacker & OSINT Specialist", org: "CyberPeace Foundation", avatar: "VS" },
  { name: "Dr. Kavitha Rajan", role: "Mobile Forensics Researcher", org: "CDAC Thiruvananthapuram", avatar: "KR" },
  { name: "Prof. Arun Balaji", role: "UAV Systems & Drone Forensics", org: "Anna University", avatar: "AB" },
];

const SpeakersSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="speakers" className="py-24 relative">
      <div className="section-divider mb-24" />
      <div className="container mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em]">
            // Featured Speakers
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold mt-4">
            Industry <span className="text-gradient-gold">Experts</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {speakers.map((speaker, i) => (
            <motion.div
              key={speaker.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              className="gold-border rounded-xl p-8 bg-card/30 backdrop-blur-sm text-center group hover:bg-card/60 transition-all duration-300"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto mb-6 group-hover:border-primary/60 group-hover:shadow-[var(--shadow-gold)] transition-all duration-300">
                <span className="font-heading text-xl font-extrabold text-primary">
                  {speaker.avatar}
                </span>
              </div>
              <h3 className="font-heading text-lg font-bold mb-1">{speaker.name}</h3>
              <p className="font-mono text-xs text-primary mb-2">{speaker.role}</p>
              <p className="text-muted-foreground text-sm">{speaker.org}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpeakersSection;
