"use client";
/* eslint-disable */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Database } from "lucide-react";
import axios from "axios";
import formatText from "@/utils/common_functions";
import { motion } from "framer-motion";
import { ClipLoader } from "react-spinners";
import Link from "next/link";
import api from "@/utils/axios";

export function Sidebar({ onSelectDataset }: SidebarProps) {
  const router = useRouter();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [categoriesByParentId, setCategoriesByParentId] = useState<
    Map<string, Category[]>
  >(new Map());
  const [datasetsByParentId, setDatasetsByParentId] = useState<
    Map<string, Dataset[]>
  >(new Map());
  const [loadingDatasetId, setLoadingDatasetId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingCategoryId, setLoadingCategoryId] = useState<string | null>(
    null
  );
  const [isRestoringFromUrl, setIsRestoringFromUrl] = useState(false);
 
  const fetchCategoriesAndDatasets = async (parentId: string = "") => {
    try {
      const url =
        parentId === "" ? `/categories` : `/categories?id=${parentId}`;

      const response = await api.get<YearBasedData>(url, {
        headers: { "Content-Type": "application/json" },
      });

      const { categories, datasets } = response.data;

      setCategoriesByParentId((prev) => {
        const newMap = new Map(prev);

        // const filteredCategories = categories.filter((cat) => {
        //   const date = cat.created;
        //   if (!date) return false;

        //   const year = date.split("-")[0];

        //   return year === "2022";
        // });

        newMap.set(parentId, categories);
        return newMap;
      });

      if (datasets && Object.keys(datasets).length !== 0) {
        const allDatasets = Object.values(datasets).flat();
        setDatasetsByParentId((prev) => {
          const newMap = new Map(prev);
          newMap.set(parentId, allDatasets);
          return newMap;
        });
      }

      return { categories, datasets };
    } catch (e) {
      console.error("Failed to fetch categories:", e);
      return { categories: [], datasets: {} };
    }
  };

  const updateUrl = (dataset: Dataset) => {
    const params = new URLSearchParams();
    params.set("datasetId", dataset.name);
    params.set("datasetName", dataset.nameExact || dataset.name);
    params.set("parentId", dataset.parentId || "");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleDatasetClick = async (dataset: Dataset) => {
    try {
      setLoadingDatasetId(dataset.id);
      updateUrl(dataset);
      onSelectDataset(dataset);
    } catch (e) {
      console.error("Failed to fetch dataset:", e);
    } finally {
      setLoadingDatasetId(null);
    }
  };

  const expandPathToDataset = async (
    datasetId: string,
    parentId: string = ""
  ): Promise<boolean> => {
    console.log(datasetId);
    // Fetch this level if not already fetched
    if (!categoriesByParentId.has(parentId)) {
      await fetchCategoriesAndDatasets(parentId);
    }

    const datasets = datasetsByParentId.get(parentId) || [];

    // Check if dataset is at this level
    if (datasets.some((ds) => ds.id === datasetId)) {
      return true;
    }

    // Check child categories
    const categories = categoriesByParentId.get(parentId) || [];
    for (const category of categories) {
      const found = await expandPathToDataset(datasetId, category.id);
      if (found) {
        setExpandedCategories((prev) => new Set([...prev, category.id]));
        return true;
      }
    }

    return false;
  };

  useEffect(() => {
    const restoreFromUrl = async () => {
      const searchParams = new URLSearchParams();
      const datasetId = searchParams.get("datasetId");
      const datasetParentId = searchParams.get("parentId");

      if (datasetId && datasetParentId) {
        setIsRestoringFromUrl(true);
        setInitialLoading(true);

        try {
          // First load root categories
          await fetchCategoriesAndDatasets();

          // // Expand path to the dataset
          await expandPathToDataset(datasetId);

          // // Create dataset object from URL params
          const dataset: Dataset = {
            // id: datasetId,
            name: datasetId,
            // nameExact: datasetName,
            parentId: datasetParentId,
            // year: year || undefined,
          };

          // // Select the dataset
          onSelectDataset(dataset);
        } catch (e) {
          console.error("Failed to restore from URL:", e);
        } finally {
          setInitialLoading(false);
          setIsRestoringFromUrl(false);
        }
      } else {
        setInitialLoading(true);
        await fetchCategoriesAndDatasets();
        setInitialLoading(false);
      }
    };

    restoreFromUrl();
  }, []);

  const toggleCategory = async (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);

    if (expandedCategories.has(categoryId)) {
      newExpanded.delete(categoryId);
      setExpandedCategories(newExpanded);
    } else {
      newExpanded.add(categoryId);
      setLoadingCategoryId(categoryId);

      if (!categoriesByParentId.has(categoryId)) {
        await fetchCategoriesAndDatasets(categoryId);
      }

      setExpandedCategories(newExpanded);
      setLoadingCategoryId(null);
    }
  };

  const renderCategories = (parentId: string = "", level: number = 0) => {
    const categories = categoriesByParentId.get(parentId) || [];
    const datasets = datasetsByParentId.get(parentId) || [];
    const searchParams = new URLSearchParams();

    const currentDatasetId = searchParams.get("datasetId");

    return (
      <div className="space-y-1">
        {categories.map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const isLoading = loadingCategoryId === category.id;

          return (
            <div key={category.id}>
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full hover:cursor-pointer flex items-center gap-2 text-start px-3 py-2 rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground`}
                style={{ paddingLeft: `${level * 1.25 + 1}rem` }}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isExpanded ? "rotate-0" : "-rotate-90"
                  }`}
                />
                <span className="text-sm font-medium">
                  {formatText(
                    { name: category.name },
                    { removeYear: level === 1 }
                  )}
                </span>

                {isLoading && (
                  <div className="ml-2 w-3 h-3 border-2 border-t-transparent border-sidebar-foreground rounded-full animate-spin" />
                )}
              </button>

              {isExpanded && (
                <div>{renderCategories(category.id, level + 1)}</div>
              )}
            </div>
          );
        })}

        {datasets.map((dataset) => {
          const isLoadingDataset = loadingDatasetId === dataset.id;
          const isSelected = currentDatasetId === dataset.id;

          return (
            
              <button
                key={dataset.id}
                onClick={() => handleDatasetClick(dataset)}
                className={`w-full text-left px-3 py-2 hover:cursor-pointer rounded-md text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground ${
                  isLoadingDataset ? "opacity-50 pointer-events-none" : ""
                } ${isSelected ? "bg-sidebar-accent font-medium" : ""}`}
                style={{ paddingLeft: `${(level + 1) * 1.25 + 1}rem` }}
              >
                {isLoadingDataset
                  ? "Loading..."
                  : dataset.nameExact || dataset.name}
              </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-2/9 bg-sidebar border-r border-sidebar-border overflow-y-auto h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex-shrink-0">
        <h2 className="text-lg font-bold text-sidebar-foreground">
          <Link href="/" className="flex items-center gap-2">
            <Database className="w-6 h-6 flex-shrink-0" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent text-2xl">
              XploreData
            </span>
          </Link>
        </h2>
      </div>

      {/* Body */}
      {initialLoading ? (
        <div className="w-full flex justify-center mt-10">
          <ClipLoader size={25} color="text-border" />
        </div>
      ) : (
        <div className="p-2 flex-1 overflow-y-auto">{renderCategories()}</div>
      )}
    </div>
  );
}
