import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Camera, Save, Flame, Dumbbell, Calendar } from "lucide-react";
import api from "../api";

const stats = [
  { label: "Workouts", value: 24, icon: Dumbbell },
  { label: "Calories burned", value: "6,420", icon: Flame },
  { label: "Active days", value: 18, icon: Calendar },
];

// Convert selected file to base64 data URL
const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// Shrink the image so it fits comfortably in localStorage
const resizeImage = (dataUrl, maxWidth, outputType) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL(outputType, 0.85));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });

// Each user gets their own photo/cover, so the user id is part of the key
const storageKey = (name) => {
  let id = "";
  try {
    id = JSON.parse(localStorage.getItem("user") || "{}").id || "";
  } catch {
    // ignore invalid saved user data
  }
  return `${name}_${id}`;
};

// Save image to localStorage and return the stored data URL
const saveImage = async (file, name, maxWidth) => {
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  try {
    const dataUrl = await resizeImage(await fileToDataUrl(file), maxWidth, type);
    localStorage.setItem(storageKey(name), dataUrl);
    return dataUrl;
  } catch {
    // Storage full or unreadable file — show it for this session only
    return URL.createObjectURL(file);
  }
};

export default function Profile() {
  const fileRef = useRef(null);
  // Restore saved photo/cover from localStorage (survives page reload)
  const [photo, setPhoto] = useState(
    () => localStorage.getItem(storageKey("profilePhoto"))
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load logged-in user's data from backend (database) on page open
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/me");
        setName(response.data.user?.name || "");
        setEmail(response.data.user?.email || "");
      } catch {
        // Fallback: use user saved in localStorage at login (same as Dashboard)
        try {
          const saved = JSON.parse(localStorage.getItem("user") || "{}");
          setName(saved.name || "");
          setEmail(saved.email || "");
        } catch {
          setError("Could not load profile. Please login again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(await saveImage(file, "profilePhoto", 400));
  };

  const coverRef = useRef(null);
  const [cover, setCover] = useState(
    () => localStorage.getItem(storageKey("profileCover")) || "/images/cover.jpg"
  );

  const onCover = async (e) => {
    const file = e.target.files?.[0];
    if (file) setCover(await saveImage(file, "profileCover", 1280));
  };
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.put("/auth/profile", { name, email });

      // Update localStorage so the Dashboard also shows the latest name
      const savedUser = {
        ...JSON.parse(localStorage.getItem("user") || "{}"),
        ...response.data.user,
      };
      localStorage.setItem("user", JSON.stringify(savedUser));

      setMessage(response.data.message || "Profile saved successfully!");
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-5 md:p-0">
      {/* Cover + avatar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
      >
       <div className="h-52 relative bg-cover bg-center"
     style={{
       backgroundImage: `url('${cover}'), linear-gradient(135deg, #2c4a12, #0b120b)`,
     }}>
  {/* Neeche se dark overlay, taake text saaf dikhe */}
  <div className="absolute inset-0 bg-gradient-to-t from-[#0b120b] via-[#0b120b]/30 to-transparent" />

  <button
    type="button"
    onClick={() => coverRef.current.click()}
    className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur px-4 py-2 text-sm text-white border border-[#B7FF4A]/40 hover:border-[#B7FF4A] transition"
  >
    <Camera size={16} className="text-[#B7FF4A]" /> Change cover
  </button>
  <input ref={coverRef} type="file" accept="image/*" hidden onChange={onCover} />
</div>

        <div className="px-5 md:px-8 pb-8 -mt-13 flex flex-wrap items-end gap-5">
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-[#0b120b] bg-[#B7FF4A] grid place-items-center overflow-hidden">
              {photo ? (
                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-black" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              aria-label="Change photo"
              className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-black border border-[#B7FF4A] grid place-items-center hover:scale-110 transition"
            >
              <Camera size={16} className="text-[#B7FF4A]" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPhoto} />
          </div>

          <div className="pb-2">
            <h1 className="text-3xl font-bold text-white">{name}</h1>
            <p className="text-gray-400">Fitness Tracker Member</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mt-6">
        {stats.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.1 }}
            className="glass-card p-6 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-[#B7FF4A]/15 grid place-items-center">
              <Icon className="text-[#B7FF4A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Form */}
      <motion.form
        onSubmit={handleSave}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-8 mt-6 space-y-5"
      >
        <h2 className="text-xl font-bold text-white">Personal information</h2>

        <div>
          <label className="text-sm text-gray-400">Full Name</label>
          <div className="flex items-center gap-3 mt-2 rounded-xl border border-[#26391C] bg-[#0b120b] px-4 focus-within:border-[#B7FF4A] transition">
            <User size={20} className="text-[#B7FF4A]" />
            <input value={name} onChange={(e) => setName(e.target.value)}
                   className="w-full bg-transparent py-4 outline-none text-white" />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Email Address</label>
          <div className="flex items-center gap-3 mt-2 rounded-xl border border-[#26391C] bg-[#0b120b] px-4 focus-within:border-[#B7FF4A] transition">
            <Mail size={20} className="text-[#B7FF4A]" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-transparent py-4 outline-none text-white" />
          </div>
        </div>

        {message && <p className="text-[#B7FF4A] text-sm">{message}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={saving || loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#B7FF4A] py-4 font-bold text-black hover:bg-[#C8FF78] transition disabled:opacity-50">
          <Save size={20} /> {saving ? "Saving..." : "Save Profile"}
        </button>
      </motion.form>
    </div>
  );
}