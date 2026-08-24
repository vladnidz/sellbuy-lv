"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Loader2, AlertCircle, CheckCircle, Sparkles } from "lucide-react";
import { useDemoAuth } from "@/app/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Category {
  value: string;
  label: string;
}

interface CategoryTreeNode {
  id: string;
  path: string;
  names: { lv: string; ru: string; en: string };
  children?: CategoryTreeNode[];
}


const FALLBACK_CATEGORIES: Category[] = [
  { value: "transports", label: "Transports" },
  { value: "nekustamie_ipasumi", label: "Nekustamie īpašumi" },
  { value: "elektronika_sadzives_tehnika", label: "Elektronika & Sadzīves tehnika" },
  { value: "celtnieciba_remonts", label: "Celtniecība & Remonts" },
  { value: "darbs_bizness", label: "Darbs & Bizness" },
  { value: "maja_darzs", label: "Māja & Dārzs" },
  { value: "apgerbi_aksesuari", label: "Apģērbi & Aksesuāri" },
  { value: "bernu_pasaule", label: "Bērnu pasaule" },
  { value: "lauksaimnieciba", label: "Lauksaimniecība" },
  { value: "dzivnieki_zoo", label: "Dzīvnieki & Zoo" },
  { value: "hobiji_atputa", label: "Hobiji & Atpūta" },
];

export default function NewListingPage() {
  const { user, ensureDemoUser } = useDemoAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // Fetch the live category tree and flatten it into flat <Select> options.
  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      try {
        const res = await fetch("/api/categories/tree");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const flatten = (nodes: CategoryTreeNode[], depth = 0): Category[] =>
          (nodes ?? []).flatMap((node) => [
            { value: node.id, label: `${depth > 0 ? "— ".repeat(depth) : ""}${node.names.lv}` },
            ...flatten(node.children ?? [], depth + 1),
          ]);

        const flattened = flatten(json?.data ?? []);
        if (!cancelled && flattened.length > 0) {
          setCategories(flattened);
        }
        // If the API returned an empty tree, keep the fallback list.
      } catch (err) {
        console.error("Failed to load categories, using fallback:", err);
        // Keep FALLBACK_CATEGORIES on error.
      } finally {
        if (!cancelled) {
          setIsLoadingCategories(false);
          // Small delay so the fade-in transition plays after data lands.
          requestAnimationFrame(() => setIsFormVisible(true));
        }
      }
    }

    loadCategories();
    return () => {
      cancelled = true;
    };
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    images: [] as File[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    try {
      await ensureDemoUser();

      const currentUser = user;
      if (!currentUser) {
        throw new Error("Lietotājs nav autorizēts");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("categoryId", formData.category);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("authorId", currentUser.id);

      for (const file of formData.images) {
        formDataToSend.append("images", file);
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Neizdevās izveidot sludinājumu");
      }

      setSubmitStatus("success");
      setTimeout(() => {
        router.push(`/listings/${data.id}`);
        router.refresh();
      }, 1500);
    } catch (err) {
      setSubmitStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Neizdevās iesniegt sludinājumu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (formData.images.length + newFiles.length > 10) {
        setErrorMessage("Maksimālais attēlu skaits ir 10");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));
      setErrorMessage("");
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Atpakaļ uz sākumlapu
        </Link>

        <Card
          className={`bg-slate-900/50 border-slate-800 backdrop-blur-xl transition-all duration-700 ease-out ${
            isFormVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >

          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-3xl font-bold">Izveidot jaunu sludinājumu</CardTitle>
            <CardDescription className="text-slate-400">Aizpildiet formu, lai publicētu savu sludinājumu</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                  Nosaukums *
                </label>
                <Input
                  id="title"
                  placeholder="Piemēram: iPhone 15 Pro 256GB"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-700"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
                  Kategorija *
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={isSubmitting || isLoadingCategories}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700">
                    <SelectValue
                      placeholder={
                        isLoadingCategories ? "Ielādē kategorijas…" : "Izvēlēties kategoriju"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 max-h-72 overflow-y-auto">
                    {(categories.length > 0 ? categories : FALLBACK_CATEGORIES).map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-300 mb-2">
                  Cena (EUR) *
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  className="bg-slate-900 border-slate-700"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                  Apraksts *
                </label>
                <textarea
                  id="description"
                  rows={6}
                  placeholder="Aprakstiet savu priekšmetu detalizēti..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full bg-slate-900 border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Attēli (vismaz 1, maksimum 10)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="bg-slate-900 border-slate-700 text-white rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting || formData.images.length >= 10}
                />
                {formData.images.length > 0 && (
                  <div className="mt-3 flex gap-2 flex-wrap">
                    {formData.images.map((file, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-950 border border-blue-700 rounded-full text-sm text-blue-300"
                      >
                        <ImageIcon className="h-3 w-3" />
                        {file.name}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="hover:text-blue-100 transition-colors"
                          aria-label="Dzēst attēlu"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {formData.images.length === 0 && (
                  <p className="mt-2 text-sm text-slate-500">Nav izvēlēti attēli</p>
                )}
              </div>

              {submitStatus === "error" && (
                <div className="flex items-center gap-2 p-3 bg-red-950 border border-red-700 rounded-lg text-red-300">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {submitStatus === "success" && (
                <div className="flex items-center gap-2 p-3 bg-green-950 border border-green-700 rounded-lg text-green-300">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <p>Sludinājums veiksmīgi publicēts! Pārejošam uz sludinājumu...</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Publicē...
                  </span>
                ) : (
                  "Publicēt sludinājumu"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-8 bg-gradient-to-br from-blue-950/50 to-indigo-950/50 border-blue-900/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">Smart-ID</div>
                <div className="text-sm text-slate-400">Verifikācija</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">Escrow</div>
                <div className="text-sm text-slate-400">Aizsardzība</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">Omniva/DPD</div>
                <div className="text-sm text-slate-400">Piegāde</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}