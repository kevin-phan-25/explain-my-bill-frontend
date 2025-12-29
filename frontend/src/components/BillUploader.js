// src/components/BillUploader.js
import React, { useState } from "react";
import { motion } from "framer-motion";

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (!validTypes.includes(selected.type)) {
      setError("Please upload JPG, PNG, or PDF");
      return;
    }

    if (selected.size > 20 * 1024 * 1024) {
      setError("File too large – max 20MB");
      return;
    }

    setFile(selected);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    onLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("bill", file);

      const res = await fetch(WORKER_URL, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid response from server");
      }

      if (!res.ok) throw new Error(data.error || "Upload failed");

      onResult(data);
    } catch (err) {
      setError(err.message || "Upload failed – please try again");
    } finally {
      setUploading(false);
      onLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative max-w-4xl mx-auto"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 blur-3xl -z-10" />

      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-12">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-black text-center mb-12 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent"
        >
          Upload Your Medical Bill
        </motion.h2>

        {/* Pro Tip Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-400/50 rounded-3xl p-10 mb-12 shadow-xl"
        >
          <h3 className="text-3xl font-bold text-center text-emerald-300 mb-8">
            For Instant & Accurate Results
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "📸", title: "Clear Photo", desc: "Take a photo of the summary page" },
              { icon: "☀️", title: "Good Lighting", desc: "No shadows or glare" },
              { icon: "🖼️", title: "JPG or PNG", desc: "Best format for text detection" },
            ].map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-7xl mb-4">{tip.icon}</div>
                <p className="text-xl font-bold text-white">{tip.title}</p>
                <p className="text-white/80 mt-2">{tip.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="relative"
          >
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              id="upload"
              disabled={uploading}
            />
            <label
              htmlFor="upload"
              className="block border-4 border-dashed border-cyan-400/50 rounded-3xl p-20 text-center hover:border-cyan-300 transition-all duration-500 hover:bg-white/5"
            >
              {file ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <p className="text-4xl font-bold text-cyan-300 mb-4">{file.name}</p>
                  <p className="text-xl text-white/80">Click to change</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  className="space-y-8"
                >
                  <div className="text-9xl">📄</div>
                  <p className="text-4xl font-black text-white">
                    Drop your bill here or click to upload
                  </p>
                  <p className="text-2xl text-white/70">JPG • PNG • PDF • Max 20MB</p>
                </motion.div>
              )}
            </label>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-center text-xl font-bold mt-8 bg-red-900/30 py-4 rounded-2xl border border-red-500/50"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={!file || uploading}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full mt-12 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-4xl py-8 rounded-3xl shadow-2xl hover:shadow-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500"
          >
            {uploading ? "Analyzing Your Bill..." : "Explain My Bill"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
