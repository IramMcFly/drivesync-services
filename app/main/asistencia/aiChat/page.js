import AsistenteEspecializado from "@/components/extra/ChatIA";
import ProvidersWrapper from "@/components/ProvidersWrapper";
import Header from "@/components/view/main/Header";

export default function Home() {
  return (
    <ProvidersWrapper>
      <Header />
      <AsistenteEspecializado />
    </ProvidersWrapper>
  );
}
