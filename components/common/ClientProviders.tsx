"use client";

import { Toaster } from "react-hot-toast";
import WhatsAppFab from "@/app/components/UI/Whatsapp";
import { EdgeStoreProvider } from "@/lib/edgestore/edgestore";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster position="top-right" />
      <WhatsAppFab />
      <EdgeStoreProvider>{children}</EdgeStoreProvider>
    </>
  );
}