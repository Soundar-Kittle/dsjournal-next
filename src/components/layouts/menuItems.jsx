import {
  LayoutDashboard,
  BookImage,
  GalleryHorizontal,
  ChevronsLeftRight,
  Timer,
} from "lucide-react";
import { MdEditDocument } from "react-icons/md";

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
        title: "Call for Papers",
        path: `${adminPath}/call-for-papers`,
        icon: <Timer size={18} />,
      },
      {
        title: "Journals",
        icon: <BookImage size={18} />,
        subItems: [
          {
            title: "Volume & Issue",
            path: `${adminPath}/journals/volume-issue`,
          },
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
        icon: <MdEditDocument size={18} />,
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
      {
        title: "Meta",
        path: `${adminPath}/meta`,
        icon: <ChevronsLeftRight size={18} />,
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
