"use client";

import SizingForm from "@/components/SizingForm";
import { motion } from "framer-motion";

export default function AFXSizerPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-netapp-dark">AFX Sizer</h1>
        <p className="text-netapp-muted mt-1">
          Configure and size a NetApp AFX solution based on workload requirements
        </p>
      </div>

      <SizingForm />
    </motion.div>
  );
}
