import AdminPanel from "@/components/AdminPanel";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Home() {
  return (
    <ThemeProvider>
      <AdminPanel />
    </ThemeProvider>
  );
}
