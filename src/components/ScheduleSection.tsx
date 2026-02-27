import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Clock, MapPin } from "lucide-react";

const scheduleData = {
  day1: {
    date: "March 10, 2026",
    events: [
      { time: "08:30 – 09:30", title: "Registration & Kit Collection", venue: "Main Hall", type: "logistics" },
      { time: "09:30 – 10:30", title: "Inaugural Ceremony & Keynote", venue: "Auditorium", type: "keynote" },
      { time: "10:30 – 11:00", title: "Networking Break", venue: "Lobby", type: "break" },
      { time: "11:00 – 13:00", title: "Track Sessions — Quantum Security & Post-Quantum Crypto", venue: "Lab A & B", type: "session" },
      { time: "13:00 – 14:00", title: "Lunch Break", venue: "Cafeteria", type: "break" },
      { time: "14:00 – 16:00", title: "Track Sessions — AI Cybersecurity & Cryptography", venue: "Lab C & D", type: "session" },
      { time: "16:00 – 16:30", title: "Tea Break", venue: "Lobby", type: "break" },
      { time: "16:30 – 18:00", title: "Hands-On Lab: Penetration Testing with AI", venue: "Cyber Lab", type: "workshop" },
    ],
  },
  day2: {
    date: "March 11, 2026",
    events: [
      { time: "09:00 – 11:00", title: "Track Sessions — Dark Web Analysis & Blockchain Forensics", venue: "Lab A & B", type: "session" },
      { time: "11:00 – 11:30", title: "Networking Break", venue: "Lobby", type: "break" },
      { time: "11:30 – 13:00", title: "Track Sessions — Mobile Forensics & UAV Forensics", venue: "Lab C & D", type: "session" },
      { time: "13:00 – 14:00", title: "Lunch Break", venue: "Cafeteria", type: "break" },
      { time: "14:00 – 16:00", title: "CTF Competition — Capture The Flag", venue: "Cyber Lab", type: "workshop" },
      { time: "16:00 – 16:30", title: "Tea Break", venue: "Lobby", type: "break" },
      { time: "16:30 – 17:30", title: "Panel Discussion: Future of Cybersecurity", venue: "Auditorium", type: "keynote" },
      { time: "17:30 – 18:30", title: "Valedictory & Certificate Distribution", venue: "Auditorium", type: "logistics" },
    ],
  },
};

const typeColors: Record<string, string> = {
  keynote: "bg-primary/20 text-primary",
  session: "bg-violet-mid/60 text-foreground",
  workshop: "bg-primary/10 text-primary",
  break: "bg-muted/30 text-muted-foreground",
  logistics: "bg-secondary text-secondary-foreground",
};

const ScheduleSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeDay, setActiveDay] = useState<"day1" | "day2">("day1");
  const schedule = scheduleData[activeDay];

  return (
    <section id="schedule" className="py-24 relative">
      <div className="section-divider mb-24" />
      <div className="container mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em]">
            // Event Schedule
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold mt-4">
            Two Days of <span className="text-gradient-gold">Innovation</span>
          </h2>
        </motion.div>

        {/* Day Tabs */}
        <div className="flex justify-center gap-4 mb-12">
          {(["day1", "day2"] as const).map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`clip-btn px-8 py-3 font-heading font-bold text-sm uppercase tracking-widest transition-all duration-300 ${
                activeDay === day
                  ? "bg-primary text-primary-foreground shadow-[var(--shadow-gold)]"
                  : "border border-primary/30 text-foreground hover:border-primary/60"
              }`}
            >
              {day === "day1" ? "Day 1" : "Day 2"}
            </button>
          ))}
        </div>

        <motion.p
          key={activeDay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center font-mono text-sm text-muted-foreground mb-8"
        >
          {schedule.date}
        </motion.p>

        <div className="max-w-3xl mx-auto space-y-4">
          {schedule.events.map((event, i) => (
            <motion.div
              key={`${activeDay}-${i}`}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 * i }}
              className="gold-border rounded-lg p-5 bg-card/30 backdrop-blur-sm flex flex-col md:flex-row md:items-center gap-4"
            >
              <div className="flex items-center gap-3 md:w-48 shrink-0">
                <Clock className="w-4 h-4 text-primary/60" />
                <span className="font-mono text-xs text-primary">{event.time}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-heading text-sm font-bold">{event.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{event.venue}</span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ${typeColors[event.type]}`}>
                {event.type}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
