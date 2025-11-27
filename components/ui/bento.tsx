import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon,
} from "@radix-ui/react-icons"
import { BentoCard, BentoGrid } from "./bento-grid"
import { Bell, CalendarCheck, Camera, Pill, Stethoscope, TestTube2 } from "lucide-react";
import BlurText from "../BlurText";


const features = [
  {
    Icon: TestTube2,
    name: "Online Lab Reports",
    description: "Access your diagnostic test results securely from anywhere.",
    href: "/lab-reports",
    cta: "View reports",
    background: <img src="/images/labs.jpg" className="absolute h-full blur-[1px] hover:blur-[0px] object-cover" />,
    className:
      "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: CalendarCheck,
    name: "Online Appointments",
    description: "Book appointments with our specialists in just a few clicks.",
    href: "/dashboard",
    cta: "Book now",
    background: <img src="/images/dentistry.jpg" className="absolute  blur-[1px] hover:blur-[0px] transition-all" />,
    className:
      "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Stethoscope,
    name: "Experienced Doctors",
    description: "Consult with highly qualified doctors across multiple specialties.",
    href: "/doctors",
    cta: "Meet our team",
    background: <img src="/images/docsss.png" className="absolute h-full blur-[1px] hover:blur-[0px] object-cover" />,
    className:
      "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Pill,
    name: "Pharmacy Services",
    description: "Order medicines easily with fast, reliable delivery from our pharmacy.",
    href: "/pharmacy",
    cta: "Order now",
    background: <img src="/images/pharmacy.jpg"  className="absolute blur-[1px] h-full object-fill" />,
    className:
      "lg:col-start-3 bg-[#91d6ed] lg:col-end-4 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Camera,
    name: "Online Consultions",
    description:
      "Receive instant updates about reports, appointments, prescriptions, and more.",
    href: "/notifications",
    cta: "Enable alerts",
    background: <img src="/images/online.jpg" className="absolute h-full blur-[1px] hover:blur-[0px] object-cover" />,
    className:
      "lg:col-start-3 bg-[#a090d1] lg:col-end-4 lg:row-start-2 lg:row-end-4",
  },
];

export function BentoDemo() { 
  return (
    <>
    <div className="p-0 m-0 gap-0">
    <div className="mx-auto max-w-2xl text-center">
          <h3 className="text-base font-semibold text-[#0d3a66]">Meet Our Leadership & Team</h3>
          <div className="flex text-center justify-center">
          <BlurText
          text="Experts you can trust"
          className="text-center text-4xl font-semibold tracking-tight text-[#000080] sm:text-5xl"
          />    
          </div>
          
          <p className="mt-4 text-sm text-[#0d3a66]">From the Medical Director to the Head Pharmacist — introduced below are the people who run Tariq Medical Centre.</p>
        </div>
    
    <BentoGrid className="lg:grid-rows-3 p-4 sm:p-8 md:p-12 lg:p-20 xl:p-32">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
    </div>
    
    </>
  )
}
