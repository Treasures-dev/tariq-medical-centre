// components/admin/OngoingTreatmentModal.tsx
"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { SuseFont } from "@/lib/utils";
import { OngoingTreatmentInput, ongoingTreatmentSchema } from "@/lib/validators/treatments";

type Props = {
  open: boolean;
  onClose: () => void;
  afterSave?: (data: any) => void;
};

export default function OngoingTreatmentModal({ open, onClose, afterSave }: Props) {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<OngoingTreatmentInput>({
    resolver: zodResolver(ongoingTreatmentSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      diagnosis: "",
      notes: "",
      plan: [{ step: "", date: undefined }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "plan" as const });

  async function onSubmit(data: OngoingTreatmentInput) {
    try {
      const res = await fetch("/api/treatments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      
      const json = await res.json();
      if (!json.ok) throw new Error(json?.error ?? "Save failed");
      reset();
      onClose();
      afterSave?.(json);
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Save failed");
    }
  }

  if (!open) return null;

  return (
    <div className={`${SuseFont.className} fixed inset-0 z-50 flex items-center justify-center p-4`}>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#0d3a66]">Add Ongoing Treatment</h3>
          <button onClick={onClose} className="text-sm text-[#0d3a66]">Close</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-[#0d3a66]">Patient ID</label>
              <input {...register("patientId")} className="w-full rounded-md border px-3 py-2" />
              {errors.patientId && <div className="text-xs text-red-600">{String(errors.patientId.message)}</div>}
            </div>

            <div>
              <label className="block text-xs text-[#0d3a66]">Doctor ID</label>
              <input {...register("doctorId")} className="w-full rounded-md border px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#0d3a66]">Diagnosis</label>
            <input {...register("diagnosis")} className="w-full rounded-md border px-3 py-2" />
          </div>

          <div>
            <label className="block text-xs text-[#0d3a66]">Notes</label>
            <textarea {...register("notes")} className="w-full rounded-md border px-3 py-2" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs text-[#0d3a66]">Plan</label>
              <button type="button" onClick={() => append({ step: "", date: undefined })} className="text-xs text-[#0d3a66]">Add</button>
            </div>

            <div className="mt-2 space-y-2">
              {fields.map((f, i) => (
                <div key={f.id} className="flex items-center gap-2">
                  <input {...register(`plan.${i}.step` as const)} placeholder="Step description" className="w-full rounded-md border px-2 py-1 text-sm" />
                  <input type="date" {...register(`plan.${i}.date` as const)} className="rounded-md border px-2 py-1 text-sm" />
                  <button type="button" onClick={() => remove(i)} className="text-xs text-red-600">Remove</button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-md bg-[#0d3a66] px-4 py-2 text-sm text-white">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
