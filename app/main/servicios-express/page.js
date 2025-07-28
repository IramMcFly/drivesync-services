
import ProvidersWrapper from "@/components/ProvidersWrapper";
import Header from "@/components/view/main/Header";
import Servicios from "@/components/view/main/Servicios";

export default function Home() {
  return (
    <ProvidersWrapper>
      <Header />
      <Servicios />
    </ProvidersWrapper>
  );
}
