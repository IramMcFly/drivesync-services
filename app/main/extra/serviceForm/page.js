import Header from "@/components/view/main/Header";
import ServiceForm from "@/components/view/main/serviceForm";
import ProvidersWrapper from "@/components/ProvidersWrapper";

export default function Home() {
  return (
    <ProvidersWrapper>
      <Header />
      <ServiceForm />
    </ProvidersWrapper>
  );
}
