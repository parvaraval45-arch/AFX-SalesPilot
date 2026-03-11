"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Calculator,
  FileText,
  Swords,
  Package,
  TrendingUp,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";

const metrics = [
  {
    label: "Active Deals",
    value: "24",
    trend: "+3 this week",
    icon: Briefcase,
    color: "text-netapp-blue",
    bg: "bg-blue-50",
  },
  {
    label: "Sizing Requests",
    value: "156",
    trend: "+12 this month",
    icon: Calculator,
    color: "text-netapp-accent",
    bg: "bg-sky-50",
  },
  {
    label: "Proposals Generated",
    value: "89",
    trend: "+8 this month",
    icon: FileText,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Win Rate",
    value: "73%",
    trend: "+5% vs last quarter",
    icon: BarChart3,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

const quickActions = [
  {
    label: "Product Selector",
    description: "Find the right NetApp product for your customer",
    href: "/product-selector",
    icon: Package,
    color: "bg-netapp-blue",
  },
  {
    label: "AFX Sizer",
    description: "Size a NetApp AFX configuration",
    href: "/afx-sizer",
    icon: Calculator,
    color: "bg-netapp-accent",
  },
  {
    label: "Competitive Intel",
    description: "Battle cards and competitive positioning",
    href: "/competitive-intel",
    icon: Swords,
    color: "bg-emerald-600",
  },
  {
    label: "Proposal Generator",
    description: "Generate customer-facing proposals",
    href: "/proposal-generator",
    icon: FileText,
    color: "bg-purple-600",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Welcome Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-netapp-dark">
          Welcome to AFX SalesPilot
        </h1>
        <p className="text-netapp-muted mt-1">
          Your AI-powered sales engineering assistant for NetApp solutions
        </p>
      </motion.div>

      {/* Metric Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card
            key={metric.label}
            className="border-netapp-border bg-white hover:shadow-md transition-all duration-150 ease-in-out"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-netapp-muted">{metric.label}</p>
                  <p className="text-3xl font-bold text-netapp-dark mt-1">
                    {metric.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg ${metric.bg}`}>
                  <metric.icon size={22} className={metric.color} />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="text-xs text-emerald-600">{metric.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-netapp-dark mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="border-netapp-border bg-white hover:shadow-md transition-all duration-150 ease-in-out group cursor-pointer h-full">
                <CardContent className="p-6">
                  <div
                    className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-4`}
                  >
                    <action.icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-netapp-dark">
                    {action.label}
                  </h3>
                  <p className="text-sm text-netapp-muted mt-1">
                    {action.description}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-netapp-blue text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-150">
                    Open <ArrowRight size={14} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
