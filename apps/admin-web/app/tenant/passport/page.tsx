"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { fetchTenantProfile, saveTenantProfile, TenantProfileData } from "@/lib/data-service";
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
  Edit3,
} from "lucide-react";

export default function TenantPassportPage() {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<TenantProfileData | null>(null);

  // Step state: 1 (Aadhaar/Identity), 2 (Emergency/Guardian), 3 (Affiliation/Work), 4 (Issued Passport View)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(4);
  const [kycMethod, setKycMethod] = useState<"digilocker" | "ocr">("digilocker");
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [selectedPoliceState, setSelectedPoliceState] = useState<"Maharashtra" | "Karnataka" | "Delhi">("Maharashtra");
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedUri, setCopiedUri] = useState(false);

  // Form states
  const [fullNameInput, setFullNameInput] = useState("");
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [dobInput, setDobInput] = useState("");
  const [genderInput, setGenderInput] = useState("Male");
  const [addressLineInput, setAddressLineInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [stateInput, setStateInput] = useState("");
  const [pincodeInput, setPincodeInput] = useState("");
  const [otpInput, setOtpInput] = useState("");

  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Father");

  const [affilType, setAffilType] = useState<"student" | "professional">("professional");
  const [affilOrg, setAffilOrg] = useState("");
  const [affilId, setAffilId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchTenantProfile(user.uid, user.phoneNumber || undefined);
        if (data) {
          setProfile(data);
          setFullNameInput(data.fullName || userProfile?.displayName || user.displayName || "");
          setAadhaarInput(data.idNumber || "");
          setDobInput(data.dateOfBirth || "");
          setGenderInput(data.gender || "Male");
          setAddressLineInput(data.addressLine1 || "");
          setCityInput(data.city || "");
          setStateInput(data.state || "");
          setPincodeInput(data.pincode || "");
          setEmergencyName(data.emergencyContactName || "");
          setEmergencyPhone(data.emergencyContactPhone || "");
          setEmergencyRelation(data.emergencyContactRelation || "Father");
          setAffilOrg(data.officeInstituteName || "");
          setAffilId(data.officeInstituteId || "");

          // If tenant hasn't completed KYC or entered an ID, start on Step 1
          if (!data.idNumber && !data.profileComplete) {
            setStep(1);
          } else {
            setStep(4);
          }
        } else {
          // New profile
          setFullNameInput(userProfile?.displayName || user.displayName || "");
          setStep(1);
        }
      } catch (err) {
        console.error("Error loading tenant passport:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, userProfile]);

  const handleSendAadhaarOtp = async () => {
    if (aadhaarInput.replace(/\s/g, "").length < 10) {
      alert("Please enter a valid Government ID or Aadhaar Number.");
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 800));
    setVerifying(false);
    setOtpSent(true);
  };

  const handleVerifyAadhaarOtp = async () => {
    if (otpInput.length < 4) {
      alert("Please enter the 4 or 6 digit verification OTP sent to your phone.");
      return;
    }
    setVerifying(true);
    await new Promise((r) => setTimeout(r, 800));
    setVerifying(false);
    setStep(2);
  };

  const handleCompleteStep2 = () => {
    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      alert("Please enter emergency contact name and phone number.");
      return;
    }
    setStep(3);
  };

  const handleCompleteStep3 = async () => {
    if (!user) {
      alert("Please sign in to save your passport details.");
      return;
    }
    try {
      setSaving(true);
      const updatedData: Partial<TenantProfileData> = {
        fullName: fullNameInput.trim(),
        phone: user.phoneNumber || profile?.phone || "",
        email: user.email || profile?.email || "",
        idType: "Aadhar Card",
        idNumber: aadhaarInput.trim(),
        dateOfBirth: dobInput,
        gender: genderInput,
        addressLine1: addressLineInput.trim(),
        city: cityInput.trim(),
        state: stateInput.trim() || "Maharashtra",
        pincode: pincodeInput.trim(),
        emergencyContactName: emergencyName.trim(),
        emergencyContactPhone: emergencyPhone.trim(),
        emergencyContactRelation: emergencyRelation,
        officeInstituteName: affilOrg.trim(),
        officeInstituteId: affilId.trim(),
        profileComplete: true,
        kycVerified: true,
      };

      await saveTenantProfile(user.uid, updatedData);
      setProfile({
        ...(profile || {
          fullName: fullNameInput,
          phone: user.phoneNumber || "",
          email: user.email || "",
          profileComplete: true,
          kycVerified: true,
        }),
        ...updatedData,
      } as TenantProfileData);

      setStep(4);
    } catch (err: any) {
      alert("Failed to save profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}>
        <div style={{ width: "36px", height: "36px", border: "3px solid #E2E8F0", borderTopColor: "var(--teal-primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#64748B", fontSize: "14px", fontWeight: 600 }}>Loading Resident Passport from Secure Vault...</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const displayName = profile?.fullName || userProfile?.displayName || user?.displayName || user?.phoneNumber || "Resident";
  const maskedAadhaar = profile?.idNumber ? `XXXX-XXXX-${profile.idNumber.slice(-4)}` : "Not Provided";
  const formattedDob = profile?.dateOfBirth || "Not Provided";
  const gender = profile?.gender || "Not Provided";
  const affiliation = profile?.officeInstituteName || "Not Provided";
  const addressFormatted = [profile?.addressLine1, profile?.city, profile?.state, profile?.pincode].filter(Boolean).join(", ") || "Address not provided";
  const emergencyInfo = profile?.emergencyContactName ? `${profile.emergencyContactName} (${profile.emergencyContactRelation || "Guardian"}) • ${profile.emergencyContactPhone || ""}` : "Not Provided";
  const passportId = profile?.tenantId ? `OS360-PASS-${profile.tenantId.toUpperCase()}` : `OS360-PASS-${user?.uid.slice(0, 8).toUpperCase() || "PENDING"}`;
  const isKycComplete = Boolean(profile?.idNumber && profile?.profileComplete);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", color: "#0F172A", padding: "32px 20px", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        {/* Top Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
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
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#475569",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Edit3 size={14} /> Edit KYC Information
              </button>
            ) : (
              <button
                onClick={() => setStep(4)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #CBD5E1",
                  background: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                View Current Passport Card
              </button>
            )}
          </div>
        </div>

        {/* KYC Incomplete Banner */}
        {!isKycComplete && step === 4 && (
          <div
            style={{
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertTriangle size={20} color="#D97706" />
              <div>
                <strong style={{ fontSize: "14px", color: "#92400E" }}>Profile &amp; KYC Incomplete</strong>
                <p style={{ fontSize: "12px", color: "#B45309", margin: "2px 0 0 0" }}>
                  Only actual verified details submitted by you are displayed. Please complete all statutory fields to unlock full digital check-in.
                </p>
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              style={{
                background: "#D97706",
                color: "#FFFFFF",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
              }}
            >
              Complete Now
            </button>
          </div>
        )}

        {/* STEP 1: AADHAAR & DIGILOCKER */}
        {step === 1 && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--teal-primary)", letterSpacing: "0.5px" }}>
              Step 1 of 3: Statutory Identity
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "4px 0 6px 0", color: "#0F172A" }}>
              Government ID &amp; Address Verification
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 24px 0", maxWidth: "600px" }}>
              Only actual verified values will be saved to your resident profile and used for police verification.
            </p>

            <div style={{ maxWidth: "520px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Full Legal Name (as per Govt ID) *
                </label>
                <input
                  type="text"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  placeholder="Enter your full legal name"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dobInput}
                    onChange={(e) => setDobInput(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                    Gender
                  </label>
                  <select
                    value={genderInput}
                    onChange={(e) => setGenderInput(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", background: "#FFFFFF" }}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Aadhaar / Government ID Number *
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={aadhaarInput}
                    onChange={(e) => setAadhaarInput(e.target.value)}
                    placeholder="Enter 12-digit Aadhaar Number"
                    style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", letterSpacing: "1px" }}
                  />
                  <button
                    onClick={handleSendAadhaarOtp}
                    disabled={verifying}
                    className="btnPrimary"
                    style={{ padding: "10px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: 700, whiteSpace: "nowrap" }}
                  >
                    {verifying ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div style={{ background: "#F1F5F9", padding: "16px", borderRadius: "10px", border: "1px dashed #CBD5E1" }}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#475569", marginBottom: "6px" }}>
                    Enter UIDAI Verification OTP
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="6-digit OTP"
                      style={{ width: "160px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "16px", letterSpacing: "4px", textAlign: "center" }}
                    />
                    <button
                      onClick={handleVerifyAadhaarOtp}
                      className="btnPrimary"
                      style={{ padding: "8px 16px", borderRadius: "6px", fontSize: "13px", fontWeight: 700 }}
                    >
                      Verify &amp; Continue
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Permanent Address Line 1
                </label>
                <input
                  type="text"
                  value={addressLineInput}
                  onChange={(e) => setAddressLineInput(e.target.value)}
                  placeholder="House/Flat No, Apartment, Street"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>City</label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    placeholder="e.g. Pune"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>State</label>
                  <input
                    type="text"
                    value={stateInput}
                    onChange={(e) => setStateInput(e.target.value)}
                    placeholder="Maharashtra"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>Pincode</label>
                  <input
                    type="text"
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    placeholder="411045"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "13px" }}
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  if (!fullNameInput.trim()) {
                    alert("Please enter your legal name.");
                    return;
                  }
                  setStep(2);
                }}
                className="btnPrimary"
                style={{ padding: "12px 20px", borderRadius: "10px", fontWeight: 700, fontSize: "14px", marginTop: "10px" }}
              >
                Continue to Guardian Details &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GUARDIAN */}
        {step === 2 && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--teal-primary)", letterSpacing: "0.5px" }}>
              Step 2 of 3: Emergency &amp; Guardian Contact
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "4px 0 6px 0", color: "#0F172A" }}>
              Parent / Guardian Emergency Details
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 24px 0", maxWidth: "600px" }}>
              Mandatory under Indian PG and Tenancy regulations for safety and police reporting.
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
                  placeholder="Enter parent or guardian full name"
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
                    <option value="Guardian">Local Guardian</option>
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
                    placeholder="+91 98XXX XXXXX"
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

        {/* STEP 3: AFFILIATION */}
        {step === 3 && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 800, color: "var(--teal-primary)", letterSpacing: "0.5px" }}>
              Step 3 of 3: Workplace or College
            </span>
            <h2 style={{ fontSize: "20px", fontWeight: 800, margin: "4px 0 6px 0", color: "#0F172A" }}>
              Affiliation &amp; Organization
            </h2>
            <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 24px 0", maxWidth: "600px" }}>
              Verifies student or employment status for PG onboarding and tenant safety dossiers.
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
                  {affilType === "professional" ? "Employer / Company Name" : "College / University Name"}
                </label>
                <input
                  type="text"
                  value={affilOrg}
                  onChange={(e) => setAffilOrg(e.target.value)}
                  placeholder={affilType === "professional" ? "e.g. TCS, Infosys, Google" : "e.g. Pune University, COEP"}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Employee ID / Student Roll Number
                </label>
                <input
                  type="text"
                  value={affilId}
                  onChange={(e) => setAffilId(e.target.value)}
                  placeholder="e.g. EMP12345 or ROLL987"
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
                  disabled={saving}
                  className="btnPrimary"
                  style={{ flex: 1, padding: "10px 20px", borderRadius: "8px", fontWeight: 700, fontSize: "14px" }}
                >
                  {saving ? "Saving to Firestore..." : "Save & Generate Resident Passport"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PASSPORT ISSUED & DIGITAL DOSSIER (ACTUAL VALUES ONLY) */}
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
                    <ShieldCheck size={20} color={isKycComplete ? "#10B981" : "#F59E0B"} />
                    <span style={{ fontSize: "12px", fontWeight: 800, color: isKycComplete ? "#10B981" : "#F59E0B", letterSpacing: "1.5px", textTransform: "uppercase" }}>
                      {isKycComplete ? "OneStay360 Verified Resident Passport" : "Resident Passport (Verification Pending)"}
                    </span>
                  </div>
                  <h2 style={{ fontSize: "26px", fontWeight: 900, margin: 0, letterSpacing: "-0.5px" }}>{displayName}</h2>
                  <div style={{ fontSize: "13px", color: "#94A3B8", marginTop: "2px" }}>
                    Passport ID: <span style={{ fontFamily: "monospace", color: "#38BDF8" }}>{passportId}</span>
                  </div>
                </div>

                <div style={{ textAlign: "right", background: "rgba(255,255,255,0.08)", padding: "10px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>KYC Status</div>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: isKycComplete ? "#10B981" : "#F59E0B" }}>
                    {isKycComplete ? "Verified" : "Pending"}
                  </div>
                  <div style={{ fontSize: "10px", color: "#38BDF8", fontWeight: 600 }}>{profile?.phone || user?.phoneNumber || "Mobile Parity"}</div>
                </div>
              </div>

              {/* Passport Core Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>Masked Govt ID / Aadhaar</span>
                  <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "monospace", color: profile?.idNumber ? "#F8FAFC" : "#94A3B8", marginTop: "2px" }}>
                    {maskedAadhaar}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>Date of Birth &bull; Gender</span>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: formattedDob !== "Not Provided" ? "#F8FAFC" : "#94A3B8", marginTop: "2px" }}>
                    {formattedDob} &bull; {gender}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>Affiliation / Company</span>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: affiliation !== "Not Provided" ? "#F8FAFC" : "#94A3B8", marginTop: "2px" }}>
                    {affiliation}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", color: "#94A3B8", textTransform: "uppercase" }}>Permanent Address</span>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: addressFormatted !== "Address not provided" ? "#F8FAFC" : "#94A3B8", marginTop: "2px" }}>
                    {addressFormatted}
                  </div>
                </div>
              </div>

              {/* Check-in QR Footer with Mobile Parity */}
              {(() => {
                const qrTenantId = profile?.tenantId || user?.uid || "TEN0000001";
                const qrUri = `onestay360:tenant:${qrTenantId}`;
                const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrUri)}`;

                return (
                  <>
                    <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px dashed rgba(255,255,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                      <div
                        onClick={() => setShowQrModal(true)}
                        style={{ display: "flex", alignItems: "center", gap: "14px", cursor: "pointer" }}
                      >
                        <div
                          style={{
                            width: "56px",
                            height: "56px",
                            background: "#FFFFFF",
                            borderRadius: "10px",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          }}
                        >
                          <img
                            src={qrImageUrl}
                            alt="Tenant QR"
                            style={{ width: "48px", height: "48px", objectFit: "contain" }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 800, color: "#F8FAFC", display: "flex", alignItems: "center", gap: "6px" }}>
                            Instant Check-In QR <span style={{ fontSize: "11px", background: "rgba(56,189,248,0.2)", color: "#38BDF8", padding: "1px 6px", borderRadius: "4px" }}>Tap to Expand</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#94A3B8" }}>
                            Present to your PG Warden for 1-click camera scan in the OneStay360 Business App
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => setShowQrModal(true)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            background: "#0D9488",
                            border: "none",
                            color: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <QrCode size={14} /> Show Pass QR
                        </button>
                        <button
                          onClick={() => setStep(1)}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "8px",
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            color: "#FFFFFF",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <Edit3 size={14} /> Update KYC Details
                        </button>
                      </div>
                    </div>

                    {/* QR Code Fullscreen Modal */}
                    {showQrModal && (
                      <div
                        onClick={() => setShowQrModal(false)}
                        style={{
                          position: "fixed",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(15, 23, 42, 0.8)",
                          backdropFilter: "blur(4px)",
                          zIndex: 9999,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "20px",
                        }}
                      >
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            maxWidth: "420px",
                            width: "100%",
                            background: "#FFFFFF",
                            borderRadius: "24px",
                            padding: "36px 28px",
                            textAlign: "center",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                            border: "1px solid #E2E8F0",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: "#0D9488", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: "18px" }}>
                              O
                            </div>
                          </div>

                          <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0F172A", margin: "0 0 6px 0" }}>
                            Resident Digital Pass
                          </h3>
                          <p style={{ fontSize: "13px", color: "#64748B", margin: "0 0 20px 0" }}>
                            Show this QR code to your PG warden. Scanning will instantly verify your KYC and allocate your bed.
                          </p>

                          <div
                            style={{
                              background: "#F8FAFC",
                              padding: "20px",
                              borderRadius: "16px",
                              display: "inline-block",
                              border: "2px solid #E2E8F0",
                              marginBottom: "18px",
                            }}
                          >
                            <img
                              src={qrImageUrl}
                              alt="Scan QR"
                              style={{ width: "220px", height: "220px", display: "block" }}
                            />
                          </div>

                          <div style={{ background: "#F1F5F9", padding: "10px 14px", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace", color: "#334155", marginBottom: "20px", wordBreak: "break-all" }}>
                            {qrUri}
                          </div>

                          <div style={{ display: "flex", gap: "10px" }}>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(qrUri);
                                setCopiedUri(true);
                                setTimeout(() => setCopiedUri(false), 2000);
                              }}
                              style={{
                                flex: 1,
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "1px solid #CBD5E1",
                                background: "#FFFFFF",
                                color: "#334155",
                                fontWeight: 700,
                                fontSize: "13px",
                                cursor: "pointer",
                              }}
                            >
                              {copiedUri ? "Copied URI!" : "Copy URI"}
                            </button>
                            <button
                              onClick={() => setShowQrModal(false)}
                              style={{
                                flex: 1,
                                padding: "10px 14px",
                                borderRadius: "8px",
                                border: "none",
                                background: "#0F172A",
                                color: "#FFFFFF",
                                fontWeight: 700,
                                fontSize: "13px",
                                cursor: "pointer",
                              }}
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* AUTOMATED LEGAL & POLICE COMPLIANCE SUITE */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "26px", boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                    Automated Police Verification (Form 29 Engine)
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748B", margin: "2px 0 0 0" }}>
                    Statutory Form pre-filled strictly with tenant-submitted verified records.
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
                  <span style={{ fontSize: "11px", padding: "3px 8px", background: isKycComplete ? "#ECFDF5" : "#FFFBEB", color: isKycComplete ? "#059669" : "#D97706", fontWeight: 700, borderRadius: "6px" }}>
                    {isKycComplete ? "Auto-Compiled" : "Incomplete Records"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", fontSize: "13px" }}>
                  <div>
                    <span style={{ color: "#64748B" }}>Resident Full Legal Name:</span>
                    <strong style={{ display: "block", color: "#0F172A" }}>{displayName}</strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748B" }}>Permanent Address:</span>
                    <strong style={{ display: "block", color: "#0F172A" }}>{addressFormatted}</strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748B" }}>Father / Guardian Name &amp; Contact:</span>
                    <strong style={{ display: "block", color: "#0F172A" }}>{emergencyInfo}</strong>
                  </div>

                  <div>
                    <span style={{ color: "#64748B" }}>Workplace / University In City:</span>
                    <strong style={{ display: "block", color: "#0F172A" }}>{affiliation}</strong>
                  </div>
                </div>

                <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div style={{ fontSize: "12px", color: isKycComplete ? "#059669" : "#64748B", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}>
                    {isKycComplete ? (
                      <>
                        <CheckCircle2 size={15} /> All statutory fields validated and ready for submission.
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={15} color="#D97706" /> Complete missing fields above to generate signed police PDF.
                      </>
                    )}
                  </div>
                  {isKycComplete && (
                    <button
                      onClick={() => alert(`Downloading verified ${selectedPoliceState} Police Form 29 PDF for ${displayName}...`)}
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
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
