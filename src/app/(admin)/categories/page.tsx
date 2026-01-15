import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";

export const metadata: Metadata = {
  title: "All Categories | E-commerce Admin Dashboard",
  description: "Manage product categories",
};

interface Category {
  id: number;
  name: string;
  image: string;
  description: string;
  productCount: number;
  status: "active" | "inactive";
}

const categories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    image: "/images/product/product-01.jpg",
    description: "Electronic devices and accessories",
    productCount: 150,
    status: "active",
  },
  {
    id: 2,
    name: "Clothing",
    image: "/images/product/product-02.jpg",
    description: "Men and women apparel",
    productCount: 320,
    status: "active",
  },
  {
    id: 3,
    name: "Home & Garden",
    image: "/images/product/product-03.jpg",
    description: "Home decor and gardening supplies",
    productCount: 85,
    status: "active",
  },
  {
    id: 4,
    name: "Sports",
    image: "/images/product/product-04.jpg",
    description: "Sports equipment and fitness gear",
    productCount: 0,
    status: "inactive",
  },
];

export default function AllCategories() {
  return (
    <div>
      <PageBreadcrumb pageTitle="All Categories" />
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Categories
            </h3>
            <Link
              href="/categories/add"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Category
            </Link>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-200 dark:border-gray-800">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Category
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Description
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Products
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-6 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg">
                          <Image
                            src={category.image}
                            alt={category.name}
                            width={48}
                            height={48}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-gray-800 dark:text-white/90">
                          {category.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {category.description}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                      {category.productCount}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <Badge
                        variant="light"
                        color={category.status === "active" ? "success" : "error"}
                      >
                        {category.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
