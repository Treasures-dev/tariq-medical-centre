// components/JoinTeamClient.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { useEdgeStore } from "@/lib/edgestore/edgestore";
import { Upload } from "lucide-react";

const MAX_FILE_MB = 3;
const MAX_FILE_SIZE = MAX_FILE_MB * 1024 * 1024;
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
];

const joinSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Invalid phone"),
  department: z.string().optional(),
  file: z
    .any()
    .refine((f) => f instanceof FileList && f.length === 1, "Upload 1 file")
    .refine(
      (f: any) => f && f[0] && ACCEPTED_TYPES.includes(f[0].type),
      "Allowed: PDF, DOC, DOCX, PNG, JPG"
    )
    .refine(
      (f: any) => f && f[0] && f[0].size <= MAX_FILE_SIZE,
      `Max file size ${MAX_FILE_MB}MB`
    ),
});

type FormValues = z.infer<typeof joinSchema>;

export default function JoinTeamClient() {
  const { register, handleSubmit, formState, watch, reset, setValue } =
    useForm<FormValues>({
      resolver: zodResolver(joinSchema),
    });
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const { edgestore } = useEdgeStore();
  const [progress, setProgress] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setProgress(0);

    try {
      const file: File = (values.file as unknown as FileList)[0];

      // upload to edge store using your hook
      const uploadRes = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (p: number) => setProgress(Math.round(p)),
      });

      const fileUrl = uploadRes?.url;
      if (!fileUrl) throw new Error("Upload failed: no file URL returned");

      // send metadata to server
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        department: values.department ?? "",
        fileUrl,
      };

      const res = await fetch("/api/join-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Server error");

      toast.success("CV submitted — thank you!");
      reset();
      setProgress(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl mt-20 font-bold text-[#0d3966] mb-2">
        Join Our Team
      </h1>
      <p className="text-sm text-[#475569] mb-6">
        Send your CV (PDF, DOC/DOCX, PNG/JPG). One submission per email/phone.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            {...register("name")}
            className="mt-1 block w-full rounded-md border p-2"
          />
          <p className="text-xs text-red-600">
            {formState.errors.name?.message as any}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            {...register("email")}
            className="mt-1 block w-full rounded-md border p-2"
          />
          <p className="text-xs text-red-600">
            {formState.errors.email?.message as any}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Phone
          </label>
          <input
            {...register("phone")}
            className="mt-1 block w-full rounded-md border p-2"
          />
          <p className="text-xs text-red-600">
            {formState.errors.phone?.message as any}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            Department (optional)
          </label>
          <input
            {...register("department")}
            className="mt-1 block w-full rounded-md border p-2"
          />
        </div>

        <div className="mt-2">
          {/* clickable area */}
          <label
            htmlFor="file"
            className="cursor-pointer flex flex-col items-center justify-center gap-2 p-4 rounded-md border-2 border-dashed border-[#cbd5e1] hover:border-[#0d3966] hover:bg-[#f8fafc] transition"
          >
            <Upload size={40} className="text-[#0d3966]" />
            <span className="text-sm font-medium text-[#0d3966]">
              Upload Resume
            </span>
            <span className="text-xs text-gray-500">
              PDF, DOC, DOCX, PNG, JPG — max 3MB
            </span>
          </label>

          {/* real file input (visually hidden) */}
          <input
            id="file"
            type="file"
            accept=".pdf,.doc,.docx,image/png,image/jpeg"
            {...register("file")}
            ref={(e) => {
              // connect react-hook-form + local ref so we can clear the input
              register("file").ref(e);
              fileInputRef.current = e;
            }}
            className="sr-only"
          />

          {/* filename + remove button */}
          {(() => {
            const fl = watch("file") as FileList | undefined;
            const fileName = fl && fl[0] ? fl[0].name : null;
            if (!fileName) return null;
            return (
              <div className="mt-2 flex items-center justify-between gap-2 bg-gray-50 p-2 rounded">
                <div className="truncate text-sm text-gray-700">{fileName}</div>
                <button
                  type="button"
                  onClick={() => {
                    // clear react-hook-form value + real input element
                    setValue("file", undefined as any, {
                      shouldValidate: true,
                    });
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                >
                  Remove
                </button>
              </div>
            );
          })()}

          {/* validation message */}
          <p className="text-xs text-red-600 mt-1">
            {formState.errors.file?.message as any}
          </p>
        </div>

        {progress !== null && (
          <div className="w-full bg-gray-100 rounded h-3 overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-3 bg-[#0d3966] transition-all"
            ></div>
            <p className="text-xs text-gray-600 mt-1">{progress}%</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-[#0d3966] text-white disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Send Resume"}
          </button>

          <p className="text-xs text-gray-500">
            Max {MAX_FILE_MB}MB • PDF / DOC / DOCX / PNG / JPG
          </p>
        </div>
      </form>
    </main>
  );
}

