import React from "react";
import { NavLink } from "react-router-dom";
import {
  MessageCircle,
  FileText,
  Settings,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "../components/ui/sidebar";

const menuItems = [
  {
    title: "Chat",
    url: "/",
    icon: MessageCircle,
    description: "Chat with text, images, or audio",
  },
  {
    title: "Documents",
    url: "/documents",
    icon: FileText,
    description: "Upload and manage knowledge",
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
    description: "Configure the assistant",
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "transition-all duration-300 border-r border-sidebar-border",
        isCollapsed ? "w-16" : "w-72"
      )}
    >
      {/* HEADER */}
      <div
        className={cn(
          "p-5 border-b border-sidebar-border flex items-center gap-3",
          isCollapsed && "justify-center px-2"
        )}
      >
        <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
          <Bot className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>

        {!isCollapsed && (
          <div>
            <h2 className="font-semibold text-lg leading-tight">
              RAG AI
            </h2>
            <p className="text-xs opacity-70">
              Assistant
            </p>
          </div>
        )}
      </div>

      {/* NAVIGATION */}
      <SidebarContent className={cn("p-3", isCollapsed && "px-2")}>
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-2 py-2 text-xs uppercase tracking-wide opacity-60">
              Navigation
            </SidebarGroupLabel>
          )}

          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      title={item.title}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-4 rounded-xl px-4 py-3 transition-all",
                          "hover:bg-sidebar-accent",
                          isActive
                            ? "bg-sidebar-accent font-medium"
                            : "opacity-85",
                          isCollapsed && "justify-center px-3"
                        )
                      }
                    >
                      <>
                        <item.icon
                          className={cn(
                            isCollapsed ? "w-6 h-6" : "w-5 h-5"
                          )}
                        />

                        {!isCollapsed && (
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {item.title}
                            </span>
                            <span className="text-xs opacity-60">
                              {item.description}
                            </span>
                          </div>
                        )}
                      </>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* STATUS */}
        <div className={cn("mt-auto pt-4", isCollapsed && "pt-2")}>
          {!isCollapsed ? (
            <div className="rounded-xl bg-sidebar-accent px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  Connected
                </span>
              </div>
              <p className="text-xs opacity-70 mt-1">
                RAG system ready
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </SidebarContent>

      {/* COLLAPSE TOGGLE */}
      <div className="absolute -right-3 top-6 z-10">
        <SidebarTrigger className="w-7 h-7 rounded-md border bg-background">
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </SidebarTrigger>
      </div>
    </Sidebar>
  );
}
