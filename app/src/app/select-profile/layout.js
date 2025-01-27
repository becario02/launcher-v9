import NavbarSelectProfile from "@/components/NavbarSelectProfile";

export default function SelectProfileLayout({ children }) {
  return (
    <div className="h-[100dvh] flex flex-col">
      <NavbarSelectProfile />
      <main className="flex-1 bg-gradient-to-br from-[#f0f9ff] via-[#f8fcff] to-[#edf8ff] overflow-hidden shadow-[0_12px_24px_-2px_rgba(0,0,0,0.25),0_-1px_0_0_rgba(0,0,0,0.1)]">
        {children}
      </main>
    </div>
  );
}
