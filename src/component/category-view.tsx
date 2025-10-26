"use client";

import formatText from "@/utils/common_functions";
import { Folder, FileText } from "lucide-react";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Breadcrumb } from "./breadcumb";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/utils/axios";

interface Category {
  id: string;
  kind: { major: string; minor: string };
  name: string;
  created: string;
  terminated: string;
  nameExact?: string | null;
}

interface Dataset {
  id: string;
  kind: { major: string; minor: string };
  name: string;
  created: string;
  terminated: string;
  nameExact?: string;
  parentId?: string;
  source?: string;
}

interface YearBasedData {
  categories: Category[];
  datasets: Record<string, Dataset[]>;
}

interface BreadcrumbItem {
  label: string;
  path: string;
}

export default function CategoryView() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [data, setData] = useState<YearBasedData>({
    categories: [],
    datasets: {},
  });

  const [categoriesByParentId, setCategoriesByParentId] = useState<
    Map<string, Category[]>
  >(new Map());

  const [datasetsByParentId, setDatasetsByParentId] = useState<
    Map<string, Dataset[]>
  >(new Map());

  const [breadcrumbTrail, setBreadcrumbTrail] = useState<BreadcrumbItem[]>([
    // { label: "Datasets", path: "/datasets" },
  ]);

  const [loadingCategoryId, setLoadingCategoryId] = useState<string | null>(
    null
  );
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const fetchCategoriesAndDatasets = async (parentId: string = "") => {
    try {
      const url = parentId === "" ? `/categories` : `/categories?id=${parentId}`;
      const response = await api.get<YearBasedData>(url, {
        headers: { "Content-Type": "application/json" },
      });

      const { categories, datasets } = response.data;

      setCategoriesByParentId((prev) => {
        const newMap = new Map(prev);
        newMap.set(parentId, categories);
        return newMap;
      });

      if (datasets && Object.keys(datasets).length > 0) {
        const allDatasets = Object.values(datasets).flat();
        setDatasetsByParentId((prev) => {
          const newMap = new Map(prev);
          newMap.set(parentId, allDatasets);
          return newMap;
        });
      }

      return { categories, datasets };
    } catch (e) {
      console.error("❌ Failed to fetch categories:", e);
      return { categories: [], datasets: {} };
    }
  };

  useEffect(() => {
    const parentId = searchParams.get("parentId") || "";
    const breadcrumbParam = searchParams.get("breadcrumb");

    if (breadcrumbParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(breadcrumbParam));
        if (Array.isArray(decoded)) setBreadcrumbTrail(decoded);
      } catch {
        console.warn("Invalid breadcrumb in URL");
      }
    }

    const loadInitialData = async () => {
      setInitialLoading(true);

      const cachedCategories = categoriesByParentId.get(parentId);
      const cachedDatasets = datasetsByParentId.get(parentId);

      if (cachedCategories) {
        setData({
          categories: cachedCategories,
          datasets: cachedDatasets ? { cached: cachedDatasets } : {},
        });
      } else {
        const { categories, datasets } =
          await fetchCategoriesAndDatasets(parentId);
        setData({ categories, datasets });
      }

      setInitialLoading(false);
    };

    loadInitialData();
  }, [searchParams]);

  const handleCategoryClick = async (categoryId: string, categoryName: string) => {
    try {
      setLoadingCategoryId(categoryId);

      const newBreadcrumb = [
        ...breadcrumbTrail,
        {
          label: formatText({ name: categoryName }) || "Category",
          path: `/datasets?parentId=${categoryId}`,
        },
      ];

      const encodedTrail = encodeURIComponent(JSON.stringify(newBreadcrumb));

      router.push(`/datasets?parentId=${categoryId}&breadcrumb=${encodedTrail}`);
      setBreadcrumbTrail(newBreadcrumb);

      const cachedCategories = categoriesByParentId.get(categoryId);
      const cachedDatasets = datasetsByParentId.get(categoryId);

      if (cachedCategories) {
        setData({
          categories: cachedCategories,
          datasets: cachedDatasets ? { cached: cachedDatasets } : {},
        });
      } else {
        const { categories, datasets } = await fetchCategoriesAndDatasets(
          categoryId
        );
        setData({ categories, datasets });
      }
    } catch (error) {
      console.error("❌ Failed to load subcategories:", error);
    } finally {
      setLoadingCategoryId(null);
    }
  };

  const handleDatasetClick = (dataset: Dataset) => {
    const parentId = searchParams.get("parentId") || "";
    const datasetName = dataset.nameExact || formatText({ name: dataset.name });

    const newBreadcrumb = [
      ...breadcrumbTrail,
      {
        label: datasetName,
        path: `/datasets?datasetId=${dataset.id}&datasetName=${datasetName}&parentId=${parentId}`,
      },
    ];

    const encodedTrail = encodeURIComponent(JSON.stringify(newBreadcrumb));

    setBreadcrumbTrail(newBreadcrumb);
    router.push(
      `/datasets?datasetId=${dataset.id}&datasetName=${datasetName}&parentId=${parentId}&breadcrumb=${encodedTrail}`
    );
  };

const handleBreadcrumbClick = async (index: number, item: BreadcrumbItem) => {
  try {
    const newTrail = breadcrumbTrail.slice(0, index + 1);

    const encodedTrail = encodeURIComponent(JSON.stringify(newTrail));

    setBreadcrumbTrail(newTrail);

    const url = new URL(item.path, window.location.origin);
    const parentId = url.searchParams.get("parentId") || "";
    const datasetId = url.searchParams.get("datasetId");

    const newUrl =
      datasetId && parentId
        ? `/datasets?datasetId=${datasetId}&parentId=${parentId}&breadcrumb=${encodedTrail}`
        : parentId
        ? `/datasets?parentId=${parentId}&breadcrumb=${encodedTrail}`
        : `/datasets?breadcrumb=${encodedTrail}`;

    router.push(newUrl);

    const cachedCategories = categoriesByParentId.get(parentId);
    const cachedDatasets = datasetsByParentId.get(parentId);

    if (cachedCategories) {
      setData({
        categories: cachedCategories,
        datasets: cachedDatasets ? { cached: cachedDatasets } : {},
      });
    } else {
      const { categories, datasets } = await fetchCategoriesAndDatasets(parentId);
      setData({ categories, datasets });
    }
  } catch (err) {
    console.error("Failed to handle breadcrumb click:", err);
  }
};

  return (
    <div className="mt-5 md:mt-6 lg:mt-7">
      <div className="mb-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Explore Open Data
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Browse datasets by category to discover insights across various
          domains.
        </p>
      </div>

      <Breadcrumb
        items={breadcrumbTrail}
        onItemClick={handleBreadcrumbClick}
      />

      {initialLoading ? (
        <div className="text-gray-500 text-center py-10">Loading...</div>
      ) : (
        <>
          {data.categories.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">
                Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.categories.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCategoryClick(item.id, item.name)}
                    className={`cursor-pointer w-full h-[100px] border rounded-2xl p-4 flex items-center bg-category-card transition ${
                      loadingCategoryId === item.id
                        ? "opacity-50 pointer-events-none"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <Folder className="text-sidebar-primary" />
                    <p className="ml-3 text-start">
                      {formatText({ name: item.name })}
                    </p>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {Object.keys(data.datasets).length > 0 ? (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Datasets
              </h3>
              {Object.entries(data.datasets).map(([year, datasets]) => (
                <div key={year} className="mb-6">
                  <h4 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">
                    {year}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {datasets.map((ds) => (
                      <motion.div
                        key={ds.id}
                        whileHover={{ y: -2, scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDatasetClick(ds)}
                        className="cursor-pointer w-full h-[90px] border rounded-xl p-4 flex items-center bg-dataset-card hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                      >
                        <FileText className="text-blue-600 dark:text-blue-400" />
                        <div className="ml-3 text-left">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {ds.nameExact || formatText({ name: ds.name })}
                          </p>
                          {ds.source && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {ds.source}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            data.categories.length === 0 && (
              <p className="text-gray-500 text-center mt-10">
                No categories or datasets found for this level.
              </p>
            )
          )}
        </>
      )}
    </div>
  );
}
