// components/StatCard.tsx
"use client";
import React from "react";

export const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; borderColor?: string; gradient?:string }> = ({
  title,
  value,
  icon,
  borderColor = "border-[#000080]",
}) => (
  <div className={`bg-white rounded-xl shadow-md p-6 border-t-4 ${borderColor}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-[#000080] mt-1">{value}</p>
      </div>
      <div className="w-12 h-12 bg-white/50 rounded-lg flex items-center justify-center">{icon}</div>
    </div>
  </div>
);

export default StatCard;
