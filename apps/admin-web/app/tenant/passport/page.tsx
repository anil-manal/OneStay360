"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  FileText,
  User,
  Phone,
  Building,
  GraduationCap,
  Briefcase,
  Camera,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Lock,
  Download,
  Share2,
} from "lucide-react";

interface PassportProfile {
  passportId: string;
  fullName: string;
  dob: string;
  gender: string;
  maskedAadhaar: string;
  aadhaarHash: string;
  permanentAddress: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    verified: boolean;
  };
  affiliation: {
    type: "student" | "professional";
    organization: string;
    workEmail?: string;
    verified: boolean;
  };
  kycVerifiedAt: string;
  status: "verified" | "pending" | "defaulter_alert";
  trustScore: number;
}

const DEFAULT_VERIFIED_PASSPORT: PassportProfile = {
  passportId: "OS360-PASS-PNQ-78291",
  fullName: "Anil Kumar Manal",
  dob: "14-08-1999",
  gender: "Male",
  maskedAadhaar: "XXXX-XXXX-8921",
  aadhaarHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  permanentAddress: {
    line1: "Flat 402, Shanti Kunj Apartments, Baner Road",
    city: "Pune",
    state: "Maharashtra",
    pincode: "411045",
  },
  emergencyContact: {
    name: "Rameshwar Manal",
    relationship: "Father",
    phone: "+91 94220 12345",
    verified: true,
  },
  affiliation: {
    type: "professional",
    organization: "Tata Consultancy Services (TCS Pune)",
    workEmail: "anil.manal@tcs.com",
    verified: true,
  },
  kycVerifiedAt: "24 Nov 2026, 11:30 AM",
  status: "verified",
  trustScore: 98,
};

export default function TenantPassportPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(4); // Default to verified view with toggle to re-test flow
  const [kycMethod, setKycMethod] = useState<"digilocker" | "ocr">("digilocker");
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [aadhaarInput, setAadhaarInput] = useState("5829 4819 8921");
  const [otpInput, setOtpInput] = useState("");
  const [selectedPoliceState, setSelectedPoliceState] = useState<"Maharashtra" | "Karnataka" | "Delhi">("Maharashtra");
  const [passport, setPassport] = useState<PassportProfile>(DEFAULT_VERIFIED_PASSPORT);

  // Emergency contact state
  const [emergencyName, setEmergencyName] = useState(passport.emergencyContact.name);
  const [emergencyPhone, setEmergencyPhone] = useState(passport.emergencyContact.phone);
  const [emergencyRelation, setEmergencyRelation] = useState(passport.emergencyContact.relationship);

  // Affiliation state
  const [affilType, setAffilType] = useState<"student" | "professional">(passport.affiliation.type);
  const [affilOrg, setAffilOrg] = useState(passport.affiliation.organization);
  const [workEmail, setWorkEmail] = useState(passport.affiliation.workEmail || "");

  const handleSendAadhaarOtp = async () => {
    if (aadhaarInput.replace(/\s/g, "").length < 12) {
      alert("Please enter a valid 12-digit Aadhaar Number.");
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1200));
    setVerifying(false);
    setOtpSent(true);
  };

  const handleVerifyAadhaarOtp = async () => {
    if (otpInput.length < 6) {
      alert("Please enter the 6-digit OTP sent to your Aadhaar-registered mobile.");
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 1500));
    setVerifying(false);
    setStep(2);
  };

  const handleCompleteStep2 = () => {
    if (!emergencyName || !emergencyPhone) {
      alert("Please enter emergency contact name and phone.");
      return;
    }
    setStep(3);
  };

  const handleCompleteStep3 = () => {
    if (!affilOrg) {
      alert("Please enter your organization or university name.");
      return;
    }
    const updated: PassportProfile = {
      ...passport,
      emergencyContact: {
        name: emergencyName,
        relationship: emergencyRelation,
        phone: emergencyPhone,
        verified: true,
      },
      affiliation: {
        type: affilType,
        organization: affilOrg,
        workEmail,
        verified: true,
      },
      kycVerifiedAt: new Date().toLocaleDateString("en-IN", { dateStyle: "medium" }),
      status: "verified",
    };
    setPassport(updated);
    setStep(4);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#0F172A", padding: "32px 20px", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        {/* Top Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "var(--teal-primary)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "20px",
              }}
            >
              O
            </div>
            <div>
              <h1 style={{ fontSize: "20px", fontWeight: 800, margin: 0, color: "#0F172A" }}>OneStay360 Resident Passport</h1>
              <p style={{ fontSize: "12px", color: "#64748B", margin: "2px 0 0 0" }}>
                Universal 1-Time KYC &bull; Zero Paperwork Relocation across all OneStay360 PGs
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            {step === 4 ? (
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  color: "#475569",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <RefreshCw size={14} /> Re-verify / Update KYC
              </button>
            ) : (
              <button
                onClick={() => setStep(4)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid var(--teal-primary)",
                  background: "rgba(13, 148, 136, 0.08)",
                  color: "var(--teal-primary)",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                View Existing Passport &rarr;
              </button>
            )}
          </div>
        </div>

        {/* STEPPER BAR */}
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "16px 24px", marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {[
              { num: 1, label: "Aadhaar DigiLocker", desc: "UIDAI e-KYC" },
              { num: 2, label: "Parent / Emergency", desc: "SMS OTP Verified" },
              { num: 3, label: "Company / College", desc: "Trust Accelerator" },
              { num: 4, label: "Resident Passport", desc: "Ready to Move-In" },
            ].map((s) => {
              const isDone = s.num < step || (step === 4 && s.num === 4);
              const isActive = s.num === step;
              return (
                <div key={s.num} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: isDone ? "#059669" : isActive ? "var(--teal-primary)" : "#F1F5F9",
                      color: isDone || isActive ? "#FFFFFF" : "#64748B",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "13px",
                      flexShrink: 0,
                    }}
                  >
                    {isDone && s.num !== step ? <CheckCircle2 size={16} /> : s.num}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: isActive ? 800 : 600, color: isActive ? "#0F172A" : "#64748B" }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>{s.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 1: AADHAAR OKYC */}
        {step === 1 && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--teal-primary)", letterSpacing: "0.5px" }}>
                  Step 1 of 3: Primary Government Identity
                </span>
                <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "4px 0 6px 0", color: "#0F172A" }}>
                  Aadhaar Verification via DigiLocker / UIDAI
                </h2>
                <p style={{ fontSize: "13px", color: "#64748B", margin: 0, maxWidth: "600px" }}>
                  OneStay360 fetches your official verified name, DOB, photograph, and permanent address directly from UIDAI. Raw Aadhaar numbers are never stored in plaintext.
                </p>
              </div>

              {/* Mode Toggle */}
              <div style={{ display: "flex", background: "#F1F5F9", padding: "4px", borderRadius: "8px" }}>
                <button
                  onClick={() => setKycMethod("digilocker")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: kycMethod === "digilocker" ? "#FFFFFF" : "transparent",
                    color: kycMethod === "digilocker" ? "var(--teal-primary)" : "#64748B",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: kycMethod === "digilocker" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  DigiLocker OTP (Fastest)
                </button>
                <button
                  onClick={() => setKycMethod("ocr")}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "none",
                    background: kycMethod === "ocr" ? "#FFFFFF" : "transparent",
                    color: kycMethod === "ocr" ? "var(--teal-primary)" : "#64748B",
                    fontWeight: 700,
                    fontSize: "12px",
                    cursor: "pointer",
                    boxShadow: kycMethod === "ocr" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  ID Photo + Selfie Match
                </button>
              </div>
            </div>

            {kycMethod === "digilocker" ? (
              <div style={{ maxWidth: "480px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    12-Digit Aadhaar Number
                  </label>
                  <input
                    type="text"
                    value={aadhaarInput}
                    onChange={(e) => setAadhaarInput(e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: "1px solid #CBD5E1",
                      fontSize: "16px",
                      fontFamily: "monospace",
                      fontWeight: 600,
                      color: "#0F172A",
                    }}
                  />
                  <span style={{ fontSize: "11px", color: "#64748B", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Lock size={12} /> Encrypted via Cashfree UIDAI Verification Gateway
                  </span>
                </div>

                {!otpSent ? (
                  <button
                    onClick={handleSendAadhaarOtp}
                    disabled={verifying}
                    className="btnPrimary"
                    style={{
                      padding: "12px 20px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: verifying ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {verifying ? "Generating UIDAI OTP..." : "Request Aadhaar OTP &rarr;"}
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "4px" }}>
                    <div style={{ padding: "10px 14px", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "8px", color: "#065F46", fontSize: "12px", fontWeight: 600 }}>
                      ✅ 6-digit OTP dispatched to mobile linked with Aadhaar ending in ...8921
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                        Enter 6-Digit OTP
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px 14px",
                          borderRadius: "10px",
                          border: "1px solid #CBD5E1",
                          fontSize: "18px",
                          fontFamily: "monospace",
                          fontWeight: 700,
                          textAlign: "center",
                          letterSpacing: "4px",
                        }}
                      />
                    </div>
                    <button
                      onClick={handleVerifyAadhaarOtp}
                      disabled={verifying}
                      className="btnPrimary"
                      style={{ padding: "12px 20px", borderRadius: "10px", fontWeight: 700, fontSize: "14px" }}
                    >
                      {verifying ? "Verifying with UIDAI..." : "Verify & Continue to Emergency Contact &rarr;"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Fallback OCR Flow */
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "700px" }}>
                <div style={{ border: "2px dashed #CBD5E1", borderRadius: "12px", padding: "24px", textAlign: "center", background: "#F8FAFC" }}>
                  <FileText size={32} style={{ color: "#64748B", margin: "0 auto 12px" }} />
                  <strong style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>Upload Aadhaar / DL Card</strong>
                  <p style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 16px 0" }}>Front and back photo of physical ID</p>
                  <button style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFFFFF", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                    Select Photo
                  </button>
                </div>

                <div style={{ border: "2px dashed #CBD5E1", borderRadius: "12px", padding: "24px", textAlign: "center", background: "#F8FAFC" }}>
                  <Camera size={32} style={{ color: "#64748B", margin: "0 auto 12px" }} />
                  <strong style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>Live Liveness Selfie</strong>
                  <p style={{ fontSize: "12px", color: "#94A3B8", margin: "0 0 16px 0" }}>Face match against ID photo</p>
                  <button style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFFFFF", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                    Open Camera
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: EMERGENCY CONTACT */}
        {step === 2 && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--teal-primary)", letterSpacing: "0.5px" }}>
              Step 2 of 3: Safety & Police Compliance
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "4px 0 6px 0", color: "#0F172A" }}>
              Parent / Primary Guardian Contact
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 24px 0", maxWidth: "600px" }}>
              Required by City Police Tenant Verification Acts. In case of medical emergencies or late night entry alerts, this contact is notified.
            </p>

            <div style={{ maxWidth: "480px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Guardian Full Name *
                </label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. Rameshwar Manal"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Relationship
                  </label>
                  <select
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px", background: "#FFFFFF" }}
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Local Guardian">Local Guardian</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Guardian Phone *
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+91 94220 12345"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  onClick={() => setStep(1)}
                  style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#64748B", fontWeight: 600, fontSize: "13px" }}
                >
                  &larr; Back
                </button>
                <button
                  onClick={handleCompleteStep2}
                  className="btnPrimary"
                  style={{ flex: 1, padding: "10px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "14px" }}
                >
                  Confirm &amp; Proceed to Affiliation &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: COMPANY / COLLEGE */}
        {step === 3 && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--teal-primary)", letterSpacing: "0.5px" }}>
              Step 3 of 3: Trust Accelerator
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "4px 0 6px 0", color: "#0F172A" }}>
              Workplace or College Verification
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 24px 0", maxWidth: "600px" }}>
              Verifying your employment or student status unlocks pre-approved zero-deposit or reduced-deposit living perks at participating PG chains.
            </p>

            <div style={{ maxWidth: "480px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={() => setAffilType("professional")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: affilType === "professional" ? "2px solid var(--teal-primary)" : "1px solid #CBD5E1",
                    background: affilType === "professional" ? "rgba(13, 148, 136, 0.08)" : "#FFFFFF",
                    color: affilType === "professional" ? "var(--teal-primary)" : "#475569",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <Briefcase size={16} /> Working Professional
                </button>

                <button
                  onClick={() => setAffilType("student")}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "10px",
                    border: affilType === "student" ? "2px solid var(--teal-primary)" : "1px solid #CBD5E1",
                    background: affilType === "student" ? "rgba(13, 148, 136, 0.08)" : "#FFFFFF",
                    color: affilType === "student" ? "var(--teal-primary)" : "#475569",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <GraduationCap size={16} /> College Student
                </button>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  {affilType === "professional" ? "Employer / Company Name *" : "College / University Name *"}
                </label>
                <input
                  type="text"
                  value={affilOrg}
                  onChange={(e) => setAffilOrg(e.target.value)}
                  placeholder={affilType === "professional" ? "e.g. Infosys, TCS, Google" : "e.g. Pune University, COEP"}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  {affilType === "professional" ? "Corporate Email ID" : "Student Email ID"}
                </label>
                <input
                  type="email"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="name@company.com"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  onClick={() => setStep(2)}
                  style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#64748B", fontWeight: 600, fontSize: "13px" }}
                >
                  &larr; Back
                </button>
                <button
                  onClick={handleCompleteStep3}
                  className="btnPrimary"
                  style={{ flex: 1, padding: "10px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "14px" }}
                >
                  Generate Universal Resident Passport &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PASSPORT ISSUED & DIGITAL DOSSIER */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Golden Passport Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                borderRadius: "20px",
                padding: "32px",
                color: "#FFFFFF",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Watermark Logo */}
              <div
                style={{
                  position: "absolute",
                  right: "-20px",
                  bottom: "-20px",
                  fontSize: "180px",
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.03)",
                  pointerEvents: "none",
                }}
              >
                360
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <ShieldCheck size={20} color="#10B981" />
                    <span style={{ fontSize: "12px", fontWeight: 800, color: "#10B981", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                      OneStay360 Verified Resident Passport
                    </span>
                  </div>
                  <h2 style={{ fontSize: "26px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>{passport.fullName}</h2>
                  <div style={{ fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>
                    Passport ID: <span style={{ fontFamily: "monospace", color: "#38BDF8" }}>{passport.passportId}</span>
                  </div>
                </div>

                <div style={{ textAlign: "right", background: "rgba(255,255,255,0.08)", padding: "10px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>Living Trust Score</div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#10B981" }}>{passport.trustScore} / 100</div>
                  <div style={{ fontSize: "10px", color: "#38BDF8", fontWeight: 600 }}>Gold Tier Resident</div>
                </div>
              </div>

              {/* Passport Core Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>Masked Aadhaar</span>
                  <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "monospace", color: "#F8FAFC", marginTop: "2px" }}>
                    {passport.maskedAadhaar}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>Date of Birth &bull; Gender</span>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#F8FAFC", marginTop: "2px" }}>
                    {passport.dob} &bull; {passport.gender}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>Affiliation</span>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#F8FAFC", marginTop: "2px" }}>
                    {passport.affiliation.organization}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>Permanent State</span>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#F8FAFC", marginTop: "2px" }}>
                    {passport.permanentAddress.city}, {passport.permanentAddress.state}
                  </div>
                </div>
              </div>

              {/* Check-in QR Footer */}
              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px dashed rgba(255,255,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "48px", height: "48px", background: "#FFFFFF", borderRadius: "8px", padding: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <QrCode size={40} color="#0F172A" />
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#F8FAFC" }}>Instant Check-In QR</div>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>Present to any OneStay360 PG Warden for 1-click check-in</div>
                  </div>
                </div>

                <div style={{ fontSize: "11px", color: "#64748B", fontFamily: "monospace" }}>
                  SHA256: {passport.aadhaarHash.slice(0, 16)}...{passport.aadhaarHash.slice(-8)}
                </div>
              </div>
            </div>

            {/* AUTOMATED LEGAL & POLICE COMPLIANCE SUITE */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                    Automated Police Verification (Form 29 Engine)
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
                    Pre-compiled and legally compliant across Indian Police Commissionerates.
                  </p>
                </div>

                {/* State selector */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 600 }}>Jurisdiction:</span>
                  <select
                    value={selectedPoliceState}
                    onChange={(e) => setSelectedPoliceState(e.target.value as any)}
                    style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "12px", fontWeight: 700, background: "#FFFFFF" }}
                  >
                    <option value="Maharashtra">Maharashtra (Form 29 / Tenant Info)</option>
                    <option value="Karnataka">Karnataka (Bengaluru Police Form)</option>
                    <option value="Delhi">Delhi NCR (Tenant Verification Form)</option>
                  </select>
                </div>
              </div>

              {/* Form 29 Preview Card */}
              <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", borderBottom: "1px solid #E2E8F0", paddingBottom: "12px" }}>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "var(--teal-primary)", textTransform: "uppercase" }}>
                      {selectedPoliceState} Police Commissionerate Document
                    </div>
                    <strong style={{ fontSize: "14px", color: "#0F172A" }}>
                      Information of Paying Guest / Tenant Staying within Police Station Jurisdiction
                    </strong>
                  </div>
                  <span style={{ fontSize: "11px", padding: "3px 8px", background: "#ECFDF5", color: "#059669", fontWeight: 700, borderRadius: "6px" }}>
                    Auto-Compiled
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "#64748B" }}>Resident Full Legal Name:</span>
                    <strong style={{ display: "block", color: "#0F172A" }}>{passport.fullName}</strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748B" }}>UIDAI Verified Permanent Address:</span>
                    <strong style={{ display: "block", color: "#0F172A" }}>
                      {passport.permanentAddress.line1}, {passport.permanentAddress.city}, {passport.permanentAddress.state} - {passport.permanentAddress.pincode}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748B" }}>Father / Guardian Name &amp; Contact:</span>
                    <strong style={{ display: "block", color: "#0F172A" }}>
                      {passport.emergencyContact.name} ({passport.emergencyContact.relationship}) &bull; {passport.emergencyContact.phone}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748B" }}>Workplace / University In City:</span>
                    <strong style={{ display: "block", color: "#0F172A" }}>{passport.affiliation.organization}</strong>
                  </div>
                </div>

                <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "12px", color: "#059669", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                    <CheckCircle2 size={15} /> All statutory fields validated against UIDAI DigiLocker database.
                  </div>
                  <button
                    onClick={() => alert(`Downloading verified ${selectedPoliceState} Police Form 29 PDF...`)}
                    className="btnPrimary"
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                    }}
                  >
                    <Download size={14} /> Download Signed Form 29 PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
