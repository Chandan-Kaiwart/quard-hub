"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
  sanitize,
  validateName,
  validateEmail,
  validatePhone,
  validateCollege,
  validateCategory,
  validateFile,
  validateTransactionId,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
} from "./validation";
import qr1000 from "../payment/QUARD UPI 1000.png";
import qr1500 from "../payment/QUARD UPI 1500.jpeg";
import qr2000 from "../payment/QUARD UPI 2000.jpeg";


const categories = [
  { value: "UG_STUDENT/PG_Student", label: "UG Student / PG Student", amount: 1000 },
  { value: "PhD/RESEARCH_SCHOLAR", label: "PhD / Research Scholar", amount: 1500 },
  { value: "FACULTY/Academicians", label: "Faculty / Academicians", amount: 2000 },
];

const QR_IMAGES: Record<string, string> = {
  "UG_STUDENT/PG_Student": qr1000,
  "PhD/RESEARCH_SCHOLAR": qr1500,
  "FACULTY/Academicians": qr2000,
};

const terminalLines = [
  {
    cmd: "sessions_count:",
    val: "9",
    color: "text-primary",
    hint: "A quiz held after each of the 9 sessions — every answer counts",
  },
  {
    cmd: "prize:",
    val: "CISCO_CCST_VOUCHER",
    color: "text-primary",
    hint: "Win a Cisco Certified Security Technician (CCST) voucher — a globally recognised credential",
  },
  {
    cmd: "winners:",
    val: "TOP_3",
    color: "text-primary",
    hint: "The 3 highest scorers across both days walk away with the prize",
  },
  {
    cmd: "eligibility:",
    val: "ALL_REGISTERED_PARTICIPANTS",
    color: "text-primary",
    hint: "Open to everyone — technical or non-technical, all are welcome to compete",
  },
  {
    cmd: "status:",
    val: "OPEN_FOR_REGISTRATION",
    color: "text-green-400",
    hint: "Register now to secure your spot and your chance to win",
  },
];

const RegistrationSection = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [status, setStatus] =
    useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isFull, setIsFull] = useState(false);
  const [seatsLeft, setSeatsLeft] = useState<number | null>(null);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/registration-stats");
        const data = await res.json();
        setSeatsLeft(data.left ?? null);
        if (data.left === 0) {
          setIsFull(true);
        }
      } catch (error) {
        console.error("Failed to check registration status:", error);
      }
    };
    checkStatus();
  }, []);

  // Stagger terminal lines once section is in view
  useEffect(() => {
    if (!isInView) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= terminalLines.length) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [isInView]);

  const registrationAmount =
    categories.find((c) => c.value === selectedCategory)?.amount ?? null;

  const MAX_SEATS = 22;
  const filled = MAX_SEATS - (seatsLeft ?? MAX_SEATS);
  const pct = Math.round((filled / MAX_SEATS) * 100);

  const safeFetch = async (url: string, options: RequestInit) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      let data: any = null;
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        throw new Error(data?.error || "Registration failed.");
      }

      return data;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw new Error("Request timeout. Please try again.");
      }
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const formData = new FormData(e.currentTarget);

      const firstName = sanitize(formData.get("first_name"));
      const lastName = sanitize(formData.get("last_name"));
      const email = sanitize(formData.get("email")).toLowerCase();
      const phone = sanitize(formData.get("phone"));
      const college = sanitize(formData.get("college"));
      const category = sanitize(formData.get("category"));
      const transactionId = sanitize(formData.get("transaction_id"));
      const file = formData.get("college_id") as File | null;

      if (!validateName(firstName))
        throw new Error("Please enter a valid first name.");

      if (!validateName(lastName))
        throw new Error("Please enter a valid last name.");

      if (!validateEmail(email))
        throw new Error("Please enter a valid email address.");

      if (!validatePhone(phone))
        throw new Error("Please enter a valid phone number.");

      if (!validateCollege(college))
        throw new Error("Please enter a valid college/organization.");

      if (!validateCategory(category))
        throw new Error("Please select a valid category.");

      if (!validateTransactionId(transactionId))
        throw new Error("Please enter a valid Transaction ID.");

      if (!validateFile(file))
        throw new Error("Invalid file. Only JPG, PNG, PDF under 4 MB allowed.");

      const payload = new FormData();
      payload.append("first_name", firstName);
      payload.append("last_name", lastName);
      payload.append("email", email);
      payload.append("phone", phone);
      payload.append("college", college);
      payload.append("category", category);
      payload.append("transaction_id", transactionId);
      payload.append("college_id", file!);

      await safeFetch("/api/register", {
        method: "POST",
        body: payload,
      });

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    }
  };

  return (
    <section id="register" className="py-24 relative">
      <div className="section-divider mb-24" />
      <div className="container mx-auto px-6" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-primary uppercase tracking-[0.3em]">
            // Registration
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-extrabold mt-4">
            Secure Your <span className="text-gradient-gold">Spot</span>
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-6">

          {/* ── Seats left bar ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="gold-border rounded-xl px-6 py-4 bg-card/30 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                Seats Available
              </span>
              {seatsLeft === null ? (
                <span className="font-mono text-xs text-primary animate-pulse">
                  loading...
                </span>
              ) : (
                <span className={`font-mono text-sm font-bold ${seatsLeft <= 5 ? "text-red-400" : "text-primary"}`}>
                  {seatsLeft} seats left
                  {seatsLeft <= 5 && (
                    <span className="ml-2 text-xs text-red-400 tracking-widest">⚠ LIMITED</span>
                  )}
                </span>
              )}
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: seatsLeft === null ? "0%" : `${pct}%` }}
              />
            </div>
            {seatsLeft !== null && (
              <p className="font-mono text-[10px] text-muted-foreground/50 mt-2 tracking-wider">
                {filled} of {MAX_SEATS}
              </p>
            )}
          </motion.div>

          {/* ── Quiz Challenge Terminal Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="gold-border rounded-xl bg-card/30 backdrop-blur-sm overflow-hidden"
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-muted/40 border-b border-primary/20">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="font-mono text-xs text-muted-foreground ml-3 tracking-widest">
                quiz_challenge.sh
              </span>
              <span className="ml-auto font-mono text-[10px] text-primary/50 tracking-widest uppercase">
                // Compete &amp; Win
              </span>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 font-mono text-sm">

              {/* Boot line */}
              <div className="flex items-center gap-2">
                <span className="text-primary">▶</span>
                <span className="text-primary/70 animate-pulse tracking-wide">
                  initializing_quiz_challenge...
                </span>
              </div>

              {/* Staggered lines */}
              {terminalLines.map((line, i) =>
                visibleLines > i ? (
                  <motion.div
                    key={line.cmd}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-1"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-primary/50 shrink-0">$</span>
                      <span className="text-foreground/90">
                        {line.cmd}&nbsp;
                        <span className={`${line.color} font-bold`}>{line.val}</span>
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs pl-5 leading-relaxed">
                      <span className="text-primary/40 mr-1">↳</span>
                      {line.hint}
                    </p>
                  </motion.div>
                ) : null
              )}

              {/* CTA line — shown after all lines */}
              {visibleLines >= terminalLines.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="border-t border-primary/20 pt-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold text-base">❯</span>
                    <span className="text-primary font-bold tracking-widest">register --now</span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    ↳ fill the form below ↓
                  </span>
                </motion.div>
              )}

            </div>
          </motion.div>

          {/* ── Form / State cards ── */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {isFull ? (
              <div className="gold-border rounded-xl p-12 bg-card/30 backdrop-blur-sm text-center">
                <AlertCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="font-heading text-2xl font-bold mb-3">
                  Registrations Full
                </h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  We have reached our maximum capacity for this workshop.
                  {""}Thank you for your overwhelming interest!
                </p>
                <div className="mt-8">
                  <a href="#about" className="text-primary hover:underline font-mono text-sm">
                    // Stay tuned for future events
                  </a>
                </div>
              </div>
            ) : status === "success" ? (
              <div className="gold-border rounded-xl p-12 bg-card/30 backdrop-blur-sm text-center">
                <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="font-heading text-2xl font-bold mb-3">
                  Registration Received!
                </h3>
                <p className="text-muted-foreground">
                  Thank you for registering! You will get confirmation email within 24-48 hours after verification of your details.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="gold-border rounded-xl p-8 md:p-12 bg-card/30 backdrop-blur-sm space-y-6"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">First Name *</label>
                    <input name="first_name" required placeholder="First Name"
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Last Name *</label>
                    <input name="last_name" required placeholder="Last Name"
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Email *</label>
                    <input name="email" type="email" required placeholder="Email Address"
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Phone *</label>
                    <input name="phone" type="tel" required placeholder="Phone Number"
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">College / Organization *</label>
                  <input name="college" required placeholder="College / Organization"
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                </div>

                <div>
                  <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                    ID Proof (College/Any Government ID in JPG/PNG/PDF, max 4 MB) *
                  </label>
                  <input name="college_id" type="file" required accept=".jpg,.jpeg,.png,.pdf"
                    className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-primary/30 file:text-sm file:font-mono file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:transition-colors file:cursor-pointer" />
                </div>

                <div>
                  <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Category *</label>
                  <select name="category" required value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {registrationAmount != null && (
                    <p className="mt-3 font-mono text-sm text-primary font-medium">
                      Registration amount: ₹{registrationAmount}
                    </p>
                  )}
                </div>

                {/* QR Code — shown only when a category is selected */}
                {selectedCategory && QR_IMAGES[selectedCategory] && (
                  <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex flex-col items-center gap-3"
                  >
                    <p className="font-mono text-xs text-primary uppercase tracking-wider font-semibold">
                      Scan to Pay — ₹{registrationAmount}
                    </p>
                    <img
                      src={QR_IMAGES[selectedCategory]}
                      alt={`UPI QR code for ₹${registrationAmount}`}
                      className="w-56 h-auto rounded-lg border border-primary/20 shadow-md"
                    />
                    <p className="font-mono text-xs text-muted-foreground text-center">
                      Scan with GPay, PhonePe, Paytm or any BHIM UPI app
                    </p>
                  </motion.div>
                )}

                {selectedCategory && (
                  <div>
                    <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Transaction ID *</label>
                    <input name="transaction_id" required placeholder="Enter UPI Transaction ID"
                      className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                  </div>
                )}

                {/* Registration Details */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <p className="font-mono text-xs text-primary uppercase tracking-wider font-semibold">
                    Registration Details
                  </p>
                  <ul className="space-y-1">
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      Registration fee varies by course.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      After registration confirmation email will be sent along with payment details.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      After verification registration will be confirmed.
                    </li>
                    <li className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-0.5">•</span>
                      In case your payment is successful but the registration process fails, kindly reach out to the Organizing Committee for assistance.
                    </li>
                  </ul>
                </div>

                {status === "error" && (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                    <p className="text-sm text-destructive">{errorMsg}</p>
                  </div>
                )}

                <button type="submit" disabled={status === "loading"}
                  className="clip-btn w-full px-10 py-4 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-widest hover:shadow-[var(--shadow-gold)] transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {status === "loading" ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Submitting...</>
                  ) : (
                    <><Send className="w-5 h-5" />Submit Registration</>
                  )}
                </button>
              </form>
            )}
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;