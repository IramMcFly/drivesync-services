
import Asistencia from "@/components/view/main/Asistencia";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Header from "@/components/view/main/Header";

export default function Home() {
  return (
    <SessionProviderWrapper>
      <Header />
      <Asistencia />
    </SessionProviderWrapper>
  );
}
