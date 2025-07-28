import RegisterForm from '../../../components/forms/auth/RegisterForm';
import { ThemeProvider } from '../../../contexts/ThemeContext';

export default function RegisterPage() {
  return (
    <ThemeProvider>
      <RegisterForm />
    </ThemeProvider>
  );
}
