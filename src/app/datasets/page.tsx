"use client";

import CategoryView from "@/component/category-view";
import Searchbar from "@/component/searchbar";
import { Sidebar } from "@/component/sidebar";
import Sidelogo from "@/component/sidelogo";
import ThemeToggle from "@/hooks/theme-toggle";
import { Database } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Footer } from "./Footer";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <div className="flex justify-between py-5 md:py-6 px-4 md:px-8 lg:px-36 border-b">
            <Sidelogo />
            <Searchbar/>
            <ThemeToggle isDark={isDark} onToggle={setIsDark} />
          </div>
          <div className="flex-1 overflow-auto px-4 md:px-8 lg:px-36">
            <CategoryView />
          </div>
          <Footer/>
        </div>
      </div>
    </div>
  );
}
