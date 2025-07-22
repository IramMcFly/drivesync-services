import AsistenteEspecializado from "@/components/extra/ChatIA";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Header from "@/components/view/main/Header";

export default function Home() {
  return (
    <SessionProviderWrapper>
      <Header />
      <AsistenteEspecializado />
    </SessionProviderWrapper>
  );
}
