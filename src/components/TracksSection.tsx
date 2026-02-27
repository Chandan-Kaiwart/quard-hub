import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield, Lock, Brain, Globe,
  Link2, Smartphone, Radio, Cpu
} from "lucide-react";

const tracks = [
  { icon: Cpu, title: "Quantum Security", tag: "QS-01", desc: "Quantum computing threats and quantum-safe defense mechanisms" },
  { icon: Lock, title: "Post-Quantum Cryptography", tag: "PQC-02", desc: "NIST-approved algorithms and lattice-based cryptographic systems" },
  { icon: Shield, title: "Cryptography", tag: "CR-03", desc: "Modern encryption standards, zero-knowledge proofs, and protocols" },
  { icon: Brain, title: "AI in Cybersecurity", tag: "AI-04", desc: "Machine learning for threat detection and adversarial AI attacks" },
  { icon: Globe, title: "Dark Web Analysis", tag: "DW-05", desc: "OSINT techniques, Tor network forensics, and threat intelligence" },
  { icon: Link2, title: "Blockchain Forensics", tag: "BF-06", desc: "Cryptocurrency tracing, smart contract auditing, DeFi exploits" },
  { icon: Smartphone, title: "Mobile Forensics", tag: "MF-07", desc: "Android/iOS acquisition, app analysis, and mobile malware" },
  { icon: Radio, title: "UAV Forensics", tag: "UF-08", desc: "Drone data extraction, flight log analysis, and counter-UAV tech" },
];

const TracksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="tracks" className="py-24 relative">
      <div className="section-divider mb-24" />
      <div className="container mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em]">
            // Workshop Tracks
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold mt-4">
            8 <span className="text-gradient-gold">Specialized</span> Tracks
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tracks.map((track, i) => (
            <motion.div
              key={track.tag}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              className="gold-border rounded-xl p-6 bg-card/30 backdrop-blur-sm group hover:bg-card/60 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <track.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-mono text-[10px] text-primary/60 tracking-widest">{track.tag}</span>
              </div>
              <h3 className="font-heading text-base font-bold mb-2">{track.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{track.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TracksSection;
