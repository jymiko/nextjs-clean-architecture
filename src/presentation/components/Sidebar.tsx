import { LayoutDashboard, Database, FileText, FolderOpen, Settings, LogOut, ChevronDown, Users, Building2, FilePlus, FileEdit, FileQuestion, FileCheck2, FolderCog, Share2, FileX, Layers } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { tokenManager } from "@/lib/auth/token-manager";
import { clearAuthCookies } from "@/lib/cookies";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  currentPage?: string;
  defaultExpandedItems?: string[];
}

export function Sidebar({ isOpen, onClose, defaultExpandedItems = [] }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpandedItems);
  const pathname = usePathname();
  const router = useRouter();

  const toggleExpand = (item: string) => {
    setExpandedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleLogout = async () => {
    try {
      await tokenManager.logout();
      clearAuthCookies();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens locally even if server logout fails
      tokenManager.clearTokens();
      clearAuthCookies();
      router.push('/login');
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[280px] bg-white overflow-hidden transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Title */}
          <div className="p-5 border-b border-[#f7fafb]">
            <div className="flex items-center gap-2.5">
              <div className="relative w-[43px] h-[31px]">
                <Image
                  src="/assets/cbc954a6519ff310baa5cbff4ac5fc4ac8ac03d0.png"
                  alt="Gacoan Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[#243644] text-[13px] font-semibold">DCMS</span>
                <span className="text-[#738193] text-[10px] font-medium">Mie Gacoan</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/dashboard"
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                    pathname === "/dashboard" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] transition-colors hover:bg-[#d6eef9]"
                  }`}
                >
                  <LayoutDashboard className="size-5" />
                  <span className="flex-1 text-left">Dashboard</span>
                </Link>
              </li>

              <li>
                <button
                  onClick={() => toggleExpand("data-master")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-[#F8F9FA] ${
                    pathname?.startsWith("/master-data") ? "bg-[#f1f4ff] text-[#00b3d8]" : "text-[#425166]"
                  }`}
                >
                  <Database className="size-5 shrink-0" />
                  <span className="flex-1 text-left">Data Master</span>
                  <ChevronDown
                    className={`size-4 shrink-0 transition-transform ${
                      expandedItems.includes("data-master") || pathname?.startsWith("/master-data") ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Data Master Submenu */}
                {(expandedItems.includes("data-master") || pathname?.startsWith("/master-data")) && (
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>
                      <Link
                        href="/master-data/division"
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/master-data/division" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <Layers className="size-4" />
                        <span className="flex-1 text-left">Division</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/master-data/departments"
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/master-data/departments" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <Building2 className="size-4" />
                        <span className="flex-1 text-left">Departments</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/master-data/users"
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/master-data/users" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <Users className="size-4" />
                        <span className="flex-1 text-left">Users</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <Link
                  href="/reports"
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                    pathname === "/reports" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] transition-colors hover:bg-[#F8F9FA]"
                  }`}
                >
                  <FileText className="size-5" />
                  <span className="flex-1 text-left">Reports</span>
                </Link>
              </li>

              <li>
                <button
                  onClick={() => toggleExpand("document-control")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-[#F8F9FA] ${
                    pathname?.startsWith("/document-control") ? "bg-[#f1f4ff] text-[#00b3d8]" : "text-[#425166]"
                  }`}
                >
                  <FolderOpen className="size-5 shrink-0" />
                  <span className="flex-1 text-left">Document Control</span>
                  <ChevronDown
                    className={`size-4 shrink-0 transition-transform ${
                      expandedItems.includes("document-control") || pathname?.startsWith("/document-control") ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Document Control Submenu */}
                {(expandedItems.includes("document-control") || pathname?.startsWith("/document-control")) && (
                  <ul className="mt-1 ml-4 space-y-1">
                    <li>
                      <Link
                        href="/document-control/submission"
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/document-control/submission" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <FilePlus className="size-4" />
                        <span className="flex-1 text-left">Document Submission</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/document-control/draft"
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/document-control/draft" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <FileEdit className="size-4" />
                        <span className="flex-1 text-left">Draft Document</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/document-control/request"
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/document-control/request" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <FileQuestion className="size-4" />
                        <span className="flex-1 text-left">Request Document</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/document-control/validation"
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/document-control/validation" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <FileCheck2 className="size-4" />
                        <span className="flex-1 text-left">Document Validation</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/document-control/management"
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/document-control/management" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <FolderCog className="size-4" />
                        <span className="flex-1 text-left">Document Management</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/document-control/distributed"
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/document-control/distributed" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <Share2 className="size-4" />
                        <span className="flex-1 text-left">Distributed Document</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/document-control/obsolete"
                        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                          pathname === "/document-control/obsolete" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] hover:bg-[#F8F9FA]"
                        }`}
                      >
                        <FileX className="size-4" />
                        <span className="flex-1 text-left">Obsolete Document</span>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <Link
                  href="/settings"
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${
                    pathname === "/settings" ? "bg-[#E9F5FE] text-[#4DB1D4]" : "text-[#425166] transition-colors hover:bg-[#F8F9FA]"
                  }`}
                >
                  <Settings className="size-5" />
                  <span className="flex-1 text-left">Settings</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-[#e9f5fe]">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#4DB1D4] text-white transition-colors hover:bg-[#3da0bf]"
            >
              <LogOut className="size-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}