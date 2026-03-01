import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield, Lock, Brain, Globe,
  Link2, Smartphone, Radio, Cpu, Search
} from "lucide-react";

const tracks = [
  {
    icon: Cpu,
    title: "Quantum Security",
    tag: "QS-01",
    desc: "Examining quantum computing threats to classical cryptography and advancing quantum-resistant security architectures.",
  },
  {
    icon: Lock,
    title: "Post & Pre Quantum Secure Communications",
    tag: "QS-02",
    desc: "Understanding classical cryptographic protocols and transitioning to quantum-safe communication frameworks.",
  },
  {
    icon: Globe,
    title: "AI for Cybersecurity",
    tag: "QS-03",
    desc: "Applying artificial intelligence to strengthen proactive threat detection and adaptive cyber defence systems.",
  },
  {
    icon: Shield,
    title: "Cryptography",
    tag: "QS-04",
    desc: "Modern encryption primitives, protocols, and applied cryptographic engineering.",
  },
  {
    icon: Link2,
    title: "Blockchain Security",
    tag: "QS-05",
    desc: "Analyzing vulnerabilities and defensive strategies in blockchain systems and secure decentralized infrastructures.",
  },
  {
    icon: Radio,
    title: "Collection and Preservation in UAV/Drone Forensics",
    tag: "QS-06",
    desc: "Forensic acquisition, analysis, and preservation of digital evidence from unmanned aerial systems.",
  },
  {
    icon: Search,
    title: "Dark Web Investigation",
    tag: "QS-07",
    desc: "Investigating technologies, structures, and methodologies used to detect and track illicit activities on the dark web.",
  },
  {
    icon: Smartphone,
    title: "Investigation of Crime Through Mobile Forensics",
    tag: "QS-08",
    desc: "Utilizing mobile forensic techniques to reconstruct events and establish digital evidence in criminal investigations.",
  },
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
            <span className="text-gradient-gold">Specialized</span> Tracks
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-muted-foreground">
            Eight specialized focus areas across quantum security, AI-driven defense systems,
            cryptography, blockchain systems, and digital forensics.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-6 gap-6 items-stretch w-full max-w-6xl mx-auto">
          {tracks.map((track, i) => (
            <motion.div
              key={track.tag}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 * i }}
              className={`gold-border rounded-xl p-6 bg-card/30 backdrop-blur-sm group hover:bg-card/60 transition-all duration-300 flex flex-col h-full sm:col-span-2 ${
                i === 6 ? "sm:col-start-2" : i === 7 ? "sm:col-start-4" : ""
              }`}
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
