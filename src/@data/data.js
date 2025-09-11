export const publicationFrequencies = [
  "Monthly",
  "Quarterly",
  "Biannual",
  "Annual",
  "4 Issue Per Year",
];
export const languages = ["English", "Hindi", "Tamil", "French", "Arabic"];
export const formatofpublication = ["Online", "Print"];

export const linkOptions = [
  { value: "journals", label: "Journals", type: "link" },
  { value: "authors", label: "Authors", type: "link" },
  { value: "reviewers", label: "Reviewers", type: "link" },
  { value: "editors", label: "Editors", type: "link" },
];

// export const roleThemes = {
//   admin: {
//     bg: "bg-gradient-to-r from-primary via-secondary to-primary ",
//     button: "bg-gradient-to-b from-primary to-secondary hover:from-secondary hover:to-primary",
//     accent: "text-primary",
//   },
//   author: {
//     bg: "bg-gradient-to-r from-secondary via-primary to-secondary",
//     button: "bg-gradient-to-b from-secondary to-primary hover:from-secondary hover:to-primary",
//     accent: "text-secondary",
//   },
//   editor: {
//     bg: "bg-gradient-to-br from-teal-500 to-emerald-700",
//     button: "bg-teal-600 hover:bg-teal-700",
//     accent: "text-teal-300",
//   },
//   default: {
//     bg: "bg-gradient-to-br from-primary to-secondary",
//     button: "bg-gradient-to-br from-primary to-secondary hover:from-secondary hover:to-primary",
//     accent: "text-primary",
//   },
// };
export const roleThemes = {
  admin: {
    bg: "bg-primary",
    button: "bg-primary hover:bg-primary/80",
    accent: "text-primary",
  },
  author: {
    bg: "bg-secondary",
    button: "bg-secondary hover:bg-secondary/80",
    accent: "text-secondary",
  },
  editor: {
    bg: "bg-gradient-to-br from-teal-500 to-emerald-700",
    button: "bg-teal-600 hover:bg-teal-700",
    accent: "text-teal-300",
  },
  default: {
    bg: "bg-gradient-to-br from-primary to-secondary",
    button: "bg-gradient-to-br from-primary to-secondary hover:from-secondary hover:to-primary",
    accent: "text-primary",
  },
};

