"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  createAdminProductAction,
  updateAdminProductAction,
  deleteAdminProductAction,
} from "@/server/actions/admin";
import { VehicleType, ProductStatus } from "@prisma/client";

interface ProductItem {
  id: string;
  slug: string;
  sku: string;
  price: number;
  salePrice: number | null;
  vehicleType: VehicleType;
  ageGroup: string | null;
  engineCapacity: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  categoryName: string;
  categoryId: string;
  stock: number;
  threshold: number;
  imageUrl: string | null;
  titleFr: string;
  titleEn: string;
  titleEs: string;
  titleAr: string;
  translations: any[];
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

export function ProductManagementView({
  initialProducts,
  categories,
}: {
  initialProducts: ProductItem[];
  categories: CategoryOption[];
}) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Create Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"FR" | "EN" | "ES" | "AR" | "SPECS">("FR");

  // Form states
  const [formSku, setFormSku] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState(categories[0]?.id || "");
  const [formVehicleType, setFormVehicleType] = useState<VehicleType>(VehicleType.MOTORCYCLE_ADULT);
  const [formPrice, setFormPrice] = useState("");
  const [formSalePrice, setFormSalePrice] = useState("");
  const [formStock, setFormStock] = useState("5");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formEngineCapacity, setFormEngineCapacity] = useState("");
  const [formAgeGroup, setFormAgeGroup] = useState("");

  // Multilingual fields
  const [titleFr, setTitleFr] = useState("");
  const [descFr, setDescFr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [descEn, setDescEn] = useState("");
  const [titleEs, setTitleEs] = useState("");
  const [descEs, setDescEs] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descAr, setDescAr] = useState("");

  // Specs
  const [specPower, setSpecPower] = useState("");
  const [specTransmission, setSpecTransmission] = useState("");
  const [specSeatHeight, setSpecSeatHeight] = useState("");
  const [specWeight, setSpecWeight] = useState("");

  const [formError, setFormError] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.titleFr.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "ALL" || p.vehicleType === filterType;
    return matchesSearch && matchesType;
  });

  const handleToggleStatus = (product: ProductItem) => {
    const newStatus =
      product.status === ProductStatus.PUBLISHED
        ? ProductStatus.DRAFT
        : ProductStatus.PUBLISHED;

    startTransition(async () => {
      const res = await updateAdminProductAction(product.id, { status: newStatus });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
        );
      }
    });
  };

  const handleDelete = (productId: string) => {
    if (!confirm("Are you sure you want to delete this machine? This action is irreversible.")) return;

    startTransition(async () => {
      const res = await deleteAdminProductAction(productId);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    });
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSku.trim() || !formSlug.trim() || !titleFr.trim() || !formPrice.trim()) {
      setFormError("Please fill in required fields: SKU, Slug, French Title, and Price.");
      return;
    }

    setFormError(null);
    startTransition(async () => {
      const res = await createAdminProductAction({
        sku: formSku,
        slug: formSlug,
        price: parseFloat(formPrice),
        salePrice: formSalePrice ? parseFloat(formSalePrice) : null,
        categoryId: formCategory,
        vehicleType: formVehicleType,
        initialStock: parseInt(formStock, 10) || 0,
        imageUrl: formImageUrl || null,
        engineCapacity: formEngineCapacity || null,
        ageGroup: formAgeGroup || null,
        translations: [
          {
            locale: "fr",
            title: titleFr,
            description: descFr || titleFr,
            specifications: {
              power: specPower,
              transmission: specTransmission,
              seatHeight: specSeatHeight,
              weight: specWeight,
            },
          },
          {
            locale: "en",
            title: titleEn || titleFr,
            description: descEn || descFr || titleFr,
          },
          {
            locale: "es",
            title: titleEs || titleFr,
            description: descEs || descFr || titleFr,
          },
          {
            locale: "ar",
            title: titleAr || titleFr,
            description: descAr || descFr || titleFr,
          },
        ],
      });

      if (res.success) {
        setIsModalOpen(false);
        // Reload page or reset form
        window.location.reload();
      } else {
        setFormError(res.errorMessage || "Failed to create vehicle.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <h1 className="font-heading text-2xl font-black uppercase text-white tracking-wide">
            Showroom Catalog Management
          </h1>
          <p className="text-xs text-neutral-400">
            Publish vehicles, edit multilingual specification sheets, and configure pricing.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded bg-[#E10600] hover:bg-[#B80500] text-white font-heading font-black text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-md shadow-red-700/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by title, SKU, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded bg-[#141414] border border-[#262626] text-xs text-white focus:outline-none focus:border-[#E10600]"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded bg-[#141414] border border-[#262626] text-xs text-white focus:outline-none focus:border-[#E10600]"
        >
          <option value="ALL">All Categories / Types</option>
          <option value="MOTORCYCLE_ADULT">Adult Competition</option>
          <option value="MOTORCYCLE_KIDS">Kids&apos; Trainers</option>
          <option value="QUAD">All-Terrain Quads</option>
          <option value="EQUIPMENT">Riding Gear</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="border border-[#222222] rounded bg-[#141414] overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#1C1C1C] border-b border-[#262626] text-[11px] font-heading font-black uppercase text-neutral-400 tracking-wider">
            <tr>
              <th className="p-3.5">Machine / Model</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5 text-center">Stock</th>
              <th className="p-3.5 text-right">Price (TTC)</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-neutral-500">
                  No vehicles found matching search criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#1A1A1A] transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded bg-[#0B0B0B] border border-[#262626] overflow-hidden shrink-0">
                        {prod.imageUrl ? (
                          <Image
                            src={prod.imageUrl}
                            alt={prod.titleFr}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-neutral-600">
                            PM
                          </div>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] font-bold text-[#E10600]">
                          {prod.sku}
                        </span>
                        <h4 className="font-heading font-black text-xs text-white uppercase block">
                          {prod.titleFr}
                        </h4>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          /{prod.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-3.5 text-neutral-300">
                    <span className="px-2 py-0.5 rounded bg-[#1C1C1C] text-[10px] font-mono border border-[#262626]">
                      {prod.categoryName}
                    </span>
                  </td>

                  <td className="p-3.5 text-center">
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        prod.stock <= prod.threshold
                          ? "bg-red-500/20 text-red-400 border border-red-500/30"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}
                    >
                      {prod.stock} units
                    </span>
                  </td>

                  <td className="p-3.5 text-right font-heading text-xs font-black text-white">
                    {prod.salePrice ? (
                      <div>
                        <span className="text-[#E10600]">
                          {prod.salePrice.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </span>
                        <span className="text-[10px] text-neutral-500 line-through ml-1.5">
                          {prod.price.toLocaleString("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </span>
                      </div>
                    ) : (
                      prod.price.toLocaleString("fr-FR", {
                        style: "currency",
                        currency: "EUR",
                      })
                    )}
                  </td>

                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleToggleStatus(prod)}
                      disabled={isPending}
                      className={`px-2.5 py-1 rounded text-[10px] font-heading font-black uppercase tracking-wider cursor-pointer transition-colors ${
                        prod.status === ProductStatus.PUBLISHED
                          ? "bg-[#16803C]/20 text-[#16803C] border border-[#16803C]/40 hover:bg-[#16803C]/30"
                          : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"
                      }`}
                    >
                      ● {prod.status}
                    </button>
                  </td>

                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => handleDelete(prod.id)}
                      disabled={isPending}
                      className="p-1.5 rounded hover:bg-red-500/10 text-neutral-500 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#141414] border border-[#2E2E2E] rounded-lg shadow-2xl p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#E10600]" />
                <h3 className="font-heading text-lg font-black uppercase text-white">
                  Add Showroom Machine
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-5">
              {/* Core Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KTM-250-SXF"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono uppercase focus:outline-none focus:border-[#E10600]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ktm-250-sxf-2026"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono lowercase focus:outline-none focus:border-[#E10600]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-8 px-2 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                    Price (€) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="8990"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono focus:outline-none focus:border-[#E10600]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                    Promotional Sale Price (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="8490 (Optional)"
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(e.target.value)}
                    className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono focus:outline-none focus:border-[#E10600]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono focus:outline-none focus:border-[#E10600]"
                  />
                </div>
              </div>

              {/* Vehicle specs row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                    Displacement / Capacity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 250cc / Electric"
                    value={formEngineCapacity}
                    onChange={(e) => setFormEngineCapacity(e.target.value)}
                    className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                    Age Group
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Adult / 10-15 Years"
                    value={formAgeGroup}
                    onChange={(e) => setFormAgeGroup(e.target.value)}
                    className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="/images/products/... or CDN URL"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                  />
                </div>
              </div>

              {/* Multilingual Tabs */}
              <div className="space-y-3 pt-2 border-t border-[#262626]">
                <div className="flex gap-2 border-b border-[#262626] pb-2 text-xs font-heading font-black uppercase">
                  {(["FR", "EN", "ES", "AR", "SPECS"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                        activeTab === tab
                          ? "bg-[#E10600] text-white"
                          : "text-neutral-400 hover:text-white bg-[#1C1C1C]"
                      }`}
                    >
                      {tab === "FR"
                        ? "Français (Primary)"
                        : tab === "EN"
                        ? "English"
                        : tab === "ES"
                        ? "Español"
                        : tab === "AR"
                        ? "العربية"
                        : "Technical Specs"}
                    </button>
                  ))}
                </div>

                {/* French */}
                {activeTab === "FR" && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        Titre (FR) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. KTM 250 SX-F Edition Spéciale"
                        value={titleFr}
                        onChange={(e) => setTitleFr(e.target.value)}
                        className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        Description Complète (FR)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Présentation technique du véhicule..."
                        value={descFr}
                        onChange={(e) => setDescFr(e.target.value)}
                        className="w-full p-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                  </div>
                )}

                {/* English */}
                {activeTab === "EN" && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        Title (EN)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. KTM 250 SX-F Special Edition"
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                        className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        Description (EN)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Technical machine description in English..."
                        value={descEn}
                        onChange={(e) => setDescEn(e.target.value)}
                        className="w-full p-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                  </div>
                )}

                {/* Spanish */}
                {activeTab === "ES" && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        Título (ES)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. KTM 250 SX-F Edición Especial"
                        value={titleEs}
                        onChange={(e) => setTitleEs(e.target.value)}
                        className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        Descripción (ES)
                      </label>
                      <textarea
                        rows={3}
                        value={descEs}
                        onChange={(e) => setDescEs(e.target.value)}
                        className="w-full p-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                  </div>
                )}

                {/* Arabic */}
                {activeTab === "AR" && (
                  <div className="space-y-3 text-xs" dir="rtl">
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        العنوان (باللغة العربية)
                      </label>
                      <input
                        type="text"
                        placeholder="درّاجة نارية للمنافسات..."
                        value={titleAr}
                        onChange={(e) => setTitleAr(e.target.value)}
                        className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        الوصف
                      </label>
                      <textarea
                        rows={3}
                        value={descAr}
                        onChange={(e) => setDescAr(e.target.value)}
                        className="w-full p-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                  </div>
                )}

                {/* Tech Specs */}
                {activeTab === "SPECS" && (
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        Max Power / Horsepower
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 47 HP @ 14,000 RPM"
                        value={specPower}
                        onChange={(e) => setSpecPower(e.target.value)}
                        className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        Transmission
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 5-Speed Claw Shifted"
                        value={specTransmission}
                        onChange={(e) => setSpecTransmission(e.target.value)}
                        className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        Seat Height
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 958 mm"
                        value={specSeatHeight}
                        onChange={(e) => setSpecSeatHeight(e.target.value)}
                        className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-heading font-black uppercase text-neutral-400 mb-1">
                        Dry Weight
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 101.2 kg"
                        value={specWeight}
                        onChange={(e) => setSpecWeight(e.target.value)}
                        className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#262626] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border border-[#2E2E2E] hover:bg-[#1C1C1C] text-neutral-300 text-xs font-heading font-black uppercase tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 rounded bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-heading font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Creating Vehicle..." : "Save & Publish Vehicle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
