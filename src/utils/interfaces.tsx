
interface Kind {
  major: string;
  minor: string;
}

interface Category {
  id: string;
  name: string;
  create: string;
  nameExact: string;
  kind: Kind;
  terminate: string;
}

interface Dataset {
  id: string;
  name: string;
  nameExact: string;
  created: string;
  terminated: string;
  parentId: string;
  source: string;
  kind: Kind;
}

// interface DatasetData {
//   attributeName: string;
//   columns: string[],
//   rows: any[]
// }

interface DatasetData {
  attributeName: string;
  columns: string[];
  rows: Record<string, unknown>[]; 
}

interface ExportButtonProps {
  columns: string[]
  rows: (string | number)[][]
  filename: string
}

interface DataTableProps {
  columns: string[];
  rows: (string | number)[][];
  title: string;
}
interface SidebarProps {
  onSelectDataset: (dataset: Dataset) => void;
}
interface NewSidebarProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
}

interface FetchedData {
  categories: Category[];
  datasets?: Record<string, Dataset[]>;
}

interface YearBasedData {
  categories: Category[];
  datasets: Record<string, Dataset[]>;
}

interface DatasetWithYear extends Dataset {
  year?: string;
}

interface DatasetViewProps {
  data: DatasetWithYear;
  availableYears?: string[];
  onYearChange?: (year: string) => void;
  onComparisonChange?: (year1: string, year2: string) => void;
}

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}


