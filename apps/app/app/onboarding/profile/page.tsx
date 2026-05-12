"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo, Wordmark, BackBtn } from "@/components/Brand";

type Gender = "MALE" | "FEMALE" | "OTHER";
type IdentityType = "NIN" | "BVN" | "PASSPORT" | "DRIVERS_LICENSE" | "VOTERS_CARD";

type FormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender | "";
  email: string;
  identityType: IdentityType | "";
  identityNumber: string;
  bvn: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
};

const NG_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi",
  "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo",
  "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

const ID_TYPES: { value: IdentityType; label: string; placeholder: string; length?: number }[] = [
  { value: "NIN",             label: "NIN",              placeholder: "12345678901", length: 11 },
  { value: "BVN",             label: "BVN",              placeholder: "22212345678", length: 11 },
  { value: "PASSPORT",        label: "Passport",         placeholder: "A12345678" },
  { value: "DRIVERS_LICENSE", label: "Driver's licence", placeholder: "ABC12345AB" },
  { value: "VOTERS_CARD",     label: "Voter's card",     placeholder: "VIN..." },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: "MALE",   label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER",  label: "Other" },
];

const STEPS = ["You", "Contact", "Identity", "Address"] as const;

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState<FormState>({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    identityType: "",
    identityNumber: "",
    bvn: "",
    address: { street: "", city: "", state: "", country: "Nigeria", postalCode: "" },
  });

  useEffect(() => {
    const p = sessionStorage.getItem("jb_phone");
    if (!p) router.replace("/onboarding");
    else setPhone(p);
  }, [router]);

  // Per-step validation
  const stepValid = useMemo(() => {
    if (step === 0) {
      if (!form.firstName.trim() || !form.lastName.trim()) return "First and last name are required";
      if (!form.dateOfBirth) return "Date of birth is required";
      const dob = new Date(form.dateOfBirth);
      const age = (Date.now() - dob.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (isNaN(age) || age < 18) return "You must be at least 18 years old";
      if (age > 110) return "Please enter a valid date of birth";
      if (!form.gender) return "Please select a gender";
      return null;
    }
    if (step === 1) {
      if (!form.email.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address";
      return null;
    }
    if (step === 2) {
      if (!form.identityType) return "Pick an identity type";
      if (!form.identityNumber.trim()) return "Enter your identity number";
      const ty = ID_TYPES.find((t) => t.value === form.identityType);
      if (ty?.length && form.identityNumber.replace(/\s/g, "").length !== ty.length) {
        return `${ty.label} must be ${ty.length} digits`;
      }
      if (form.bvn && form.bvn.length !== 11) return "BVN must be 11 digits";
      return null;
    }
    if (step === 3) {
      if (!form.address.street.trim()) return "Street is required";
      if (!form.address.city.trim()) return "City is required";
      if (!form.address.state.trim()) return "State is required";
      if (!form.address.country.trim()) return "Country is required";
      return null;
    }
    return null;
  }, [step, form]);

  function next() {
    setError("");
    if (stepValid) { setError(stepValid); return; }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() {
    setError("");
    if (step === 0) router.back();
    else setStep((s) => Math.max(0, s - 1));
  }

  async function submit() {
    setError("");
    if (stepValid) { setError(stepValid); return; }
    setLoading(true);
    try {
      const payload = {
        phone,
        firstName: form.firstName.trim(),
        middleName: form.middleName.trim() || undefined,
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        dateOfBirth: form.dateOfBirth,
        gender: form.gender as Gender,
        type: "INDIVIDUAL" as const,
        identityType: form.identityType as IdentityType,
        identityNumber: form.identityNumber.replace(/\s/g, ""),
        bvn: form.bvn || undefined,
        nin: form.identityType === "NIN" ? form.identityNumber : undefined,
        address: form.address,
      };
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");
      router.push("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key === "Enter" && step < STEPS.length - 1) {
      e.preventDefault();
      next();
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-8 jmb-page-in">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-between mb-6">
          <BackBtn onClick={back} />
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <Wordmark size="md" />
          </div>
          <div className="w-10" />
        </div>

        {/* Stepper */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--jmb-text-mute)]">
              Step {step + 1} of {STEPS.length}
            </p>
            <p className="text-xs text-[var(--jmb-text-dim)]">{STEPS[step]}</p>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full transition-[width] duration-500"
              style={{ width: `${progress}%`, background: "var(--jmb-grad-primary)" }}
            />
          </div>
          <div className="mt-3 flex items-center gap-2">
            {STEPS.map((label, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <div key={label} className="flex-1 flex items-center gap-1.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: done
                        ? "var(--jmb-grad-primary)"
                        : current
                        ? "rgba(255,255,255,0.10)"
                        : "rgba(255,255,255,0.04)",
                      color: done ? "#06121a" : current ? "#fff" : "var(--jmb-text-mute)",
                      border: current ? "1px solid rgba(0,217,245,0.45)" : "1px solid var(--jmb-border)",
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <span className={`text-[10px] truncate ${current ? "text-white" : "text-[var(--jmb-text-mute)]"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-[28px] blur-2xl opacity-50 jmb-pulse" style={{ background: "var(--jmb-grad-card)" }} />
          <div className="relative jmb-glass-hi jmb-glow rounded-[26px] p-6">
            <h2 className="text-lg font-semibold text-white">
              {step === 0 && "Tell us about you"}
              {step === 1 && "How do we reach you?"}
              {step === 2 && "Verify your identity"}
              {step === 3 && "Your home address"}
            </h2>
            <p className="text-sm text-[var(--jmb-text-dim)] mt-1 mb-5">
              {step === 0 && "Your legal name as it appears on official ID."}
              {step === 1 && "We'll send receipts and security alerts here."}
              {step === 2 && "Required by CBN for KYC. Your data is encrypted."}
              {step === 3 && "Where you currently live."}
            </p>

            <form onSubmit={(e) => e.preventDefault()} onKeyDown={onKey} className="space-y-4">
              {step === 0 && (
                <>
                  <Field label="First name" required>
                    <input
                      autoFocus
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Amaka"
                      className="jmb-input"
                      autoComplete="given-name"
                    />
                  </Field>
                  <Field label="Middle name" hint="optional">
                    <input
                      type="text"
                      value={form.middleName}
                      onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                      placeholder="Chioma"
                      className="jmb-input"
                      autoComplete="additional-name"
                    />
                  </Field>
                  <Field label="Last name" required>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Obi"
                      className="jmb-input"
                      autoComplete="family-name"
                    />
                  </Field>
                  <Field label="Date of birth" required>
                    <input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                      max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().slice(0, 10)}
                      className="jmb-input"
                    />
                  </Field>
                  <Field label="Gender" required>
                    <div className="grid grid-cols-3 gap-2">
                      {GENDERS.map((g) => {
                        const active = form.gender === g.value;
                        return (
                          <button
                            key={g.value}
                            type="button"
                            onClick={() => setForm({ ...form, gender: g.value })}
                            className="rounded-xl py-3 text-sm font-medium transition border"
                            style={{
                              background: active ? "rgba(0,217,245,0.10)" : "rgba(255,255,255,0.02)",
                              borderColor: active ? "rgba(0,217,245,0.45)" : "var(--jmb-border)",
                              color: active ? "#fff" : "var(--jmb-text-dim)",
                            }}
                          >
                            {g.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </>
              )}

              {step === 1 && (
                <>
                  <Field label="Phone number" hint="from previous step">
                    <div className="flex rounded-xl overflow-hidden border border-white/10">
                      <span className="inline-flex items-center px-3 bg-white/[0.04] text-[var(--jmb-text-dim)] text-sm border-r border-white/10">
                        🇳🇬 +234
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        disabled
                        className="flex-1 bg-transparent px-3 py-3 text-sm text-white/80 tracking-wider"
                      />
                    </div>
                  </Field>
                  <Field label="Email address" required>
                    <input
                      autoFocus
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="amaka.obi@example.com"
                      className="jmb-input"
                      autoComplete="email"
                      inputMode="email"
                    />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <Field label="Identity document" required>
                    <div className="grid grid-cols-2 gap-2">
                      {ID_TYPES.map((t) => {
                        const active = form.identityType === t.value;
                        return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setForm({ ...form, identityType: t.value, identityNumber: "" })}
                            className="rounded-xl py-3 px-3 text-sm font-medium transition border text-left"
                            style={{
                              background: active ? "rgba(0,245,160,0.10)" : "rgba(255,255,255,0.02)",
                              borderColor: active ? "rgba(0,245,160,0.45)" : "var(--jmb-border)",
                              color: active ? "#fff" : "var(--jmb-text-dim)",
                            }}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  {form.identityType && (
                    <Field
                      label={`${ID_TYPES.find((t) => t.value === form.identityType)?.label} number`}
                      required
                    >
                      <input
                        type="text"
                        inputMode={form.identityType === "PASSPORT" ? "text" : "numeric"}
                        value={form.identityNumber}
                        onChange={(e) => setForm({ ...form, identityNumber: e.target.value })}
                        placeholder={ID_TYPES.find((t) => t.value === form.identityType)?.placeholder}
                        maxLength={ID_TYPES.find((t) => t.value === form.identityType)?.length}
                        className="jmb-input tracking-wider"
                      />
                    </Field>
                  )}
                  <Field label="BVN" hint="optional · 11 digits">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.bvn}
                      onChange={(e) => setForm({ ...form, bvn: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                      placeholder="22212345678"
                      maxLength={11}
                      className="jmb-input tracking-wider"
                    />
                  </Field>
                  <div className="jmb-glass rounded-xl px-4 py-3 flex items-start gap-3">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 mt-0.5 shrink-0 text-[var(--jmb-cyan)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                    </svg>
                    <p className="text-[11px] text-[var(--jmb-text-dim)] leading-relaxed">
                      Your identity details are encrypted in transit and at rest. JMB only uses them for KYC verification with NIBSS.
                    </p>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <Field label="Street address" required>
                    <input
                      autoFocus
                      type="text"
                      value={form.address.street}
                      onChange={(e) => setForm({ ...form, address: { ...form.address, street: e.target.value } })}
                      placeholder="12 Victoria Island"
                      className="jmb-input"
                      autoComplete="street-address"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City" required>
                      <input
                        type="text"
                        value={form.address.city}
                        onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })}
                        placeholder="Lagos"
                        className="jmb-input"
                        autoComplete="address-level2"
                      />
                    </Field>
                    <Field label="State" required>
                      <select
                        value={form.address.state}
                        onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })}
                        className="jmb-input appearance-none"
                      >
                        <option value="" className="bg-[var(--jmb-bg-1)]">Select state</option>
                        {NG_STATES.map((s) => (
                          <option key={s} value={s} className="bg-[var(--jmb-bg-1)]">{s}</option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Country" required>
                      <input
                        type="text"
                        value={form.address.country}
                        onChange={(e) => setForm({ ...form, address: { ...form.address, country: e.target.value } })}
                        className="jmb-input"
                        autoComplete="country-name"
                      />
                    </Field>
                    <Field label="Postal code" hint="optional">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.address.postalCode}
                        onChange={(e) => setForm({ ...form, address: { ...form.address, postalCode: e.target.value } })}
                        placeholder="101241"
                        className="jmb-input tracking-wider"
                        autoComplete="postal-code"
                      />
                    </Field>
                  </div>

                  {/* Tiny review */}
                  <div className="jmb-glass rounded-xl p-3 text-[11px] text-[var(--jmb-text-dim)] space-y-1">
                    <p>
                      <span className="text-[var(--jmb-text-mute)]">Name:</span>{" "}
                      <span className="text-white">{[form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ") || "—"}</span>
                    </p>
                    <p>
                      <span className="text-[var(--jmb-text-mute)]">DOB:</span>{" "}
                      <span className="text-white">{form.dateOfBirth || "—"}</span> ·{" "}
                      <span className="text-[var(--jmb-text-mute)]">Gender:</span>{" "}
                      <span className="text-white">{form.gender || "—"}</span>
                    </p>
                    <p>
                      <span className="text-[var(--jmb-text-mute)]">ID:</span>{" "}
                      <span className="text-white">
                        {form.identityType ? `${form.identityType} · ${form.identityNumber}` : "—"}
                      </span>
                    </p>
                  </div>
                </>
              )}

              {error && (
                <div
                  className="text-sm rounded-xl px-4 py-3"
                  style={{ background: "rgba(255,92,122,0.08)", border: "1px solid rgba(255,92,122,0.25)", color: "var(--jmb-red)" }}
                >
                  {error}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={back}
                  className="jmb-btn-ghost flex-1"
                >
                  {step === 0 ? "Cancel" : "Back"}
                </button>
                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={next} className="jmb-btn flex-[1.4]">
                    Continue
                  </button>
                ) : (
                  <button type="button" onClick={submit} disabled={loading} className="jmb-btn flex-[1.4]">
                    {loading ? "Creating account..." : "Create my JMB account"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <p className="text-center text-[11px] text-[var(--jmb-text-mute)] mt-6 leading-relaxed">
          By creating an account, you agree to JMB's <span className="text-white/80">Terms</span> & <span className="text-white/80">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[11px] uppercase tracking-[0.16em] text-[var(--jmb-text-mute)]">
          {label} {required && <span className="text-[var(--jmb-red)] normal-case tracking-normal">*</span>}
        </label>
        {hint && <span className="text-[10px] text-[var(--jmb-text-mute)]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
