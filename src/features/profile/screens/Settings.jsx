import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, getProfile } from "../../auth/authSlice";
import { FaStore, FaFileInvoice, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaImage, FaCheckCircle, FaSpinner } from "react-icons/fa";

function Settings() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    shopName: "",
    businessName: "",
    gstNumber: "",
    businessAddress: "",
    mobileNumber: "",
    email: "",
    businessDescription: "",
    state: "",
    pincode: "",
    logo: "",
  });

  const [logoPreview, setLogoPreview] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const profile = user.profile || {};
      setFormData({
        shopName: profile.shopName || user.businessName || "",
        businessName: user.businessName || "",
        gstNumber: profile.gstNumber || "",
        businessAddress: profile.businessAddress || "",
        mobileNumber: profile.mobileNumber || user.mobileNumber || "",
        email: profile.email || user.email || "",
        businessDescription: profile.businessDescription || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        logo: profile.logo || "",
      });
      setLogoPreview(profile.logo || "");
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo file size must be less than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, logo: reader.result });
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    const resultAction = await dispatch(updateProfile(formData));
    if (updateProfile.fulfilled.match(resultAction)) {
      setSuccessMsg("Business profile updated successfully!");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8 rounded-2xl border border-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Business Profile Settings</h2>
          <p className="text-slate-400 text-sm mt-1">Configure invoice branding, tax details, logo uploads, and address variables.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs flex items-center gap-2">
            <FaCheckCircle /> {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Logo upload */}
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Business Logo</span>
              
              <div className="w-32 h-32 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden relative group">
                {logoPreview ? (
                  <img src={logoPreview} alt="Shop Logo" className="w-full h-full object-cover" />
                ) : (
                  <FaStore size={48} className="text-slate-700" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 cursor-pointer">
                  <FaImage className="text-white text-2xl" />
                </div>
              </div>

              <div className="w-full">
                <label className="block w-full py-2 bg-slate-800 hover:bg-slate-750 text-xs font-bold rounded-lg cursor-pointer transition border border-slate-700 text-center">
                  <span className="flex items-center justify-center gap-2">
                    <FaImage /> Choose Image
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleLogoChange}
                    className="hidden" 
                  />
                </label>
                <p className="text-[10px] text-slate-500 mt-2">Supports JPG, PNG (Max 2MB). Automatically sizes on receipt PDF.</p>
              </div>
            </div>

            {/* Right Column: Profile fields */}
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-2xl md:col-span-2 space-y-4 text-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 flex items-center gap-2">
                <FaStore className="text-orange-500" /> Identity &amp; Invoicing Details
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Shop / Trade Name</label>
                  <input 
                    type="text" 
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    placeholder="e.g. SmartLedger Store"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Registered Business Name</label>
                  <input 
                    type="text" 
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. SmartLedger Private Limited"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">GSTIN (15-digit Tax Code)</label>
                  <input 
                    type="text" 
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="e.g. 29AAAAA0000A1Z5"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500 font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Business Description / Tagline</label>
                  <input 
                    type="text" 
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleChange}
                    placeholder="e.g. Wholesale Sports & Stationery Distributors"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2 pt-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-500" /> Contact &amp; Address Variables
              </h3>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Store Address</label>
                <textarea 
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  placeholder="e.g. MB Patil Colony Near Bus Stand, BasavaKalyan"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500 h-16 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">State</label>
                  <input 
                    type="text" 
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Pincode</label>
                  <input 
                    type="text" 
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 585327"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Store Mobile Number</label>
                  <input 
                    type="text" 
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="e.g. 6361037157"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Store Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. store@smartledger.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading && <FaSpinner className="animate-spin" />}
                  Save Profile Configuration
                </button>
              </div>

            </div>
          </div>
        </form>

      </div>
    </div>
  );
}

export default Settings;
