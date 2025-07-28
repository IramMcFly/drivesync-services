
import LoginForm from "@/components/forms/auth/LoginForm";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Home() {
  return (
    <ThemeProvider>
      <LoginForm />
    </ThemeProvider>
  );
}
