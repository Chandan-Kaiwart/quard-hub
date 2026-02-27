import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Clock } from "lucide-react";

const scheduleData = {
  day1: {
    date: "March 10, 2026",
    events: [
      { time: "09:00 ONWARDS", title: "Kit Distribution" },
      { time: "10:00 – 10:30", title: "Inaugural Ceremony & Keynote", type: "Keynote" },
      { time: "10:30 – 11:45", title: "SESSION 1", type: "Technical Session" },
      { time: "11:45 – 12:00", title: "Tea Break", type: "Break" },
      { time: "12:00 – 13:30", title: "SESSION 2", type: "Technical Session" },
      { time: "13:30 – 14:30", title: "LUNCH BREAK", type: "Break" },
      { time: "14:30 – 15:45", title: "SESSION 3", type: "Technical Session" },
      { time: "15:45 – 16:00", title: "TEA BREAK", type: "Break" },
      { time: "16:00 – 17:15", title: "SESSION 4", type: "Technical Session" },

    ],
  },
  day2: {
    date: "March 11, 2026",
    events: [
      { time: "10:00 – 11:15", title: "SESSION 5", type: "Technical Session" },
      { time: "11:15 – 11:30", title: "TEA Break", type: "Break" },
      { time: "11:30 – 12:45", title: "SESSION 6", type: "Technical Session" },
      { time: "12:45 – 13:45", title: "Lunch Break", type: "Break" },
      { time: "13:45 – 15:00", title: "SESSION 7", type: "Technical Session" },
      { time: "15:00 – 15:15", title: "TEA Break", type: "Break" },
      { time: "15:15 – 16:30", title: "SESSION 8", type: "Technical Session" },
      { time: "16:30 – 17:45", title: "SESSION 9", type: "Technical Session" },
      { time: "17:45 – 18:00", title: "Valedictory", type: "General" },
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
              className={`clip-btn px-8 py-3 font-heading font-bold text-sm uppercase tracking-widest transition-all duration-300 ${activeDay === day
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
