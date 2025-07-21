import Header from "@/components/view/main/Header";
import ServiceForm from "@/components/view/main/serviceForm";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export default function Home() {
  return (
    <SessionProviderWrapper>
      <Header />
      <ServiceForm />
    </SessionProviderWrapper>
  );
}
