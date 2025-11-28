"use client";
import { Doctor } from "@/lib/types/types";
import "../css/team.css";
import React, { useState, useEffect } from "react";
import useSWR from "swr";
import BlurText from "@/components/BlurText";
import Link from "next/link";

export default function TeamCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const fetcher = (url: string) => fetch(url).then((r) => r.json());

  const { data: docData } = useSWR("api/admin/doctors", fetcher , {
    revalidateOnFocus:false,
    dedupingInterval:60_000,
    fallbackData:{doctors:[]}
  });
  const doctors = docData?.doctors ?? [];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % doctors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [doctors.length]);

  const updateCarousel = (newIndex: number) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const normalizedIndex = (newIndex + doctors.length) % doctors.length;
    setCurrentIndex(normalizedIndex);

    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  const getCardClass = (index: number) => {
    const offset = (index - currentIndex + doctors.length) % doctors.length;

    if (offset === 0) return "center";
    if (offset === 1) return "right-1";
    if (offset === 2) return "right-2";
    if (offset === doctors.length - 1) return "left-1";
    if (offset === doctors.length - 2) return "left-2";
    return "hidden";
  };

  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === "ArrowLeft") {
        updateCarousel(currentIndex - 1);
      } else if (e.key === "ArrowRight") {
        updateCarousel(currentIndex + 1);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isAnimating]);

  const handleTouchStart = (e: any) => {
    setTouchStart(e.changedTouches[0].screenX);
  };

  const handleTouchEnd = (e: any) => {
    setTouchEnd(e.changedTouches[0].screenX);
    const swipeThreshold = 50;
    const diff = touchStart - e.changedTouches[0].screenX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        updateCarousel(currentIndex + 1);
      } else {
        updateCarousel(currentIndex - 1);
      }
    }
  };

  return (
    <div
      className="flex flex-col items-center curve bg-[#f0f4ff]  justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Heading Section */}
      <div className="mx-auto max-w-2xl bg-teal-100 rounded-b-2xl p-6 text-center">
        <h3 className="text-base font-semibold text-[#0d3a66]">
          Experienced professionals, personalized care.
        </h3>
        <div className="flex justify-center">
          <BlurText
            text="Meet Our Experts."
            className="text-center text-2xl font-semibold tracking-tight text-[#000080]"
          />
        </div>
        <p className="mt-2 text-sm text-[#0d3a66]">
          Specialists committed to your health.
        </p>
      </div>

      <div className="carousel-container ">
        <button
          className="nav-arrow left"
          onClick={() => updateCarousel(currentIndex - 1)}
        >
          ‹
        </button>

        <div className="carousel-track">
          {doctors.map((doctor: Doctor, index: number) => (
            <div
              key={doctor._id} // unique key
              className={`card ${getCardClass(index)}`}
              data-index={index}
              onClick={() => updateCarousel(index)}
            >
              <Link href={`doctors/${doctor.slug}`}>
                <img
                  src={doctor.avatar || "/images/placeholder.jpg"}
                  alt={doctor.name}
                />
              </Link>
            </div>
          ))}
        </div>

        <button
          className="nav-arrow right"
          onClick={() => updateCarousel(currentIndex + 1)}
        >
          ›
        </button>
      </div>
      

      <div className="member-info">
        {doctors[currentIndex] && (
          <>
            <a
              href={`doctors/${doctors[currentIndex].slug}`}
              className="member-name"
            >
              {doctors[currentIndex].name}
            </a>
            <p className="member-role">{doctors[currentIndex].specialty}</p>
            <a
              href={
                doctors[currentIndex].dept?.slug
                  ? `departments/${doctors[currentIndex].dept?.slug}`
                  : "/departments"
              }
              className="pb-2  text-gray-500 text-sm"
            >
              {doctors[currentIndex].dept?.name}
            </a>
          </>
        )}
      </div>
     
    </div>
  );
}
