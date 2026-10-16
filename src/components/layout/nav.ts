import { BookOpen, Compass, Flower2, Home, MessageCircle, Repeat, Settings, User } from "lucide-react";

export const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/meditation", label: "Meditation", icon: Flower2 },
  { to: "/journal", label: "My Journal", short: "Journal", icon: BookOpen },
  { to: "/profile", label: "My Profile", short: "Profile", icon: User },
  { to: "/chanting", label: "Japa Counter", short: "Japa", icon: Repeat },
  { to: "/assistant", label: "Ask Jitendriya", short: "Ask", icon: MessageCircle },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;
