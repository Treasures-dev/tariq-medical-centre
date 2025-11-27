// components/common/PrescriptionModal.tsx
"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { z, type ZodIssue } from "zod";

const prescriptionSchema = z.object({
  medications: z.string().min(1, "Medications are required"),
  notes: z.string().optional(),
});

export type PrescriptionData = {
  medications: string;
  notes?: string;
};

type Props = {
  patientName: string;
  initialMedications?: string;
  initialNotes?: string;
  onClose: () => void;
  onSubmit: (data: PrescriptionData) => void;
  loading?: boolean;
};

export default function PrescriptionModal({
  patientName,
  initialMedications = "",
  initialNotes = "",
  onClose,
  onSubmit,
  loading = false,
}: Props) {
  const [medications, setMedications] = useState(initialMedications);
  const [notes, setNotes] = useState<string | undefined>(initialNotes || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validate the form values using zod
    const parsed = prescriptionSchema.safeParse({ medications, notes });
    if (!parsed.success) {
      const messages = parsed.error.issues.map((issue: any) => issue.message).join(", ");
      setError(messages);
      return;
    }

    setError(null);
    onSubmit(parsed.data); // pass the validated data to parent
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Prescription for {patientName}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

        <label className="text-sm font-medium text-gray-700">Medications</label>
        <textarea
          value={medications}
          onChange={(e) => setMedications(e.target.value)}
          placeholder="e.g. Tab Paracetamol 500mg - 1 OD"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />

        <label className="text-sm font-medium text-gray-700 mt-4">Notes / Instructions</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes for the patient"
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />

        <div className="flex justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-linear-to-r from-[#0d3a66] to-[#000080] text-white hover:from-[#000080] hover:to-[#0d3a66] transition-all"
          >
            {loading ? "Saving..." : "Save & Attach"}
          </button>
        </div>
      </form>
    </div>
  );
}
