import {
  LayoutDashboard,
  BookImage,
  Stethoscope,
  GalleryHorizontal,
} from "lucide-react";

export const getMenuItems = (role) => {
  const adminPath = "/admin/dashboard";
  const authorPath = "/author/dashboard";
  const menuConfig = {
    admin: [
      {
        title: "Dashboard",
        path: adminPath,
        icon: <LayoutDashboard size={18} />,
      },
      {
        title: "Banners",
        path: `${adminPath}/banner`,
        icon: <GalleryHorizontal size={18} />,
      },
      {
        title: "Journals",
        icon: <BookImage size={18} />,
        subItems: [
          {
            title: "List of Journals",
            path: `${adminPath}/journals`,
          },
          {
            title: "Journals Mails",
            path: `${adminPath}/journals/journals-mails`,
          },
        ],
      },
      {
        title: "Editorial Board",
        icon: <Stethoscope size={18} />,
        subItems: [
          {
            title: "Members",
            path: `${adminPath}/editorial-board/members`,
          },
          {
            title: "Titles",
            path: `${adminPath}/editorial-board/titles`,
          },
          {
            title: "Assign Roles",
            path: `${adminPath}/editorial-board/assign-roles`,
          },
        ],
      },
    ],
    author: [
      {
        title: "Dashboard",
        path: authorPath,
        icon: <LayoutDashboard size={18} />,
      },
    ],
  };
  return menuConfig[role] || [];
};
