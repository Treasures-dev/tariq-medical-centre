// components/UploadButton.tsx
"use client";
import React from "react";
import { CldUploadWidget } from "next-cloudinary";

type Props = {
  onStart: () => void;
  onSuccess: (url: string) => void;
  onError?: (err: any) => void;
};

export default function UploadButton({ onStart, onSuccess, onError }: Props) {
  const onSuccessInternal = (res: any) => {
    const url = res?.info?.secure_url || res?.info?.url;
    if (url) onSuccess(url);


  };

  

  return (
    <CldUploadWidget
      signatureEndpoint="/api/admin/cloudinary"
      onSuccess={(r) => onSuccessInternal(r)}
      onError={(err) => onError?.(err)}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => {
            onStart();
            open?.();
          }}
          className="flex items-center gap-2 rounded-lg bg-[#0d3a66] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0a2d4d] transition-colors"
        >
          Upload
        </button>
      )}
    </CldUploadWidget>
  );
}
