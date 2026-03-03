import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, MapPin, Phone } from "lucide-react";

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-24 relative">
      <div className="section-divider mb-24" />
      <div className="container mx-auto px-6" ref={ref}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em]">
            // Get in Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold mt-4">
            Contact <span className="text-gradient-gold">Us</span>
          </h2>
        </motion.div>

        {/* Two info cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-10">

          {/* Event Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="gold-border rounded-2xl p-8 bg-card/30 backdrop-blur-sm"
          >
            <h3 className="font-heading text-xl font-extrabold text-primary mb-6">
              Event Information
            </h3>

            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-heading text-sm font-bold text-primary">Date</span>
                </div>
                <p className="text-foreground/80 text-sm pl-6">10–11 March 2026</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="font-heading text-sm font-bold text-primary">Location</span>
                </div>
                <p className="text-foreground/80 text-sm pl-6 leading-relaxed">
                  National Forensics Science University<br />
                  Chennai Campus
                </p>
              </div>
            </div>
          </motion.div>

          {/* Organizing Committee */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="gold-border rounded-2xl p-8 bg-card/30 backdrop-blur-sm"
          >
            <h3 className="font-heading text-xl font-extrabold text-primary mb-6">
              Organizing Committee
            </h3>

            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-heading text-sm font-bold text-primary">For Queries</span>
                </div>
                <div className="space-y-1 pl-6">
                  <p className="text-foreground/80 text-sm">+91-98717 12217</p>
                  <p className="text-foreground/80 text-sm">+91-93287 43418</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-heading text-sm font-bold text-primary">Registration Support</span>
                </div>
                <div className="pl-6">
                  <p className="text-foreground/80 text-sm">+91-80105 70034</p>
                  <p className="text-foreground/80 text-sm">+91-98958 39952</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Locate Us Map */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="mb-8 flex flex-col items-center">
            <h3 className="text-4xl font-heading font-extrabold mb-4">Locate <span className="text-gradient-gold">Us</span></h3>
          </div>
          <div
            className="gold-border rounded-xl overflow-hidden bg-card/30 backdrop-blur-sm relative h-[450px] group cursor-pointer shadow-lg"
            onClick={() => window.open("https://maps.app.goo.gl/mrevf7NaqwVUYXmM9", "_blank")}
          >
            <iframe
              title="NFSU Chennai Campus Location"
              src="https://maps.google.com/maps?q=National+Forensic+Sciences+University,+Chennai+Campus&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter: "invert(92%) hue-rotate(180deg) saturate(0.7) brightness(0.9) contrast(0.95)",
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="pointer-events-none transition-all duration-500 rounded-xl group-hover:scale-105 group-hover:opacity-60"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <MapPin className="w-5 h-5" /> Open in Google Maps
              </span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ContactSection;
