import React, { useRef, useState } from "react";

export default function ProfilePhotoUpload({ initialUrl, onChange }) {
  const fileRef = useRef(null);
  const [url, setUrl] = useState(initialUrl || "");

  function handleFile(e) {
    const f = e.target.files?.[0]; if (!f) return;
    const preview = URL.createObjectURL(f);
    setUrl(preview);
    onChange?.(f); // parent can upload to storage and save URL
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={url || "https://api.dicebear.com/7.x/identicon/svg?seed=resonifi"}
        alt="Profile"
        className="h-16 w-16 rounded-full object-cover border border-neutral-700"
      />
      <div>
        <button className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-white hover:bg-neutral-700 transition-colors"
                onClick={() => fileRef.current?.click()}>
          Change photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile}/>
        <div className="text-xs text-neutral-400 mt-1">PNG/JPG, ~1–2 MB</div>
      </div>
    </div>
  );
}