import { Database } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Sidelogo() {
  return (
    <h2 className="text-lg font-bold text-sidebar-foreground flex justify-start">
      <Link href="/" className="flex items-center gap-2">
        <Database className="w-5 lg:w-6 h-5 lg:h-6 flex-shrink-0" />
        <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-md lg:text-2xl">
          XploreData
        </span>
      </Link>
    </h2>
  );
}
