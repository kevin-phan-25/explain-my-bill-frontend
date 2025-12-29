import React, { useState } from "react";
import { motion } from "framer-motion";

const WORKER_URL = "https://explain-my-bill.explainmybill.workers.dev";

export default function BillUploader({ onResult, onLoading }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f && f.size <= 20 * 1024 * 1024) {
      setFile(f);
      setError("");
    } else if (f) {
      setError("File too large (max 20MB)");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || uploading) return;

    setUploading(true);
    onLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("bill", file);

      const res = await fetch(WORKER_URL, { method: "POST", body: form });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Server error");
      }
      if (!res.ok) throw new Error(data.error || "Upload failed");

      onResult(data);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      onLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative max-w-4xl mx-auto"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 blur-3xl -z-10" />

      <div className="bg-white/80 dark:bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-12">
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl md:text-5xl font-black text-center mb-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
        >
          Upload Your Medical Bill
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-400/50 rounded-3xl p-8 mb-10 text-center"
        >
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mb-4">
            🔒 Your Privacy Is Guaranteed
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Your bill is processed instantly and <strong>deleted forever</strong> after analysis. Nothing is stored or shared.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="relative group"
          >
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              id="upload"
            />
            <label
              htmlFor="upload"
              className="block border-4 border-dashed border-cyan-400/60 group-hover:border-cyan-300 rounded-3xl p-20 text-center transition-all duration-500 bg-gradient-to-br from-white/50 to-white/30 group-hover:from-cyan-50/50"
            >
              {file ? (
                <div>
                  <p className="text-3xl font-bold text-cyan-600 mb-4">{file.name}</p>
                  <p className="text-xl text-gray-600">Click to change</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-9xl">📄</div>
                  <p className="text-3xl font-black text-gray-800 dark:text-white">
                    Drop your bill or click to upload
                  </p>
                  <p className="text-xl text-gray-600 dark:text-gray-400">
                    JPG • PNG • PDF • Max 20MB
                  </p>
                </div>
              )}
            </label>
          </motion.div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-center text-xl font-bold bg-red-100/50 py-4 rounded-2xl border border-red-400/50"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={!file || uploading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-black text-3xl py-8 rounded-3xl shadow-2xl hover:shadow-cyan-500/50 disabled:opacity-60 transition-all duration-500"
          >
            {uploading ? "Analyzing Your Bill..." : "Explain My Bill"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
