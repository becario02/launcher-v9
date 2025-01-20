import LoginForm from "@/components/LoginForm";
import LoginCarousel from "@/components/LoginCarousel";

export default function Home() {
  return (
    <main className="flex min-h-screen">
      <LoginCarousel />
      <LoginForm />
    </main>
  );
}