import DashboardLayoutHeader from "@/components/Dashboard/Layout/DashboardLayoutHeader";
import Sidebar from "@/components/Dashboard/Layout/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid grid-cols-[auto_1fr] min-h-screen">
      <aside>
        <Sidebar />
      </aside>

      <div
        className="overflow-auto h-full flex flex-col max-h-screen bg-[#F8FAFC]"
        id="dashboardContainer"
      >
        <DashboardLayoutHeader />

        <main className="flex-1">
          <>{children}</>
        </main>
      </div>
    </div>
  );
}
