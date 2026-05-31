"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  Chart1,
  CloseCircle,
  HamburgerMenu,
  Logout,
  SidebarLeft,
  SidebarRight,
  ArrowDown2,
  DollarSquare,
  ShoppingCart,
  Box,
  ShoppingBag,
} from "iconsax-reactjs";
import { useLocale, useTranslations } from "next-intl";
import { Database, FactoryIcon } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type MenuItem = {
  icon?: React.ComponentType<{ size?: number }>;
  label: string; // i18n key
  path?: string; // required for leaf
  children?: MenuItem[]; // nested items
};

const menuItems: MenuItem[] = [
  { icon: Chart1, label: "Dashboard", path: "/dashboard" },
  {
    label: "Master Data",
    icon: Database,
    children: [
      { label: "Products", path: "/dashboard/products" },
      { label: "Warehouses", path: "/dashboard/warehouses" },
      { label: "Suppliers", path: "/dashboard/suppliers" },
      { label: "Customers", path: "/dashboard/customers" },
      { label: "Departments", path: "/dashboard/departments" },
      { label: "Users", path: "/dashboard/users" },
    ],
  },
  {
    label: "Purchase",
    icon: ShoppingCart,
    children: [
      { label: "Purchase Orders", path: "/dashboard/purchase/orders" },
      { label: "Purchase Invoices", path: "/dashboard/purchase/invoices" },
    ],
  },
  {
    label: "Inventory",
    icon: Box,
    children: [
      { label: "Stock Transfer", path: "/dashboard/inventory/stock-transfer" },
      {
        label: "Stock Adjustments",
        path: "/dashboard/inventory/stock-adjustments",
      },
      {
        label: "Stock Counts",
        path: "/dashboard/inventory/stock-counts",
      },
      {
        label: "Depreciation",
        path: "/dashboard/inventory/depreciation",
      },
      {
        label: "Returns",
        path: "/dashboard/inventory/returns",
      },
      {
        label: "Expiry Management",
        path: "/dashboard/inventory/expiry-management",
      },
    ],
  },
  {
    label: "Sales",
    icon: ShoppingBag,
    children: [
      {
        label: "Sales Orders",
        path: "/dashboard/sales/orders",
      },
      {
        label: "Sales Invoices",
        path: "/dashboard/sales/invoices",
      },
      {
        label: "Sales Quotations",
        path: "/dashboard/sales/quotations",
      },
    ],
  },
  {
    label: "Accounting",
    icon: DollarSquare,
    children: [
      { label: "Sales", path: "/reports/sales" },
      { label: "Inventory", path: "/reports/inventory" },
    ],
  },
  {
    label: "Manufacturing",
    icon: FactoryIcon,
    children: [
      { label: "Sales", path: "/reports/sales" },
      { label: "Inventory", path: "/reports/inventory" },
    ],
  },
  {
    label: "Settings",
    icon: FactoryIcon,
    children: [
      {
        label: "Roles & Permissions",
        path: "/dashboard/roles-and-permissions",
      },
      { label: "Groups", path: "/dashboard/groups" },
      { label: "Inventory Data", path: "/dashboard/inventory" },
    ],
  },
];

/* Helper: flatten all leaf paths to detect active state */
function collectPaths(items: MenuItem[]): string[] {
  const acc: string[] = [];
  for (const item of items) {
    if (item.path) acc.push(item.path);
    if (item.children) acc.push(...collectPaths(item.children));
  }
  return acc;
}

/* Helper: does currentPath lie under this item's subtree? */
function pathMatchesSubtree(item: MenuItem, currentPath: string): boolean {
  if (item.path && currentPath === item.path) return true;
  if (item.children) {
    return item.children.some((c) => pathMatchesSubtree(c, currentPath));
  }
  return false;
}

export default function Sidebar() {
  const t = useTranslations(""); // flat keys (e.g., "Dashboard", "Users", ...)
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const locale = useLocale(); // "en" | "ar"
  const isRTL = locale === "ar";

  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname.replace(/^\/(en|ar)(?=\/|$)/, ""); // e.g. "/dashboard"

  const { logout } = useAuthStore();

  const toggleSidebar = () => setCollapsed((v) => !v);
  const toggleMobile = () => setMobileOpen((v) => !v);

  const onLogoutClick = () => {
    logout();
    router.push(`/${locale}/login`);
  };

  /* Track which submenus are open */
  const initialOpen: Record<string, boolean> = useMemo(() => {
    const open: Record<string, boolean> = {};
    for (const item of menuItems) {
      if (item.children && pathMatchesSubtree(item, currentPath)) {
        open[item.label] = true; // auto-expand parent of the active route
      }
    }
    return open;
  }, [currentPath]);

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(initialOpen);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpenMap(initialOpen), [initialOpen]); // keep in sync when route changes

  if (!mounted) return null;

  return (
    <>
      {/* mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* mobile toggle button (flip side for RTL) */}
      <button
        className={cn(
          "md:hidden fixed z-50 bg-white p-2 shadow",
          mobileOpen
            ? isRTL
              ? "top-0 right-[257px] rounded-l"
              : "top-0 left-[257px] rounded-r"
            : isRTL
            ? "top-4 right-4 rounded-md"
            : "top-4 left-4 rounded-md"
        )}
        onClick={toggleMobile}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <CloseCircle size={20} /> : <HamburgerMenu size={20} />}
      </button>

      {/* sidebar */}
      <aside
        className={cn(
          "h-screen fixed md:static top-0 z-40 flex flex-col justify-between bg-white text-secondary-700 transition-all duration-300",
          // side + border flip by locale
          isRTL
            ? "right-0 border-l border-secondary-100"
            : "left-0 border-r border-secondary-100",
          // widths
          collapsed ? "md:w-[72px]" : "md:w-64",
          // mobile open/closed width
          mobileOpen ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        <div className="py-4 flex flex-col h-full w-full relative overflow-auto">
          {/* header: logo + collapse button */}
          <div className="flex px-4 items-center justify-between mb-6">
            <div
              className={cn("transition-all", collapsed && "opacity-0 hidden")}
            >
              <Image
                src="/tawreed-logo.svg"
                width={150}
                height={38}
                alt="Logo"
              />
            </div>

            {/* collapse button (chevron flips for RTL) */}
            <button
              onClick={toggleSidebar}
              className="hidden md:block p-1"
              aria-label="Collapse sidebar"
              title={collapsed ? "Expand" : "Collapse"}
            >
              {!collapsed ? (
                isRTL ? (
                  <SidebarRight size={20} />
                ) : (
                  <SidebarLeft size={20} />
                )
              ) : isRTL ? (
                <SidebarLeft size={20} />
              ) : (
                <SidebarRight size={20} />
              )}
            </button>
          </div>

          {/* nav */}
          <nav className="flex-1 px-4 overflow-y-auto overflow-x-hidden">
            <ul
              className={cn("mt-2 flex flex-col gap-1", isRTL && "text-right")}
            >
              {menuItems.map((item) => {
                const hasChildren = !!item.children?.length;

                if (!hasChildren && item.path) {
                  const isActive = currentPath === item.path;
                  const href = `/${locale}${item.path}`;
                  const Icon = item.icon;

                  return (
                    <li key={item.label}>
                      <Link
                        href={href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded ty-body-sm cursor-pointer",
                          isActive
                            ? "bg-primary-50 text-secondary-700"
                            : "text-secondary-500 hover:bg-primary-50 hover:text-secondary-700"
                        )}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {Icon && <Icon size={20} />}
                        {!collapsed && <span>{t(item.label)}</span>}
                      </Link>
                    </li>
                  );
                }

                // Parent with submenu
                const isOpen = !!openMap[item.label];
                const toggle = () =>
                  setOpenMap((prev) => ({
                    ...prev,
                    [item.label]: !prev[item.label],
                  }));

                // If collapsed: render a tooltip-like minimal parent button (no submenu)
                if (collapsed) {
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        onClick={toggle}
                        className={cn(
                          "w-full flex items-center justify-center px-3 py-2 rounded ty-body-sm text-secondary-500 hover:bg-primary-50 hover:text-secondary-700"
                        )}
                        title={t(item.label)}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                      >
                        {Icon ? <Icon size={20} /> : <ArrowDown2 size={16} />}
                      </button>
                    </li>
                  );
                }

                // Expanded: show collapsible parent + its children
                return (
                  <li key={item.label} className="group">
                    <button
                      type="button"
                      onClick={toggle}
                      className={cn(
                        "w-full flex items-center ty-body-sm text-secondary-500 hover:bg-primary-50 hover:text-secondary-700 gap-2 ps-3",
                        "py-2"
                      )}
                    >
                      {item.icon && <item.icon size={22} />}

                      <span>{t(item.label)}</span>

                      <ArrowDown2
                        size={16}
                        className={cn(
                          "transition-transform ms-auto",
                          isOpen ? "rotate-180" : "rotate-0"
                        )}
                      />
                    </button>

                    <ul
                      id={`submenu-${item.label}`}
                      className={cn(
                        "mt-1 space-y-2 overflow-hidden transition-[max-height,opacity] duration-300",
                        // inner padding left/right by locale
                        isRTL ? "pr-4" : "pl-4",
                        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      )}
                    >
                      {item.children!.map((child) => {
                        const href = `/${locale}${child.path}`;
                        const active = currentPath === child.path;

                        return (
                          <li key={child.label}>
                            <Link
                              href={href}
                              onClick={() => setMobileOpen(false)}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                // container (chip)
                                "group flex items-center ty-body-sm rounded-lg transition-colors",
                                "px-5 py-3", // space like the comp
                                active
                                  ? "bg-primary-50 text-secondary-700"
                                  : "text-secondary-500 hover:bg-primary-50 hover:text-secondary-700"
                              )}
                            >
                              {/* bullet */}
                              <span
                                className={cn(
                                  "shrink-0 rounded-full",
                                  "size-1.25",
                                  active
                                    ? "bg-secondary-700"
                                    : "bg-secondary-400",
                                  isRTL ? "ml-3" : "mr-3" // gap from label
                                )}
                              />
                              {/* label */}
                              <span className="leading-none">
                                {t(child.label)}
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* footer */}
        <div className={cn("mt-12 p-4 pb-8", isRTL && "text-right")}>
          {!collapsed && <LanguageSwitcher isDropDown={false} />}
          <button
            type="button"
            className={cn("mt-4 flex items-center gap-2 cursor-pointer")}
            onClick={onLogoutClick}
          >
            <Logout size={16} />
            {!collapsed && <span>{t("Logout")}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
