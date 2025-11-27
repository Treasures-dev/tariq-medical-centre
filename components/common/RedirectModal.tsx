"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

type ModalProps = {
  title: string;
  message: string;
  redirectUrl?: string;
  redirectDelay?: number; // in milliseconds
};

const RedirectModal: React.FC<ModalProps> = ({
  title,
  message,
  redirectUrl = "/auth",
  redirectDelay = 3000,
}) => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectUrl);
    }, redirectDelay);

    return () => clearTimeout(timer);
  }, [redirectUrl, redirectDelay, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">{title}</h2>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={() => router.push(redirectUrl)}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default RedirectModal;
