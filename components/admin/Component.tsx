import { Menu, Calendar, Activity, ClipboardPlus, User, GraduationCapIcon } from "lucide-react";
import {
  FaPills,
  FaUserMd,
  FaNotesMedical,
  FaPrescriptionBottleAlt,
} from "react-icons/fa";
import { auth } from "@/auth"; // path to your Better Auth server instance
import { authClient } from "@/lib/auth/authClient";
import { router } from "better-auth/api";
import toast from "react-hot-toast";

const navItems = [
  { key: "overview", label: "Overview", icon: Activity },
  { key: "doctors", label: "Doctors", icon: FaUserMd },
  { key: "appointments", label: "Appointments", icon: Calendar },
  { key: "departments", label: "Departments", icon: User },

  {
    key: "prescriptions",
    label: "Prescriptions",
    icon: FaPrescriptionBottleAlt,
  },
  { key: "pharmacy", label: "Pharmacy", icon: FaPills },
  { key: "services", label: "Services", icon: ClipboardPlus },
  { key: "applications", label: "Hiring", icon: GraduationCapIcon },
];

export function IconWrapper({ Icon }: { Icon: any }) {
  return <Icon className="h-5 w-5" />;
}

export function Sidebar({
  active,
  onChange,
  collapsed,
  onToggle,
}: {
  active: string;
  onChange: (k: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = authClient.useSession();

  const logout = async () => {
    const ok = window.confirm("Are you sure to log-out?");
    if (!ok) return;
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.open('/')
          toast.success("Logged out successfully!"); // redirect to login page
        },
      },
    });
  };

  return (
    <aside
      className={`bg-white shadow-lg ${
        collapsed ? "w-20" : "w-64"
      } mt-24 transition-all duration-300 p-4 flex flex-col gap-4 rounded-2xl`}
    >
      <div className="flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-semibold text-sm">
              TM
            </div>
            <div>
              <div className="text-sm font-bold text-[#0d3a66]">
                Tariq Medical
              </div>
              <div className="text-xs text-gray-500">Admin Panel</div>
            </div>
          </div>
        )}

        <button
          onClick={onToggle}
          className="rounded-lg p-2 text-[#0d3a66] hover:bg-gray-100 transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <nav className="mt-4 flex-1 overflow-auto">
        <ul className="flex flex-col gap-2">
          {navItems.map((n) => {
            const activeCls =
              active === n.key
                ? "bg-[#0d3a66] text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100";
            return (
              <li key={n.key}>
                <button
                  onClick={() => onChange(n.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${activeCls}`}
                >
                  <span className="flex items-center justify-center w-6">
                    {typeof n.icon === "function" ? (
                      <n.icon />
                    ) : (
                      <IconWrapper Icon={n.icon} />
                    )}
                  </span>
                  {!collapsed && (
                    <span className="truncate font-medium text-sm">
                      {n.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      {!collapsed && session?.user.image && (
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="text-xs font-medium text-gray-500 mb-2">
            Logged in as
          </div>
          <div className="flex items-center gap-3">
            {/* Image wrapper */}
            <div className="h-9 w-9 rounded-full overflow-hidden shrink-0">
              <img
                src={session.user?.image}
                alt={session.user?.name || "User"}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-semibold text-[#0d3a66]">
                {session.user.name}
              </div>
              <div className="text-xs text-gray-500">{session.user.email}</div>
            </div>
          </div>
        </div>
      )}
      <button
        onClick={logout}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
      >
        {/* Optional icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
          />
        </svg>
        Log Out
      </button>
    </aside>
  );
}

export function Topbar({
  onCreate,
  activeTab,
}: {
  onCreate?: () => void;
  activeTab?: string;
}) {
  const getLabel = () => {
    switch (activeTab) {
      case "doctors":
        return "+ Add Doctor";
      case "services":
        return "+ Add Service";
      case "pharmacy":
        return "+ Add Product";
      case "ongoing":
        return "+ Add Treatment";
      default:
        return "+ Create New";
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 p-6 mt-24 bg-white rounded-2xl shadow-sm">
      <div>
        <h2 className="text-2xl font-bold text-[#0d3a66]">Admin Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage doctors, services, and pharmacy items
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onCreate}
          className="rounded-lg bg-[#16a34a] hover:bg-[#15803d] px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-sm"
        >
          {getLabel()}
        </button>
        <div className="h-10 w-10 rounded-full bg-linear-to-br from-[#0d3a66] to-[#1e5a8e] flex items-center justify-center text-white font-semibold cursor-pointer">
          A
        </div>
      </div>
    </div>
  );
}

export function StatCard({
  title,
  value,
  delta,
}: {
  title: string;
  value: string | number;
  delta?: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {title}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <div className="text-3xl font-bold text-[#0d3a66]">{value}</div>
        {delta && (
          <div className="text-sm font-semibold text-green-600">{delta}</div>
        )}
      </div>
    </div>
  );
}
