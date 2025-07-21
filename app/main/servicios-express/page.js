
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import Header from "@/components/view/main/Header";
import Servicios from "@/components/view/main/Servicios";

export default function Home() {
  return (
    <SessionProviderWrapper>
      <Header />
      <Servicios />
    </SessionProviderWrapper>
  );
}
