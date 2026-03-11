import productsData from "@/data/products.json";

export interface ProductSpecs {
  maxCapacityTB: number;
  maxIOPS: number;
  maxThroughputGBs: number;
  protocols: string[];
  maxNodes: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  specs: ProductSpecs;
  useCases: string[];
  pricingTier: string;
}

export type ProductCategory =
  | "All-Flash"
  | "Hybrid"
  | "Object Storage"
  | "Cloud";

const products: Product[] = productsData as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.useCases.some((uc) => uc.toLowerCase().includes(lowerQuery)) ||
      p.specs.protocols.some((pr) => pr.toLowerCase().includes(lowerQuery))
  );
}

export function getRecommendations(workload: string): Product[] {
  const lowerWorkload = workload.toLowerCase();

  const workloadMap: Record<string, string[]> = {
    vdi: ["aff-a150", "aff-a250", "aff-a400"],
    database: ["aff-a400", "aff-a800", "aff-a900"],
    oracle: ["aff-a800", "aff-a900", "afx"],
    "sap hana": ["aff-a800", "aff-a900"],
    "ai/ml": ["aff-a800", "aff-a900", "afx"],
    "ai": ["aff-a900", "afx"],
    analytics: ["aff-a400", "aff-c800", "afx"],
    backup: ["fas-2820", "fas-8300", "aff-c250"],
    "file services": ["fas-2820", "fas-8300", "aff-a250"],
    cloud: ["cvo", "anf", "fsx-ontap"],
    "object storage": ["storagegrid"],
    archive: ["storagegrid", "aff-c800"],
    hpc: ["afx", "aff-a900"],
    consolidation: ["aff-a900", "fas-9500", "afx"],
  };

  for (const [key, productIds] of Object.entries(workloadMap)) {
    if (lowerWorkload.includes(key)) {
      return productIds
        .map((id) => getProductById(id))
        .filter((p): p is Product => p !== undefined);
    }
  }

  return products.filter((p) =>
    p.useCases.some((uc) => uc.toLowerCase().includes(lowerWorkload))
  );
}
