import RegisterTaller from '@/components/forms/auth/RegisterTaller';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RegisterPage() {
  return (
    <ThemeProvider>
      <RegisterTaller />
    </ThemeProvider>
  );
}
