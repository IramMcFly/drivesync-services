
import Asistencia from "@/components/view/main/Asistencia";
import ProvidersWrapper from "@/components/ProvidersWrapper";
import Header from "@/components/view/main/Header";

export default function Home() {
  return (
    <ProvidersWrapper>
      <Header />
      <Asistencia />
    </ProvidersWrapper>
  );
}
