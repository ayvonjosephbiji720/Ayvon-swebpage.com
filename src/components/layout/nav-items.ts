import {
  LayoutDashboard,
  Briefcase,
  CalendarDays,
  BookOpen,
  HandHeart,
  CheckSquare,
  BarChart3,
  Bot,
  Target,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Job Tracker", icon: Briefcase },
  { href: "/daily-target", label: "Daily Target", icon: Target },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/study", label: "Study Planner", icon: BookOpen },
  { href: "/prayer", label: "Prayer", icon: HandHeart },
  { href: "/todo", label: "To-Do List", icon: CheckSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];
