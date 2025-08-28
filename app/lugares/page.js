import LugaresAfiliados from "@/components/view/main/LugaresAfiliados";
import ProvidersWrapper from "@/components/ProvidersWrapper";
import Header from "@/components/view/main/Header";

export default function LugaresPage() {
  return (
    <ProvidersWrapper>
      <Header />
      <LugaresAfiliados />
    </ProvidersWrapper>
  );
}
