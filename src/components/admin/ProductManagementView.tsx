"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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
  Car,
  Bike,
  ShieldCheck,
  UploadCloud,
  Star,
  Image as ImageIcon,
  RefreshCw,
  Minus,
  CheckCircle2,
  Package,
  Boxes,
  Tag,
  DollarSign,
  Sliders,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Percent,
} from "lucide-react";
import {
  createAdminProductAction,
  updateAdminProductAction,
  deleteAdminProductAction,
  adjustInventoryStockAction,
} from "@/server/actions/admin";
import { VehicleType, ProductStatus } from "@prisma/client";

interface ProductImageItem {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

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
  images: ProductImageItem[];
  titleFr: string;
  descFr?: string;
  titleEn: string;
  descEn?: string;
  titleEs?: string;
  descEs?: string;
  titleAr?: string;
  descAr?: string;
  specifications?: any;
  translations: any[];
  createdAt: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface LocalUploadPreview {
  data: string; // Base64 Data URL
  mimeType: string;
  name: string;
  size: string;
  isPrimary: boolean;
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
  const [stockFilter, setStockFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formVehicleType, setFormVehicleType] = useState<VehicleType>(VehicleType.CAR);
  const [formCategory, setFormCategory] = useState(categories[0]?.id || "");
  const [formSku, setFormSku] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formSalePrice, setFormSalePrice] = useState("");
  const [formDiscountPercent, setFormDiscountPercent] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(5);
  const [formThreshold, setFormThreshold] = useState<number>(2);
  const [formEngineCapacity, setFormEngineCapacity] = useState("");
  const [formAgeGroup, setFormAgeGroup] = useState("");
  const [formPower, setFormPower] = useState("");
  const [formTransmission, setFormTransmission] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formSeatHeight, setFormSeatHeight] = useState("");
  const [formUploadedImages, setFormUploadedImages] = useState<LocalUploadPreview[]>([]);
  const [activeImageSlide, setActiveImageSlide] = useState<number>(0);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTitleEn, setEditTitleEn] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editSalePrice, setEditSalePrice] = useState("");
  const [editDiscountPercent, setEditDiscountPercent] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editThreshold, setEditThreshold] = useState<number>(2);
  const [editVehicleType, setEditVehicleType] = useState<VehicleType>(VehicleType.CAR);
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editEngineCapacity, setEditEngineCapacity] = useState("");
  const [editAgeGroup, setEditAgeGroup] = useState("");
  const [editStatus, setEditStatus] = useState<ProductStatus>(ProductStatus.PUBLISHED);
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [editSpecsPower, setEditSpecsPower] = useState("");
  const [editSpecsTransmission, setEditSpecsTransmission] = useState("");
  const [editSpecsWeight, setEditSpecsWeight] = useState("");
  const [editSpecsSeatHeight, setEditSpecsSeatHeight] = useState("");
  const [editExistingImages, setEditExistingImages] = useState<ProductImageItem[]>([]);
  const [editDeleteImageIds, setEditDeleteImageIds] = useState<string[]>([]);
  const [editPrimaryImageId, setEditPrimaryImageId] = useState<string>("");
  const [editNewUploadedImages, setEditNewUploadedImages] = useState<LocalUploadPreview[]>([]);
  const [editActiveImageSlide, setEditActiveImageSlide] = useState<number>(0);
  const [editError, setEditError] = useState<string | null>(null);

  // Quick Stock Adjustment Modal State
  const [quickStockItem, setQuickStockItem] = useState<ProductItem | null>(null);
  const [quickStockValue, setQuickStockValue] = useState<number>(0);
  const [quickStockReason, setQuickStockReason] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Sync Discount Percent -> Sale Price for Create
  const handleDiscountSliderChange = (pct: number) => {
    setFormDiscountPercent(pct);
    const regPrice = parseFloat(formPrice);
    if (!isNaN(regPrice) && regPrice > 0) {
      if (pct > 0) {
        const discounted = regPrice * (1 - pct / 100);
        setFormSalePrice(discounted.toFixed(2));
      } else {
        setFormSalePrice("");
      }
    }
  };

  // Sync Sale Price -> Discount Percent for Create
  const handleSalePriceInputChange = (val: string) => {
    setFormSalePrice(val);
    const regPrice = parseFloat(formPrice);
    const sPrice = parseFloat(val);
    if (!isNaN(regPrice) && !isNaN(sPrice) && regPrice > 0 && sPrice < regPrice && sPrice > 0) {
      const calcPct = Math.round((1 - sPrice / regPrice) * 100);
      setFormDiscountPercent(Math.min(50, Math.max(0, calcPct)));
    } else if (!val) {
      setFormDiscountPercent(0);
    }
  };

  // Sync Discount Percent -> Sale Price for Edit
  const handleEditDiscountSliderChange = (pct: number) => {
    setEditDiscountPercent(pct);
    const regPrice = parseFloat(editPrice);
    if (!isNaN(regPrice) && regPrice > 0) {
      if (pct > 0) {
        const discounted = regPrice * (1 - pct / 100);
        setEditSalePrice(discounted.toFixed(2));
      } else {
        setEditSalePrice("");
      }
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.titleFr.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.titleEn.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === "ALL" || p.vehicleType === filterType;

    const matchesStock =
      stockFilter === "ALL" ||
      (stockFilter === "IN_STOCK" && p.stock > p.threshold) ||
      (stockFilter === "LOW_STOCK" && p.stock > 0 && p.stock <= p.threshold) ||
      (stockFilter === "OUT_OF_STOCK" && p.stock === 0);

    return matchesSearch && matchesType && matchesStock;
  });

  // Calculate Metrics
  const totalUnitsInStock = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCatalogValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.threshold).length;
  const carsCount = products.filter((p) => p.vehicleType === VehicleType.CAR).length;
  const bikesCount = products.filter(
    (p) =>
      p.vehicleType === VehicleType.MOTORCYCLE_ADULT ||
      p.vehicleType === VehicleType.MOTORCYCLE_KIDS
  ).length;

  // File picker handler for Create
  const handleLocalImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 15MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setFormUploadedImages((prev) => [
            ...prev,
            {
              data: dataUrl,
              mimeType: file.type || "image/jpeg",
              name: file.name,
              size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
              isPrimary: prev.length === 0,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  // File picker handler for Edit
  const handleEditLocalImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        alert(`File ${file.name} exceeds 15MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setEditNewUploadedImages((prev) => [
            ...prev,
            {
              data: dataUrl,
              mimeType: file.type || "image/jpeg",
              name: file.name,
              size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
              isPrimary: false,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  // Open Edit Modal
  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setEditTitle(product.titleFr || "");
    setEditTitleEn(product.titleEn || "");
    setEditDesc(product.descFr || "");
    setEditPrice(product.price.toString());
    setEditSalePrice(product.salePrice ? product.salePrice.toString() : "");

    // Compute initial discount percent if salePrice exists
    if (product.salePrice && product.salePrice < product.price) {
      const calcPct = Math.round((1 - product.salePrice / product.price) * 100);
      setEditDiscountPercent(calcPct);
    } else {
      setEditDiscountPercent(0);
    }

    setEditStock(product.stock);
    setEditThreshold(product.threshold);
    setEditVehicleType(product.vehicleType);
    setEditCategoryId(product.categoryId);
    setEditEngineCapacity(product.engineCapacity || "");
    setEditAgeGroup(product.ageGroup || "");
    setEditStatus(product.status);
    setEditIsFeatured(product.isFeatured);
    setEditSpecsPower(product.specifications?.power || "");
    setEditSpecsTransmission(product.specifications?.transmission || "");
    setEditSpecsWeight(product.specifications?.weight || "");
    setEditSpecsSeatHeight(product.specifications?.seatHeight || "");
    setEditExistingImages(product.images || []);
    setEditDeleteImageIds([]);
    setEditPrimaryImageId(
      product.images?.find((img) => img.isPrimary)?.id || product.images?.[0]?.id || ""
    );
    setEditNewUploadedImages([]);
    setEditActiveImageSlide(0);
    setEditError(null);
    setIsEditModalOpen(true);
  };

  // Handle Quick +/- Stock adjustments
  const handleQuickDeltaStock = (product: ProductItem, delta: number) => {
    const newQty = Math.max(0, product.stock + delta);
    startTransition(async () => {
      const res = await adjustInventoryStockAction(
        product.id,
        newQty,
        delta > 0 ? "Quick restock (+1 unit)" : "Quick stock decrement (-1 unit)"
      );
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, stock: newQty } : p))
        );
      }
    });
  };

  // Submit Quick Stock Modal
  const handleApplyQuickStockModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStockItem) return;

    startTransition(async () => {
      const res = await adjustInventoryStockAction(
        quickStockItem.id,
        quickStockValue,
        quickStockReason || "Manual stock count check"
      );
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === quickStockItem.id ? { ...p, stock: quickStockValue } : p))
        );
        setQuickStockItem(null);
      }
    });
  };

  // Toggle status
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

  // Delete product
  const handleDelete = (productId: string) => {
    if (!confirm("Are you sure you want to permanently delete this item from PostgreSQL?")) return;

    startTransition(async () => {
      const res = await deleteAdminProductAction(productId);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
      }
    });
  };

  // Create Product Submit
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrice.trim()) {
      setCreateError("Title and Price are required.");
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setCreateError("Price must be a valid positive number.");
      return;
    }

    setCreateError(null);
    startTransition(async () => {
      const res = await createAdminProductAction({
        sku: formSku.trim() || null,
        price: priceNum,
        salePrice: formSalePrice ? parseFloat(formSalePrice) : null,
        categoryId: formCategory || categories[0]?.id,
        vehicleType: formVehicleType,
        initialStock: formStock,
        engineCapacity: formEngineCapacity || null,
        ageGroup: formAgeGroup || null,
        images: formUploadedImages.map((img) => ({
          data: img.data,
          mimeType: img.mimeType,
          altText: formTitle,
          isPrimary: img.isPrimary,
        })),
        translations: [
          {
            locale: "fr",
            title: formTitle,
            description: formDesc || formTitle,
            specifications: {
              power: formPower || "Standard",
              transmission: formTransmission || "Standard",
              seatHeight: formSeatHeight || "Standard",
              weight: formWeight || "Standard",
            },
          },
          {
            locale: "en",
            title: formTitleEn || formTitle,
            description: formDesc || formTitle,
          },
        ],
      });

      if (res.success) {
        setIsCreateModalOpen(false);
        window.location.reload();
      } else {
        setCreateError(res.errorMessage || "Failed to create vehicle in PostgreSQL.");
      }
    });
  };

  // Edit Product Submit
  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editTitle.trim() || !editPrice.trim()) {
      setEditError("Title and Price are required.");
      return;
    }

    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setEditError("Price must be a valid positive number.");
      return;
    }

    setEditError(null);
    startTransition(async () => {
      const res = await updateAdminProductAction(editingProduct.id, {
        price: priceNum,
        salePrice: editSalePrice ? parseFloat(editSalePrice) : null,
        stock: editStock,
        threshold: editThreshold,
        categoryId: editCategoryId,
        vehicleType: editVehicleType,
        status: editStatus,
        isFeatured: editIsFeatured,
        engineCapacity: editEngineCapacity || null,
        ageGroup: editAgeGroup || null,
        translations: [
          {
            locale: "fr",
            title: editTitle,
            description: editDesc || editTitle,
            specifications: {
              power: editSpecsPower,
              transmission: editSpecsTransmission,
              seatHeight: editSpecsSeatHeight,
              weight: editSpecsWeight,
            },
          },
          {
            locale: "en",
            title: editTitleEn || editTitle,
            description: editDesc || editTitle,
          },
        ],
        deleteImageIds: editDeleteImageIds,
        primaryImageId: editPrimaryImageId || undefined,
        newImages: editNewUploadedImages.map((img) => ({
          data: img.data,
          mimeType: img.mimeType,
          altText: editTitle,
          isPrimary: img.isPrimary,
        })),
      });

      if (res.success) {
        setIsEditModalOpen(false);
        window.location.reload();
      } else {
        setEditError(res.errorMessage || "Failed to update vehicle.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans font-normal text-neutral-200">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#16803C]/15 text-[#16803C] border border-[#16803C]/30 font-medium">
              PostgreSQL Stored Media & Catalog
            </span>
            <span className="text-[11px] text-neutral-400">
              Zero External Cloud Latency
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
            Vehicle & Stock Management
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Define prices, adjust real-time showroom stock with sliders, add cars and bikes, and upload local images directly into PostgreSQL.
          </p>
        </div>

        <button
          onClick={() => {
            setFormUploadedImages([]);
            setActiveImageSlide(0);
            setFormDiscountPercent(0);
            setFormStock(5);
            setFormThreshold(2);
            setCreateError(null);
            setIsCreateModalOpen(true);
          }}
          className="px-4 py-2 rounded-md bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Car, Bike or Item</span>
        </button>
      </div>

      {/* KPI / Inventory Metrics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-md border border-[#222222] bg-[#141414]">
          <span className="text-[11px] text-neutral-400 block mb-1">
            Total Machines
          </span>
          <div className="text-xl font-medium text-white">{products.length}</div>
          <span className="text-[10px] text-neutral-500 font-mono">Catalog models</span>
        </div>

        <div className="p-3.5 rounded-md border border-[#222222] bg-[#141414]">
          <span className="text-[11px] text-neutral-400 block mb-1 flex items-center gap-1.5">
            <Car className="w-3.5 h-3.5 text-blue-400" />
            <span>Cars & Buggies</span>
          </span>
          <div className="text-xl font-medium text-blue-400">{carsCount}</div>
          <span className="text-[10px] text-neutral-500 font-mono">Automobiles</span>
        </div>

        <div className="p-3.5 rounded-md border border-[#222222] bg-[#141414]">
          <span className="text-[11px] text-neutral-400 block mb-1 flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5 text-[#E10600]" />
            <span>Motorcycles</span>
          </span>
          <div className="text-xl font-medium text-[#E10600]">{bikesCount}</div>
          <span className="text-[10px] text-neutral-500 font-mono">Adult & Kids</span>
        </div>

        <div className="p-3.5 rounded-md border border-[#222222] bg-[#141414]">
          <span className="text-[11px] text-neutral-400 block mb-1 flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-[#16803C]" />
            <span>Showroom Units</span>
          </span>
          <div className="text-xl font-medium text-[#16803C]">{totalUnitsInStock}</div>
          <span className="text-[10px] text-neutral-500 font-mono">Physical inventory</span>
        </div>

        <div className="p-3.5 rounded-md border border-[#222222] bg-[#141414]">
          <span className="text-[11px] text-neutral-400 block mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Low Stock</span>
          </span>
          <div className="text-xl font-medium text-amber-400">{lowStockCount}</div>
          <span className="text-[10px] text-neutral-500 font-mono">Below threshold</span>
        </div>

        <div className="p-3.5 rounded-md border border-[#222222] bg-[#141414]">
          <span className="text-[11px] text-neutral-400 block mb-1">
            Stock Valuation
          </span>
          <div className="text-base font-medium text-white truncate">
            {totalCatalogValue.toLocaleString("fr-FR", {
              style: "currency",
              currency: "EUR",
              maximumFractionDigits: 0,
            })}
          </div>
          <span className="text-[10px] text-neutral-500 font-mono">TTC value</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by title, SKU, or engine specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-md bg-[#141414] border border-[#262626] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E10600]"
          />
        </div>

        {/* Vehicle Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-md bg-[#141414] border border-[#262626] text-xs text-white focus:outline-none focus:border-[#E10600]"
        >
          <option value="ALL">All Categories & Types</option>
          <option value="CAR">Cars & Performance Vehicles</option>
          <option value="MOTORCYCLE_ADULT">Adult Competition Bikes</option>
          <option value="MOTORCYCLE_KIDS">Kids' Dirt Bikes</option>
          <option value="QUAD">All-Terrain Quads</option>
          <option value="EQUIPMENT">Riding Equipment & Helmets</option>
          <option value="PARTS">Spare Parts & Upgrades</option>
          <option value="OTHER">Other Items</option>
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-3 py-2 rounded-md bg-[#141414] border border-[#262626] text-xs text-white focus:outline-none focus:border-[#E10600]"
        >
          <option value="ALL">All Stock Statuses</option>
          <option value="IN_STOCK">In Stock (&gt; Threshold)</option>
          <option value="LOW_STOCK">Low Stock (≤ Threshold)</option>
          <option value="OUT_OF_STOCK">Out of Stock (0 units)</option>
        </select>
      </div>

      {/* Products & Stock Management Table */}
      <div className="border border-[#222222] rounded-md bg-[#141414] overflow-hidden shadow-lg">
        <div className="overflow-x-auto popup-scroll">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-[#181818] border-b border-[#262626] text-[11px] font-normal text-neutral-400">
              <tr>
                <th className="p-3.5">Machine / Item</th>
                <th className="p-3.5">Type & Category</th>
                <th className="p-3.5 text-right">Defined Price (TTC)</th>
                <th className="p-3.5 text-center">Stock Management</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222222]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-neutral-500 space-y-2">
                    <Package className="w-8 h-8 mx-auto text-neutral-600" />
                    <p>No machines found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isLow = prod.stock <= prod.threshold && prod.stock > 0;
                  const isOut = prod.stock === 0;

                  return (
                    <tr key={prod.id} className="hover:bg-[#1A1A1A] transition-colors">
                      {/* Machine info & thumbnail */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-14 h-14 rounded bg-[#0B0B0B] border border-[#262626] overflow-hidden shrink-0">
                            {prod.imageUrl ? (
                              <Image
                                src={prod.imageUrl}
                                alt={prod.titleFr}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-[9px] text-neutral-600 font-mono">
                                <ImageIcon className="w-4 h-4 mb-0.5 text-neutral-600" />
                                <span>NO IMG</span>
                              </div>
                            )}
                            {prod.images && prod.images.length > 1 && (
                              <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[8px] font-mono text-neutral-300">
                                +{prod.images.length - 1}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-[#E10600]">
                                {prod.sku}
                              </span>
                              {prod.engineCapacity && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#242424] text-neutral-300">
                                  {prod.engineCapacity}
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs font-medium text-white block leading-tight">
                              {prod.titleFr}
                            </h4>
                            {prod.titleEn && prod.titleEn !== prod.titleFr && (
                              <span className="text-[11px] text-neutral-400 block">
                                {prod.titleEn}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type & Category */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#1E1E1E] text-neutral-300 border border-[#2E2E2E]">
                            {prod.vehicleType === VehicleType.CAR && "Car"}
                            {prod.vehicleType === VehicleType.MOTORCYCLE_ADULT && "Adult Bike"}
                            {prod.vehicleType === VehicleType.MOTORCYCLE_KIDS && "Kids Bike"}
                            {prod.vehicleType === VehicleType.QUAD && "Quad / ATV"}
                            {prod.vehicleType === VehicleType.EQUIPMENT && "Equipment"}
                            {prod.vehicleType === VehicleType.PARTS && "Part"}
                            {prod.vehicleType === VehicleType.OTHER && "Other"}
                          </span>
                          <span className="text-[11px] text-neutral-400 block">
                            {prod.categoryName}
                          </span>
                        </div>
                      </td>

                      {/* Defined Prices */}
                      <td className="p-3.5 text-right font-medium text-xs">
                        {prod.salePrice ? (
                          <div className="space-y-0.5">
                            <span className="text-[#E10600] text-sm block">
                              {prod.salePrice.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                              })}
                            </span>
                            <span className="text-[10px] text-neutral-500 line-through">
                              {prod.price.toLocaleString("fr-FR", {
                                style: "currency",
                                currency: "EUR",
                              })}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white text-sm">
                            {prod.price.toLocaleString("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            })}
                          </span>
                        )}
                      </td>

                      {/* Stock Management Column with Quick Controls */}
                      <td className="p-3.5 text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          <div className="flex items-center gap-1.5">
                            {/* Decrement Stock */}
                            <button
                              onClick={() => handleQuickDeltaStock(prod, -1)}
                              disabled={isPending || prod.stock <= 0}
                              title="Decrease stock by 1"
                              className="w-6 h-6 rounded bg-[#202020] hover:bg-[#2C2C2C] text-neutral-300 hover:text-white flex items-center justify-center disabled:opacity-30 cursor-pointer border border-[#333]"
                            >
                              <Minus className="w-3 h-3" />
                            </button>

                            {/* Stock Badge / Trigger Quick Modal */}
                            <button
                              onClick={() => {
                                setQuickStockItem(prod);
                                setQuickStockValue(prod.stock);
                                setQuickStockReason("Manual stock count check");
                              }}
                              className={`px-2.5 py-0.5 rounded font-mono text-xs cursor-pointer transition-all border ${
                                isOut
                                  ? "bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25"
                                  : isLow
                                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
                                  : "bg-[#16803C]/15 text-[#16803C] border-[#16803C]/30 hover:bg-[#16803C]/25"
                              }`}
                              title="Click to set exact stock"
                            >
                              {prod.stock} units
                            </button>

                            {/* Increment Stock */}
                            <button
                              onClick={() => handleQuickDeltaStock(prod, +1)}
                              disabled={isPending}
                              title="Increase stock by 1"
                              className="w-6 h-6 rounded bg-[#202020] hover:bg-[#2C2C2C] text-neutral-300 hover:text-white flex items-center justify-center disabled:opacity-30 cursor-pointer border border-[#333]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-[10px] text-neutral-500 font-mono">
                            {isOut
                              ? "Out of stock"
                              : isLow
                              ? `Low alert (≤${prod.threshold})`
                              : `Threshold: ${prod.threshold}`}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleStatus(prod)}
                          disabled={isPending}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-normal cursor-pointer transition-colors ${
                            prod.status === ProductStatus.PUBLISHED
                              ? "bg-[#16803C]/15 text-[#16803C] border border-[#16803C]/30 hover:bg-[#16803C]/25"
                              : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"
                          }`}
                        >
                          {prod.status === ProductStatus.PUBLISHED ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded hover:bg-[#242424] text-neutral-400 hover:text-white transition-colors cursor-pointer border border-[#2A2A2A]"
                            title="Edit Vehicle & Prices"
                          >
                            <Edit className="w-3.5 h-3.5 text-[#E10600]" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id)}
                            disabled={isPending}
                            className="p-1.5 rounded hover:bg-red-500/10 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer border border-[#2A2A2A]"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK STOCK ADJUSTMENT MODAL */}
      {quickStockItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-[#141414] border border-[#2E2E2E] rounded-md shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#262626] p-4 shrink-0 bg-[#141414]">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#16803C]" />
                <h3 className="text-sm font-medium text-white">
                  Stock Reconciliation: {quickStockItem.sku}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickStockItem(null)}
                aria-label="Close stock reconciliation modal"
                className="text-neutral-500 hover:text-white cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyQuickStockModal} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-4 sm:p-5 overflow-y-auto popup-scroll space-y-4 text-xs flex-1">
                <p className="text-xs text-neutral-300">
                  Updating physical showroom stock for <span className="text-white font-medium">{quickStockItem.titleFr}</span>.
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-normal text-neutral-400">
                      Available Count in Showroom
                    </label>
                    <span className="text-sm font-mono text-white font-medium">
                      {quickStockValue} units
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    aria-label="Available count in showroom"
                    value={quickStockValue}
                    onChange={(e) => setQuickStockValue(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-1.5 cursor-pointer accent-[#E10600]"
                  />

                  <input
                    type="number"
                    min="0"
                    required
                    aria-label="Available count in showroom numeric units"
                    value={quickStockValue}
                    onChange={(e) => setQuickStockValue(parseInt(e.target.value, 10) || 0)}
                    className="w-full h-9 px-3 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white font-mono text-sm focus:outline-none focus:border-[#E10600]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                    Adjustment Reason (PostgreSQL Audit Log)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Received shipment / Physical inventory count"
                    value={quickStockReason}
                    onChange={(e) => setQuickStockReason(e.target.value)}
                    className="w-full h-8 px-2.5 rounded bg-[#1C1C1C] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                  />
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t border-[#262626] bg-[#141414] shrink-0 flex justify-end gap-2 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuickStockItem(null)}
                  className="px-3.5 py-1.5 rounded border border-[#2E2E2E] text-neutral-400 hover:text-white text-xs cursor-pointer font-normal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-1.5 rounded bg-[#16803C] hover:bg-[#126b32] text-white font-medium text-xs cursor-pointer disabled:opacity-50"
                >
                  {isPending ? "Updating..." : "Save Stock Level"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE VEHICLE / ITEM MODAL WITH SLIDERS */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-4xl bg-[#141414] border border-[#2A2A2A] rounded-lg shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden my-auto font-sans">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#242424] p-4 sm:p-5 shrink-0 bg-[#141414] shadow-xs">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#E10600]" />
                <h3 className="text-base sm:text-lg font-medium text-white tracking-tight">
                  Add Showroom Machine or Catalog Item
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Close add machine modal"
                className="text-neutral-500 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto popup-scroll p-4 sm:p-6 space-y-6">
                {createError && (
                  <div className="p-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2 font-normal">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-normal text-neutral-400">
                  Select Machine or Item Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { type: VehicleType.CAR, label: "Car / Performance" },
                    { type: VehicleType.MOTORCYCLE_ADULT, label: "Adult Motorcycle" },
                    { type: VehicleType.MOTORCYCLE_KIDS, label: "Kids' Mini-Moto" },
                    { type: VehicleType.QUAD, label: "All-Terrain Quad" },
                    { type: VehicleType.EQUIPMENT, label: "Riding Equipment" },
                    { type: VehicleType.PARTS, label: "Spare Parts" },
                    { type: VehicleType.OTHER, label: "Other Items" },
                  ].map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => setFormVehicleType(opt.type)}
                      className={`p-2.5 rounded-md text-left border transition-all cursor-pointer text-xs font-normal ${
                        formVehicleType === opt.type
                          ? "bg-[#E10600]/15 border-[#E10600] text-white"
                          : "bg-[#181818] border-[#2A2A2A] text-neutral-400 hover:text-white hover:border-neutral-600"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Core Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                    Machine / Item Name (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Porsche 911 GT3 Clubsport or KTM 450 SX-F Factory"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-[#181818] border border-[#2E2E2E] text-white font-normal focus:outline-none focus:border-[#E10600]"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-[#181818] border border-[#2E2E2E] text-white font-normal focus:outline-none focus:border-[#E10600]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SKU Code (Optional) */}
                <div>
                  <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                    SKU Code (Auto-generated if left empty)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KTM-450-SXF"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-[#181818] border border-[#2E2E2E] text-white font-mono uppercase focus:outline-none focus:border-[#E10600]"
                  />
                </div>

                {/* English Title */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                    English Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="English international display name"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-[#181818] border border-[#2E2E2E] text-white font-normal focus:outline-none focus:border-[#E10600]"
                  />
                </div>
              </div>

              {/* SLIDERS SECTION 1: PRICE DEFINITION & PROMOTIONAL DISCOUNT SLIDER */}
              <div className="p-4 rounded-md bg-[#181818] border border-[#262626] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#E10600]" />
                    <h4 className="text-xs font-medium text-white tracking-normal">
                      Price Definition & Promotional Discount
                    </h4>
                  </div>
                  {formDiscountPercent > 0 && (
                    <span className="text-[11px] font-mono text-[#E10600] bg-[#E10600]/10 px-2 py-0.5 rounded border border-[#E10600]/20">
                      {formDiscountPercent}% Discount Active
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                      Regular Price (€ TTC) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 12500"
                      value={formPrice}
                      onChange={(e) => {
                        setFormPrice(e.target.value);
                        if (formDiscountPercent > 0) {
                          const p = parseFloat(e.target.value);
                          if (!isNaN(p) && p > 0) {
                            setFormSalePrice((p * (1 - formDiscountPercent / 100)).toFixed(2));
                          }
                        }
                      }}
                      className="w-full h-9 px-3 rounded-md bg-[#141414] border border-[#2E2E2E] text-white font-mono text-sm focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                      Promotional Sale Price (€) (Optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 11900"
                      value={formSalePrice}
                      onChange={(e) => handleSalePriceInputChange(e.target.value)}
                      className="w-full h-9 px-3 rounded-md bg-[#141414] border border-[#2E2E2E] text-white font-mono text-sm focus:outline-none focus:border-[#E10600]"
                    />
                  </div>
                </div>

                {/* Promotional Discount Range Slider */}
                <div className="p-3 rounded bg-[#141414] border border-[#242424] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 flex items-center gap-1.5 font-normal">
                      <Percent className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Promotional Discount Slider</span>
                    </span>
                    <span className="font-mono text-white text-xs font-medium">
                      {formDiscountPercent}% discount
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    aria-label="Promotional discount percentage"
                    value={formDiscountPercent}
                    onChange={(e) => handleDiscountSliderChange(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 cursor-pointer accent-[#E10600]"
                  />

                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <button
                      type="button"
                      onClick={() => handleDiscountSliderChange(0)}
                      className="hover:text-neutral-300 cursor-pointer"
                    >
                      0% (Full Price)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDiscountSliderChange(10)}
                      className="hover:text-neutral-300 cursor-pointer"
                    >
                      10% Off
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDiscountSliderChange(20)}
                      className="hover:text-neutral-300 cursor-pointer"
                    >
                      20% Off
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDiscountSliderChange(35)}
                      className="hover:text-neutral-300 cursor-pointer"
                    >
                      35% Off
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDiscountSliderChange(50)}
                      className="hover:text-neutral-300 cursor-pointer"
                    >
                      50% Max
                    </button>
                  </div>
                </div>
              </div>

              {/* SLIDERS SECTION 2: SHOWROOM PHYSICAL STOCK SLIDER */}
              <div className="p-4 rounded-md bg-[#181818] border border-[#262626] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-[#16803C]" />
                    <h4 className="text-xs font-medium text-white tracking-normal">
                      Stock Management & Inventory Slider
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-[#16803C] font-medium">
                    {formStock} units selected
                  </span>
                </div>

                {/* Stock Level Slider */}
                <div className="p-3 rounded bg-[#141414] border border-[#242424] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-normal">
                      Initial Physical Stock Count Slider
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={formStock}
                        onChange={(e) => setFormStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-16 h-7 px-2 rounded bg-[#1E1E1E] border border-[#333] text-white font-mono text-xs text-center focus:outline-none focus:border-[#E10600]"
                      />
                      <span className="text-neutral-500 font-mono text-xs">units</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    aria-label="Initial physical stock count"
                    value={Math.min(50, formStock)}
                    onChange={(e) => setFormStock(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 cursor-pointer accent-[#E10600]"
                  />

                  {/* Stock Preset Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-neutral-500 mr-1">Presets:</span>
                    {[
                      { label: "0 (Out of stock)", value: 0 },
                      { label: "1 (Single piece)", value: 1 },
                      { label: "5 (Standard)", value: 5 },
                      { label: "10 (Showroom)", value: 10 },
                      { label: "25 (Fleet)", value: 25 },
                      { label: "50 (Max batch)", value: 50 },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setFormStock(preset.value)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer border ${
                          formStock === preset.value
                            ? "bg-[#E10600]/20 text-[#E10600] border-[#E10600]/40"
                            : "bg-[#1E1E1E] text-neutral-400 border-[#2A2A2A] hover:text-white"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Low-stock threshold */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                      Low-Stock Warning Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formThreshold}
                      onChange={(e) => setFormThreshold(parseInt(e.target.value, 10) || 1)}
                      className="w-full h-8 px-2.5 rounded bg-[#141414] border border-[#2E2E2E] text-white font-mono text-xs focus:outline-none focus:border-[#E10600]"
                    />
                    <span className="text-[10px] text-neutral-500 mt-1 block">
                      Alerts trigger when showroom count drops to or below this number.
                    </span>
                  </div>
                </div>
              </div>

              {/* LOCAL IMAGE IMPORTER WITH INTERACTIVE SLIDER PREVIEW */}
              <div className="p-4 rounded-md bg-[#181818] border border-[#262626] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-medium text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#16803C]" />
                      <span>Local Images (Stored directly in PostgreSQL)</span>
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Images are read from disk and saved as PostgreSQL bytea without any external remote storage.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#16803C]">
                    {formUploadedImages.length} image(s) loaded
                  </span>
                </div>

                {/* Upload Zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-[#333] hover:border-[#E10600] rounded-md p-5 text-center cursor-pointer transition-colors bg-[#141414] hover:bg-[#1A1A1A] group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    onChange={handleLocalImagePick}
                  />
                  <UploadCloud className="w-7 h-7 mx-auto text-neutral-500 group-hover:text-[#E10600] transition-colors mb-2" />
                  <span className="text-xs font-normal text-white block">
                    Click to import vehicle images from your computer
                  </span>
                  <span className="text-[11px] text-neutral-500 block mt-0.5">
                    Select PNG, JPG, or WEBP photos. You can slide through the image preview below.
                  </span>
                </div>

                {/* SLIDER / CAROUSEL PREVIEW FOR UPLOADED LOCAL IMAGES */}
                {formUploadedImages.length > 0 && (
                  <div className="p-3 rounded bg-[#141414] border border-[#262626] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400 flex items-center gap-1.5 font-normal">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Interactive Photo Slider Preview</span>
                      </span>
                      <span className="font-mono text-neutral-400 text-xs">
                        Slide {activeImageSlide + 1} of {formUploadedImages.length}
                      </span>
                    </div>

                    {/* Main Active Image Slide Display */}
                    <div className="relative w-full aspect-16/9 max-h-72 rounded bg-black overflow-hidden border border-[#2A2A2A] flex items-center justify-center">
                      <img
                        src={formUploadedImages[activeImageSlide]?.data}
                        alt="Preview slide"
                        className="w-full h-full object-contain"
                      />

                      {/* Navigation Prev / Next Buttons */}
                      {formUploadedImages.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveImageSlide((prev) =>
                                prev === 0 ? formUploadedImages.length - 1 : prev - 1
                              )
                            }
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors border border-white/20"
                            title="Previous image"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveImageSlide((prev) =>
                                prev === formUploadedImages.length - 1 ? 0 : prev + 1
                              )
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors border border-white/20"
                            title="Next image"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Image Details Banner */}
                      <div className="absolute bottom-0 inset-x-0 bg-black/75 backdrop-blur-sm p-2 flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2 text-neutral-300 truncate max-w-[60%]">
                          <span className="truncate">{formUploadedImages[activeImageSlide]?.name}</span>
                          <span className="text-[10px] text-neutral-500">
                            ({formUploadedImages[activeImageSlide]?.size})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormUploadedImages((prev) =>
                                prev.map((img, i) => ({
                                  ...img,
                                  isPrimary: i === activeImageSlide,
                                }))
                              );
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] cursor-pointer flex items-center gap-1 ${
                              formUploadedImages[activeImageSlide]?.isPrimary
                                ? "bg-[#E10600] text-white"
                                : "bg-neutral-800 text-neutral-300 hover:text-white"
                            }`}
                          >
                            <Star className="w-3 h-3 fill-current" />
                            <span>
                              {formUploadedImages[activeImageSlide]?.isPrimary
                                ? "Primary Photo"
                                : "Set as Primary"}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setFormUploadedImages((prev) =>
                                prev.filter((_, i) => i !== activeImageSlide)
                              );
                              setActiveImageSlide((prev) => Math.max(0, prev - 1));
                            }}
                            className="p-1 rounded text-neutral-400 hover:text-red-400 cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Image Thumbnails Rail */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {formUploadedImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageSlide(idx)}
                          className={`relative w-14 h-14 rounded overflow-hidden border shrink-0 transition-all cursor-pointer ${
                            activeImageSlide === idx
                              ? "border-[#E10600] ring-1 ring-[#E10600]"
                              : "border-[#2E2E2E] opacity-60 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={img.data}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {img.isPrimary && (
                            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#E10600]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3 text-xs">
                <span className="text-[11px] font-normal text-neutral-400 block">
                  Machine Specifications & Performance (Optional)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Displacement / Capacity</label>
                    <input
                      type="text"
                      placeholder="e.g. 4.0L V8 or 250cc"
                      value={formEngineCapacity}
                      onChange={(e) => setFormEngineCapacity(e.target.value)}
                      className="w-full h-8 px-2.5 rounded bg-[#181818] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Max Power / HP</label>
                    <input
                      type="text"
                      placeholder="e.g. 510 HP or 48 HP"
                      value={formPower}
                      onChange={(e) => setFormPower(e.target.value)}
                      className="w-full h-8 px-2.5 rounded bg-[#181818] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Transmission</label>
                    <input
                      type="text"
                      placeholder="e.g. 6-Speed Sequential"
                      value={formTransmission}
                      onChange={(e) => setFormTransmission(e.target.value)}
                      className="w-full h-8 px-2.5 rounded bg-[#181818] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Dry Weight</label>
                    <input
                      type="text"
                      placeholder="e.g. 1260 kg or 104 kg"
                      value={formWeight}
                      onChange={(e) => setFormWeight(e.target.value)}
                      className="w-full h-8 px-2.5 rounded bg-[#181818] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Description / Presentation</label>
                  <textarea
                    rows={3}
                    placeholder="Provide overview of chassis, performance, track tuning and showroom presentation..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#181818] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3.5 sm:p-4 border-t border-[#242424] bg-[#141414] shrink-0 flex justify-end gap-3 shadow-xs">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-md border border-[#2E2E2E] hover:bg-[#1C1C1C] text-neutral-400 hover:text-white text-xs font-normal cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-md bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Writing to PostgreSQL...</span>
                  </>
                ) : (
                  <span>Save & Publish to Showroom</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

      {/* EDIT VEHICLE / ITEM MODAL WITH SLIDERS */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="w-full max-w-4xl bg-[#141414] border border-[#2A2A2A] rounded-lg shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden my-auto font-sans">
            <div className="flex items-center justify-between border-b border-[#242424] p-4 sm:p-5 shrink-0 bg-[#141414] shadow-xs">
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#E10600]" />
                <div>
                  <h3 className="text-base font-medium text-white">
                    Edit Machine: {editingProduct.sku}
                  </h3>
                  <span className="text-[10px] font-mono text-neutral-500">
                    ID: {editingProduct.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Close edit machine modal"
                className="text-neutral-500 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto popup-scroll p-4 sm:p-6 space-y-6">
                {editError && (
                  <div className="p-3 rounded border border-red-500/30 bg-red-500/10 text-red-400 text-xs flex items-center gap-2 font-normal">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{editError}</span>
                  </div>
                )}
              {/* Type & Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                    Machine Type
                  </label>
                  <select
                    value={editVehicleType}
                    onChange={(e) => setEditVehicleType(e.target.value as VehicleType)}
                    className="w-full h-9 px-3 rounded-md bg-[#181818] border border-[#2E2E2E] text-white font-normal focus:outline-none focus:border-[#E10600]"
                  >
                    <option value={VehicleType.CAR}>Car / Performance</option>
                    <option value={VehicleType.MOTORCYCLE_ADULT}>Adult Motorcycle</option>
                    <option value={VehicleType.MOTORCYCLE_KIDS}>Kids' Mini-Moto</option>
                    <option value={VehicleType.QUAD}>All-Terrain Quad</option>
                    <option value={VehicleType.EQUIPMENT}>Riding Equipment</option>
                    <option value={VehicleType.PARTS}>Spare Parts</option>
                    <option value={VehicleType.OTHER}>Other Items</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                    Showroom Category
                  </label>
                  <select
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-[#181818] border border-[#2E2E2E] text-white font-normal focus:outline-none focus:border-[#E10600]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                    Title (French / Primary) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-[#181818] border border-[#2E2E2E] text-white font-normal focus:outline-none focus:border-[#E10600]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={editTitleEn}
                    onChange={(e) => setEditTitleEn(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-[#181818] border border-[#2E2E2E] text-white font-normal focus:outline-none focus:border-[#E10600]"
                  />
                </div>
              </div>

              {/* Price & Discount Slider for Edit */}
              <div className="p-4 rounded-md bg-[#181818] border border-[#262626] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#E10600]" />
                    <h4 className="text-xs font-medium text-white tracking-normal">
                      Price Definition & Promotional Discount
                    </h4>
                  </div>
                  {editDiscountPercent > 0 && (
                    <span className="text-[11px] font-mono text-[#E10600] bg-[#E10600]/10 px-2 py-0.5 rounded border border-[#E10600]/20">
                      {editDiscountPercent}% Discount
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                      Regular Price (€ TTC) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full h-9 px-3 rounded-md bg-[#141414] border border-[#2E2E2E] text-white font-mono text-sm focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                      Promotional Sale Price (€)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Optional"
                      value={editSalePrice}
                      onChange={(e) => setEditSalePrice(e.target.value)}
                      className="w-full h-9 px-3 rounded-md bg-[#141414] border border-[#2E2E2E] text-white font-mono text-sm focus:outline-none focus:border-[#E10600]"
                    />
                  </div>
                </div>

                {/* Edit Discount Slider */}
                <div className="p-3 rounded bg-[#141414] border border-[#242424] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 flex items-center gap-1.5 font-normal">
                      <Percent className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Promotional Discount Slider</span>
                    </span>
                    <span className="font-mono text-white text-xs font-medium">
                      {editDiscountPercent}% discount
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    aria-label="Promotional discount percentage"
                    value={editDiscountPercent}
                    onChange={(e) => handleEditDiscountSliderChange(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 cursor-pointer accent-[#E10600]"
                  />
                </div>
              </div>

              {/* Stock Management & Stock Slider for Edit */}
              <div className="p-4 rounded-md bg-[#181818] border border-[#262626] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-[#16803C]" />
                    <h4 className="text-xs font-medium text-white tracking-normal">
                      Physical Showroom Stock Slider
                    </h4>
                  </div>
                  <span className="text-xs font-mono text-[#16803C] font-medium">
                    {editStock} units
                  </span>
                </div>

                <div className="p-3 rounded bg-[#141414] border border-[#242424] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-normal">
                      Adjust Showroom Stock Quantity
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={editStock}
                        onChange={(e) => setEditStock(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-16 h-7 px-2 rounded bg-[#1E1E1E] border border-[#333] text-white font-mono text-xs text-center focus:outline-none focus:border-[#E10600]"
                      />
                      <span className="text-neutral-500 font-mono text-xs">units</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    aria-label="Adjust showroom stock quantity"
                    value={Math.min(50, editStock)}
                    onChange={(e) => setEditStock(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 cursor-pointer accent-[#E10600]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <label className="block text-[11px] font-normal text-neutral-400 mb-1">
                      Low-Stock Warning Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={editThreshold}
                      onChange={(e) => setEditThreshold(parseInt(e.target.value, 10) || 1)}
                      className="w-full h-8 px-2.5 rounded bg-[#141414] border border-[#2E2E2E] text-white font-mono text-xs focus:outline-none focus:border-[#E10600]"
                    />
                  </div>
                </div>
              </div>

              {/* POSTGRESQL IMAGE MANAGEMENT */}
              <div className="p-4 rounded-md bg-[#181818] border border-[#262626] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-medium text-white flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#16803C]" />
                      <span>PostgreSQL Stored Images</span>
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Stored in PostgreSQL bytecode (bytea) and served locally.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-md bg-[#1E1E1E] hover:bg-[#282828] text-white text-xs font-normal border border-[#333] flex items-center gap-1.5 cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5 text-[#16803C]" />
                    <span>Import Local Image</span>
                  </button>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    onChange={handleEditLocalImagePick}
                  />
                </div>

                {/* Existing Images from DB */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-neutral-400 block">
                    Images currently stored in PostgreSQL:
                  </span>
                  {editExistingImages.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic font-normal">
                      No images currently attached.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {editExistingImages.map((img) => {
                        const isDeleted = editDeleteImageIds.includes(img.id);
                        const isPrimary = editPrimaryImageId === img.id;

                        return (
                          <div
                            key={img.id}
                            className={`relative rounded border overflow-hidden bg-black group transition-all ${
                              isDeleted
                                ? "opacity-30 border-red-500"
                                : isPrimary
                                ? "border-[#E10600] ring-1 ring-[#E10600]"
                                : "border-[#333]"
                            }`}
                          >
                            <div className="relative aspect-square w-full">
                              <img
                                src={img.url}
                                alt="Vehicle image"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-1 bg-[#141414] flex items-center justify-between text-[9px] font-mono">
                              <button
                                type="button"
                                disabled={isDeleted}
                                onClick={() => setEditPrimaryImageId(img.id)}
                                className={`p-0.5 rounded cursor-pointer ${
                                  isPrimary ? "text-[#E10600]" : "text-neutral-500 hover:text-white"
                                }`}
                                title={isPrimary ? "Primary Image" : "Set as Primary"}
                              >
                                <Star className="w-3 h-3 fill-current" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (isDeleted) {
                                    setEditDeleteImageIds((prev) => prev.filter((id) => id !== img.id));
                                  } else {
                                    setEditDeleteImageIds((prev) => [...prev, img.id]);
                                  }
                                }}
                                className={`p-0.5 cursor-pointer ${
                                  isDeleted ? "text-amber-400" : "text-neutral-500 hover:text-red-400"
                                }`}
                                title={isDeleted ? "Undo Delete" : "Delete from PostgreSQL"}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            {isDeleted && (
                              <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center text-[10px] text-red-200">
                                Marked for delete
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Newly Picked Local Images for Edit */}
                {editNewUploadedImages.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#262626]">
                    <span className="text-[10px] font-mono text-[#16803C] block">
                      New Local Images to insert into PostgreSQL:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {editNewUploadedImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative rounded border border-[#16803C]/50 overflow-hidden bg-black"
                        >
                          <div className="relative aspect-square w-full">
                            <img
                              src={img.data}
                              alt={img.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-1 bg-[#141414] flex items-center justify-between text-[9px] font-mono">
                            <span className="truncate max-w-[70px] text-neutral-400">{img.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditNewUploadedImages((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-0.5 text-neutral-500 hover:text-red-400 cursor-pointer"
                              title="Cancel import"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Technical Specifications */}
              <div className="space-y-3 text-xs">
                <span className="text-[11px] font-normal text-neutral-400 block">
                  Specifications & Performance Metrics
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Displacement / Capacity</label>
                    <input
                      type="text"
                      placeholder="e.g. 450cc / V8 4.0L"
                      value={editEngineCapacity}
                      onChange={(e) => setEditEngineCapacity(e.target.value)}
                      className="w-full h-8 px-2.5 rounded bg-[#181818] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Power (HP)</label>
                    <input
                      type="text"
                      placeholder="e.g. 63 HP"
                      value={editSpecsPower}
                      onChange={(e) => setEditSpecsPower(e.target.value)}
                      className="w-full h-8 px-2.5 rounded bg-[#181818] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Transmission</label>
                    <input
                      type="text"
                      placeholder="e.g. 5-Speed Claw"
                      value={editSpecsTransmission}
                      onChange={(e) => setEditSpecsTransmission(e.target.value)}
                      className="w-full h-8 px-2.5 rounded bg-[#181818] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-neutral-400 mb-1">Weight</label>
                    <input
                      type="text"
                      placeholder="e.g. 102.5 kg"
                      value={editSpecsWeight}
                      onChange={(e) => setEditSpecsWeight(e.target.value)}
                      className="w-full h-8 px-2.5 rounded bg-[#181818] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 mb-1">Presentation & Description</label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#181818] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E10600]"
                  />
                </div>
              </div>

              {/* Status and Featured Controls */}
              <div className="flex items-center justify-between p-3 rounded bg-[#181818] border border-[#262626]">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-normal">
                    <input
                      type="checkbox"
                      checked={editStatus === ProductStatus.PUBLISHED}
                      onChange={(e) =>
                        setEditStatus(e.target.checked ? ProductStatus.PUBLISHED : ProductStatus.DRAFT)
                      }
                      className="w-4 h-4 rounded border-neutral-600 text-[#E10600] focus:ring-[#E10600] cursor-pointer"
                    />
                    <span>Published in Live Showroom</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-normal">
                    <input
                      type="checkbox"
                      checked={editIsFeatured}
                      onChange={(e) => setEditIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-600 text-[#E10600] focus:ring-[#E10600] cursor-pointer"
                    />
                    <span>Feature on Homepage Hero</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3.5 sm:p-4 border-t border-[#242424] bg-[#141414] shrink-0 flex justify-end gap-3 shadow-xs">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-md border border-[#2E2E2E] hover:bg-[#1C1C1C] text-neutral-400 hover:text-white text-xs font-normal cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-md bg-[#E10600] hover:bg-[#B80500] text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to PostgreSQL...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </div>
  );
}
