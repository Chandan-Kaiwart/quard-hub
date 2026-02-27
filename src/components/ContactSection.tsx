import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Mail, Phone, MapPin, ExternalLink } from "lucide-react";

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="py-24 relative">
      <div className="section-divider mb-24" />
      <div className="container mx-auto px-6" ref={ref}>
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

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: Mail,
              title: "Email",
              value: "quard2@nfsu.ac.in",
              href: "mailto:quard2@nfsu.ac.in",
            },
            {
              icon: Phone,
              title: "Phone",
              value: "+91 44 XXXX XXXX",
              href: "tel:+914400000000",
            },
            {
              icon: MapPin,
              title: "Venue",
              value: "NFSU Chennai Campus, Tamil Nadu",
              href: "https://maps.google.com",
            },
          ].map((item, i) => (
            <motion.a
              key={item.title}
              href={item.href}
              target={item.title === "Venue" ? "_blank" : undefined}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 * i }}
              className="gold-border rounded-xl p-8 bg-card/30 backdrop-blur-sm text-center group hover:bg-card/60 transition-all duration-300 block"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-base font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
                {item.value}
                {item.title === "Venue" && <ExternalLink className="w-3 h-3" />}
              </p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
