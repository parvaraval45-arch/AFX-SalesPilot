"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "@/components/ProductCard";
import ChatInterface from "@/components/ChatInterface";
import productsData from "@/data/products.json";
import type { Product, ProductCategory } from "@/lib/netapp-products";
import { Search } from "lucide-react";
import { motion } from "framer-motion";

const categories: Array<ProductCategory | "All"> = [
  "All",
  "All-Flash",
  "Hybrid",
  "Cloud",
  "Object Storage",
];

export default function ProductSelectorPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "All">("All");
  const products = productsData as Product[];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "All" || p.category === activeCategory;
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.useCases.some((uc) => uc.toLowerCase().includes(search.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, search]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-netapp-dark">Product Selector</h1>
        <p className="text-netapp-muted mt-1">
          Browse and compare NetApp storage products
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Product Grid */}
        <div className="xl:col-span-2 space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-netapp-muted"
              />
              <Input
                placeholder="Search products, use cases, protocols..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <Tabs
            value={activeCategory}
            onValueChange={(v) => setActiveCategory(v as ProductCategory | "All")}
          >
            <TabsList>
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat}>
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-netapp-muted">
              <p>No products match your search criteria.</p>
            </div>
          )}
        </div>

        {/* AI Chat Sidebar */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-sm font-semibold text-netapp-dark mb-3">
              AI Product Advisor
            </h3>
            <ChatInterface
              context="Help the user select the right NetApp product. You have access to the full NetApp product portfolio including AFF A-Series, C-Series, FAS, StorageGRID, Cloud Volumes ONTAP, Azure NetApp Files, FSx for ONTAP, and NetApp AFX."
              placeholder="Describe your customer's needs..."
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
