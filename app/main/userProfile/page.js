
import UserProfile from "@/components/view/main/UserProfile";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export default function Home() {
  return (
    <SessionProviderWrapper>
      <UserProfile />
    </SessionProviderWrapper>
  );
}
