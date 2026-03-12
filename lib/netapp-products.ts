import productsData from "@/data/products.json";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  protocols: string[];
  max_nodes?: number;
  max_throughput_gbs?: number;
  max_capacity_pb?: number;
  latency?: string;
  best_for: string[];
  not_for: string[];
  differentiator: string;
  models?: string[];
  requires?: string;
  components?: {
    controller: string;
    enclosure: string;
    compute_node: string;
  };
}

const products: Product[] = productsData as Product[];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.tagline.toLowerCase().includes(lowerQuery) ||
      p.best_for.some((bf) => bf.toLowerCase().includes(lowerQuery)) ||
      p.protocols.some((pr) => pr.toLowerCase().includes(lowerQuery))
  );
}
