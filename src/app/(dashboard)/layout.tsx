import Link from "next/link";
import { getRequiredSession } from "@/lib/auth/session";
import { signOut } from "@/lib/auth";
import { LayoutDashboard, Link2, Megaphone, Users, Mail, Settings, LogOut } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/connections", label: "Connections", icon: Link2 },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/templates", label: "Templates", icon: Mail },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getRequiredSession();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center border-b border-gray-200 px-5">
          <span className="text-base font-bold text-gray-900">Formly</span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <div className="mb-2 px-3 py-1">
            <p className="truncate text-xs font-medium text-gray-900">{session.user?.name ?? "Account"}</p>
            <p className="truncate text-xs text-gray-500">{session.user?.email}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="size-4 shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
