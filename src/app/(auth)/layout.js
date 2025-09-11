import { Toaster } from "sonner";
import "./auth.css";

export const metadata = {
  title: "Dream Science Admin Login",
  description: "Decentralized Journal Publishing Platform",
};

export default function AdminLayout({ children }) {
  return (
    <div>
      {children}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
