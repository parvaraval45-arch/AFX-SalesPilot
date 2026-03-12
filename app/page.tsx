"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calculator,
  Package,
  Swords,
  FileText,
  HardDrive,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  Clock,
  Cpu,
} from "lucide-react";
import { motion } from "framer-motion";

const activityFeed = [
  {
    type: "Sizing",
    icon: Calculator,
    summary: "AFX cluster sized: 8x AFX 1K, 24x NX224 (30TB) for AI training workload",
    timestamp: "12 min ago",
    href: "/afx-sizer",
    color: "bg-netapp-accent text-white",
  },
  {
    type: "Product Match",
    icon: Package,
    summary: "Recommended AFF A-Series for VMware vSphere modernization at Acme Corp",
    timestamp: "1 hour ago",
    href: "/product-selector",
    color: "bg-netapp-blue text-white",
  },
  {
    type: "Battlecard",
    icon: Swords,
    summary: "Generated competitive battlecard: AFX vs Pure Storage FlashBlade S",
    timestamp: "3 hours ago",
    href: "/competitive-intel",
    color: "bg-emerald-600 text-white",
  },
  {
    type: "Sizing",
    icon: Calculator,
    summary: "AFX config with 4x DX50 nodes for AIDE vectorization workload",
    timestamp: "Yesterday",
    href: "/afx-sizer",
    color: "bg-netapp-accent text-white",
  },
  {
    type: "Proposal",
    icon: FileText,
    summary: "Proposal generated for Global Finance Inc — NetApp AFX + Keystone STaaS",
    timestamp: "Yesterday",
    href: "/proposal-generator",
    color: "bg-purple-600 text-white",
  },
];

const stats = [
  { label: "Products in Portfolio", value: "20+", icon: HardDrive, color: "text-netapp-blue", bg: "bg-blue-50" },
  { label: "AFX Configs Sized", value: "47", icon: Calculator, color: "text-netapp-accent", bg: "bg-sky-50" },
  { label: "Battlecards Available", value: "6", icon: Swords, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "Proposals Generated", value: "12", icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
];

const checklist = [
  { label: "ONTAP version check", detail: "Requires ONTAP 9.17.1+ for AFX", done: true },
  { label: "Protocol requirements", detail: "NAS (NFS/pNFS/SMB) and S3 only — no SAN/block", done: true },
  { label: "Cluster size planning", detail: "Up to 128 controllers, 52 enclosures, 10 DX50 nodes", done: true },
  { label: "AIDE feature requirements", detail: "Metadata Engine, Data Guardrails, Data Curator, Data Sync", done: true },
  { label: "Keystone vs CapEx decision", detail: "Evaluate deployment model before sizing", done: true },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [checklistOpen, setChecklistOpen] = useState(false);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column (65%) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Hero Card */}
          <motion.div variants={item}>
            <Card className="bg-netapp-dark border-0 overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu size={20} className="text-netapp-accent" />
                  <span className="text-xs text-netapp-accent font-medium uppercase tracking-wider">
                    NetApp Field Sales Tool
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  AFX SalesPilot
                </h1>
                <p className="text-gray-400 text-sm mb-6 max-w-lg">
                  AI-powered pre-sales intelligence for NetApp field teams.
                  Size AFX clusters, match workloads to products, and generate
                  competitive battlecards — all in one place.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/afx-sizer">
                    <Button className="bg-netapp-blue hover:bg-netapp-blue/90 text-white">
                      <Calculator size={16} className="mr-2" />
                      Start Sizing
                    </Button>
                  </Link>
                  <Link href="/product-selector">
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white">
                      <Package size={16} className="mr-2" />
                      Match a Workload
                    </Button>
                  </Link>
                  <Link href="/competitive-intel">
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white">
                      <Swords size={16} className="mr-2" />
                      Build Battlecard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Feed */}
          <motion.div variants={item}>
            <h2 className="text-sm font-semibold text-netapp-dark uppercase tracking-wide mb-3">
              Recent Activity
            </h2>
            <div className="space-y-2">
              {activityFeed.map((activity, i) => (
                <Card key={i} className="border-netapp-border hover:shadow-sm transition-all duration-150">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                      <activity.icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-medium text-netapp-muted uppercase tracking-wide">
                          {activity.type}
                        </span>
                        <span className="text-[10px] text-netapp-muted flex items-center gap-1">
                          <Clock size={9} />
                          {activity.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-netapp-dark truncate">
                        {activity.summary}
                      </p>
                    </div>
                    <Link href={activity.href}>
                      <Button variant="ghost" size="sm" className="text-netapp-blue text-xs h-7 px-2">
                        View
                        <ArrowRight size={12} className="ml-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column (35%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <motion.div variants={item}>
            <h2 className="text-sm font-semibold text-netapp-dark uppercase tracking-wide mb-3">
              Quick Stats
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-netapp-border">
                  <CardContent className="p-4">
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                      <stat.icon size={16} className={stat.color} />
                    </div>
                    <p className="text-2xl font-bold text-netapp-dark">{stat.value}</p>
                    <p className="text-[11px] text-netapp-muted">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* AFX Readiness Checklist */}
          <motion.div variants={item}>
            <Card className="border-netapp-border">
              <CardHeader className="pb-0">
                <button
                  onClick={() => setChecklistOpen(!checklistOpen)}
                  className="flex items-center justify-between w-full"
                >
                  <CardTitle className="text-sm font-semibold text-netapp-dark">
                    AFX Readiness Checklist
                  </CardTitle>
                  {checklistOpen ? (
                    <ChevronUp size={16} className="text-netapp-muted" />
                  ) : (
                    <ChevronDown size={16} className="text-netapp-muted" />
                  )}
                </button>
              </CardHeader>
              {checklistOpen && (
                <CardContent className="pt-3">
                  <div className="space-y-2">
                    {checklist.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 rounded-lg bg-green-50/50"
                      >
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={12} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-netapp-dark">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-netapp-muted">
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
