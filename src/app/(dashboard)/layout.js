import "./dashboard.css";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Toaster } from "sonner";
import { Providers } from "../providers"; // adjust the path as needed

export const metadata = {
  title: "Dashboard - Dream Science",
  description: "Decentralized Journal Publishing Platform",
};

export default function Dashboardshell({ children }) {
  return (
    <Providers>
      <DashboardLayout>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </DashboardLayout>
    </Providers>
  );
}
