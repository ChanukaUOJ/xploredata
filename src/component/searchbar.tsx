import { SearchIcon } from "lucide-react";
import React, { useState } from "react";

export default function Searchbar() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search datasets or categories…"
            className="w-full pl-12 pr-4 py-3 rounded-full border border-border bg-input-background text-primary  placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>
      </form>
    </div>
  );
}
