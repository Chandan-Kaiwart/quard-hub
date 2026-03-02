"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

const categories = [
  { value: "UG_STUDENT/PG_Student", label: "UG Student / PG Student", amount: 1000 },
  { value: "PhD/RESEARCH_SCHOLAR", label: "PhD / Research Scholar", amount: 1500 },
  { value: "FACULTY/Academicians", label: "Faculty / Academicians", amount: 2000 },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

const RegistrationSection = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [status, setStatus] =
    useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const registrationAmount =
    categories.find((c) => c.value === selectedCategory)?.amount ?? null;

  const sanitize = (value: unknown): string =>
    typeof value === "string" ? value.trim() : "";

  const validateName = (value: string) =>
    /^[A-Za-z\s'-]{2,40}$/.test(value);

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validatePhone = (value: string) =>
    /^[+]?[\d\s-]{10,15}$/.test(value);

  const validateCollege = (value: string) =>
    value.length >= 3 && value.length <= 120;

  const validateCategory = (value: string) =>
    categories.some((c) => c.value === value);

  const validateFile = (file: File | null) =>
    !!file &&
    file.size > 0 &&
    file.size <= MAX_FILE_SIZE &&
    ALLOWED_FILE_TYPES.includes(file.type);

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
      try {
        data = await res.json();
      } catch {
        data = null;
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

      if (!validateFile(file))
        throw new Error("Invalid file. Only JPG, PNG, PDF under 10 MB allowed.");

      const fileBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
          resolve((reader.result as string).split(",")[1]);
        reader.onerror = () =>
          reject(new Error("File read failed."));
        reader.readAsDataURL(file!);
      });

      await safeFetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          college,
          category,
          fileBase64,
          fileName: file!.name,
        }),
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

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          {status === "success" ? (
            <div className="gold-border rounded-xl p-12 bg-card/30 backdrop-blur-sm text-center">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="font-heading text-2xl font-bold mb-3">
                Registration Received!
              </h3>
              <p className="text-muted-foreground">
                Check your email for confirmation. We'll review your registration and get back to you soon.
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
                  <input name="first_name" required placeholder="John"
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                </div>
                <div>
                  <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Last Name *</label>
                  <input name="last_name" required placeholder="Doe"
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Email *</label>
                  <input name="email" type="email" required placeholder="john@example.com"
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                </div>
                <div>
                  <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">Phone *</label>
                  <input name="phone" type="tel" required placeholder="+91 9876543210"
                    className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">College / Organization *</label>
                <input name="college" required placeholder="National Forensics Science University"
                  className="w-full px-4 py-3 bg-muted/30 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors" />
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

              <div>
                <label className="font-mono text-xs text-muted-foreground uppercase tracking-wider block mb-2">
                  ID Proof (College/Any Government ID in JPG/PNG/PDF, max 10 MB) *
                </label>
                <input name="college_id" type="file" required accept=".jpg,.jpeg,.png,.pdf"
                  className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:border-primary/30 file:text-sm file:font-mono file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:transition-colors file:cursor-pointer" />
              </div>

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
    </section>
  );
};

export default RegistrationSection;