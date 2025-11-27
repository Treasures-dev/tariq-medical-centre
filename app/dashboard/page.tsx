import { authClient } from "@/lib/auth/authClient";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { auth } from "@/auth";
import { headers } from "next/headers";
import DoctorDashboardPage from "@/components/doctor/Dashboard";
import PatientDashboardPage from "@/components/patients/Dashboard";
import RedirectModal from "@/components/common/RedirectModal";

const Dashboard = async () => {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  const role = session?.user.role;

  if (!session) {
    return (
      <RedirectModal
        title="Access Denied"
        message="You must be logged in to access the dashboard. Redirecting to login..."
        redirectUrl="/auth"
        redirectDelay={3000}
      />
    );
  }

  // Render dashboard based on role
  switch (role) {
    case "admin":
      return <AdminDashboard />;
    case "doctor":
      return <DoctorDashboardPage />;
    case "patient":
      return <PatientDashboardPage />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center text-gray-700">
          Unknown role
        </div>
      );
  }
};

export default Dashboard;
