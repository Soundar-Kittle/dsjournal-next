import { Sidebar } from "@/components/sidebar/Sidebar.jsx";
import { getMenuItems } from "./menuItems";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}

const DashboardLayout = async ({ children }) => {
  const user = await getUser();
  const role = user?.role || "user";
  const menuItems = getMenuItems(role);
  return (
    <Sidebar menuItems={menuItems} user={user} drawerBreakpoint="md">
      {children}
    </Sidebar>
  );
};

export default DashboardLayout;
