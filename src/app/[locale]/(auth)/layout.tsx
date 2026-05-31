import LanguageSwitcher from "@/components/LanguageSwitcher";
import Image from "next/image";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-auto">
      <div className="px-8 py-3 flex justify-between items-center gap-4 flex-wrap">
        <div>
          <Image
            src={"/tawreed-logo.svg"}
            alt="Tawreed Logo"
            width={150}
            height={45}
          />
        </div>

        <div>
          <LanguageSwitcher />
        </div>
      </div>
      <div className="flex-center bg-primary-700 p-4 flex-1">
        <div className="px-8 py-12 rounded-3xl bg-white md:min-w-md lg:min-w-xl md:pt-16">
          {children}
        </div>
      </div>
    </div>
  );
}
