// src/components/layouts/DashboardLayout.jsx
// import Sidebar from "./Sidebar"
// import { Avatar, AvatarImage } from "@/components/ui/avatar"
// import { Separator } from "@/components/ui/separator"

// export default function DashboardLayout({ children }) {
//   return (
//     <div className="flex h-screen">
//       <Sidebar />

//       <main className="flex-1 p-6 overflow-y-auto">
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl font-semibold">Dashboard</h1>
//           <Avatar>
//             <AvatarImage src="https://i.pravatar.cc/300" alt="User" />
//           </Avatar>
//         </div>

//         <Separator className="mb-6" />
//         {children}
//       </main>
//     </div>
//   )
// }
import { Sidebar } from "@/components/sidebar/Sidebar.jsx";
import { MenuItems } from "./menuItems";

const DashboardLayout = ({ children }) => {
  return (
    <Sidebar menuItems={MenuItems()} drawerBreakpoint="md">
      {children}
    </Sidebar>
  );
};

export default DashboardLayout;
