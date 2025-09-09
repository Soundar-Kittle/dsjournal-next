import {
  CalendarClock,
  LayoutDashboard,
  BookImage,
  Stethoscope,
  GalleryHorizontal,
} from "lucide-react";

export const MenuItems = () => {

  const adminItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      title: "Banners",
      path: "/dashboard/banner",
      icon: <GalleryHorizontal size={18} />,
    },
    {
      title: "Journals",
      icon: <BookImage size={18} />,
      subItems: [
        {
          title: "List of Journals",
          path: "/dashboard/journals",
        },
        {
          title: "Journals Mails",
          path: "/dashboard/journals/journals-mails",
        },
      ]
    },
    {
      title: "Editorial Board",
      icon: <Stethoscope size={18} />,
      subItems: [
        {
          title: "Members",
          path: "/dashboard/editorial-board/members",
        },
        {
          title: "Titles",
          path: "/dashboard/editorial-board/titles",
        },
        {
          title: "Assign Roles",
          path: "/dashboard/editorial-board/assign-roles",
        },
      ]
    },
  ];

  // if (user?.user_type === "Admin") {
    // return [...adminItems];
  // }

  return adminItems;
};
