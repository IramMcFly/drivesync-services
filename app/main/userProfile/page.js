
import UserProfile from "@/components/view/main/UserProfile";
import ProvidersWrapper from "@/components/ProvidersWrapper";
import Header from "@/components/view/main/Header";

export default function Home() {
  return (
    <ProvidersWrapper>
      <Header />
      <UserProfile />
    </ProvidersWrapper>
  );
}
