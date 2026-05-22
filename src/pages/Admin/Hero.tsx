import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Palette, Save, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

type HeroForm = {
  id: number;
  title: string;
  highlight: string;
  text: string;
  product: string;
  image: string;
  price: string;
  accent: string;
  mood: string;
  wash: string;
  searchPlaceholder: string;
  badgeOne: string;
  badgeTwo: string;
  badgeThree: string;
  isActive: boolean;
  sortOrder: number;
};

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Image upload failed"));
    reader.readAsDataURL(file);
  });
}

function extractGradientColors(wash: string) {
  const colors = wash.match(/#[0-9a-fA-F]{6}/g);
  return {
    from: colors?.[0] ?? "#351308",
    mid: colors?.[1] ?? "#6f2f10",
    to: colors?.[2] ?? "#c76a22",
  };
}

function makeGradient(from: string, mid: string, to: string) {
  return `linear-gradient(135deg, ${from} 0%, ${mid} 43%, ${to} 100%)`;
}

function makeMood(accent: string) {
  const hex = accent.replace("#", "");
  const bigint = Number.parseInt(hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex, 16);
  const red = (bigint >> 16) & 255;
  const green = (bigint >> 8) & 255;
  const blue = bigint & 255;
  return `rgba(${red}, ${green}, ${blue}, 0.62)`;
}

export default function HeroAdmin() {
  const utils = trpc.useUtils();
  const { data: slides, isLoading } = trpc.site.adminListHeroSlides.useQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<HeroForm | null>(null);

  const selectedSlide = useMemo(() => {
    if (!slides?.length) return null;
    return slides.find((slide) => slide.id === selectedId) ?? slides[0];
  }, [selectedId, slides]);

  useEffect(() => {
    if (!selectedSlide) return;
    setSelectedId((current) => current ?? selectedSlide.id);
    setForm({ ...selectedSlide });
  }, [selectedSlide]);

  const updateHeroSlide = trpc.site.updateHeroSlide.useMutation({
    onSuccess: async () => {
      toast.success("Hero section updated");
      await utils.site.adminListHeroSlides.invalidate();
      await utils.site.getHeroSlides.invalidate();
    },
  });

  const uploadHeroImage = trpc.product.uploadImage.useMutation();

  const gradientColors = form ? extractGradientColors(form.wash) : extractGradientColors("");

  const setGradientColor = (key: "from" | "mid" | "to", value: string) => {
    if (!form) return;
    const next = { ...gradientColors, [key]: value };
    setForm({ ...form, wash: makeGradient(next.from, next.mid, next.to) });
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !form) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      const dataUrl = await readImageFile(file);
      const { url } = await uploadHeroImage.mutateAsync({
        fileName: file.name,
        dataUrl,
      });
      setForm({ ...form, image: url });
      toast.success("Hero image uploaded");
    } catch {
      toast.error("Hero image upload failed");
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    updateHeroSlide.mutate({
      ...form,
      sortOrder: Number(form.sortOrder),
    });
  };

  if (isLoading || !form || !slides?.length) {
    return (
      <AdminLayout>
        <div className="rounded-2xl bg-white/70 p-10 text-center text-[#6B3A3A]">
          Loading hero editor...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-3">
          {slides.map((slide) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setSelectedId(slide.id)}
              className={`flex w-full gap-3 rounded-2xl border p-3 text-left transition ${
                form.id === slide.id
                  ? "border-[#6B3A3A] bg-white shadow-sm"
                  : "border-[#6B3A3A]/10 bg-white/55 hover:bg-white"
              }`}
            >
              <img src={slide.image} alt={slide.product} className="h-20 w-20 rounded-xl object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-[#6B3A3A]">{slide.product}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#1A1A1A]/55">{slide.title}</span>
                <span className="mt-2 inline-flex rounded-full bg-[#6B3A3A]/8 px-2 py-1 text-[11px] font-semibold text-[#6B3A3A]">
                  Slide {slide.sortOrder}
                </span>
              </span>
            </button>
          ))}
        </aside>

        <form onSubmit={submitForm} className="grid gap-6">
          <section className="rounded-2xl border border-[#6B3A3A]/10 bg-white/70 p-5 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#6B3A3A]">
                  Hero Content
                </h2>
                <p className="text-sm text-[#1A1A1A]/50">
                  Homepage hero ke text, image aur background scene yahin se edit honge.
                </p>
              </div>
              <Button
                type="submit"
                disabled={updateHeroSlide.isPending}
                className="rounded-full bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Hero
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Headline">
                <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="admin-input" />
              </Field>
              <Field label="Highlighted word">
                <input required value={form.highlight} onChange={(event) => setForm({ ...form, highlight: event.target.value })} className="admin-input" />
              </Field>
              <Field label="Supporting text">
                <textarea required value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} className="admin-input min-h-28" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Product label">
                  <input required value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value })} className="admin-input" />
                </Field>
                <Field label="Display price">
                  <input required value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="admin-input" />
                </Field>
                <Field label="Search placeholder">
                  <input required value={form.searchPlaceholder} onChange={(event) => setForm({ ...form, searchPlaceholder: event.target.value })} className="admin-input" />
                </Field>
                <Field label="Sort order">
                  <input type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="admin-input" />
                </Field>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Badge 1">
                <input required value={form.badgeOne} onChange={(event) => setForm({ ...form, badgeOne: event.target.value })} className="admin-input" />
              </Field>
              <Field label="Badge 2">
                <input required value={form.badgeTwo} onChange={(event) => setForm({ ...form, badgeTwo: event.target.value })} className="admin-input" />
              </Field>
              <Field label="Badge 3">
                <input required value={form.badgeThree} onChange={(event) => setForm({ ...form, badgeThree: event.target.value })} className="admin-input" />
              </Field>
            </div>

            <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#6B3A3A]">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
              Show this slide on homepage
            </label>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl border border-[#6B3A3A]/10 bg-white/70 p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-[#6B3A3A]">Image & Background</h2>
                  <p className="text-sm text-[#1A1A1A]/50">Hero image upload aur background colors change karo.</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#6B3A3A] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#6B3A3A]/90">
                  <UploadCloud className="h-4 w-4" />
                  Upload Hero Image
                  <input type="file" accept="image/*" onChange={uploadImage} className="sr-only" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-2xl border border-[#6B3A3A]/10 bg-white">
                  <div className="aspect-square">
                    <img src={form.image} alt="Hero preview" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div className="grid gap-4">
                  <Field label="Hero image URL">
                    <input required value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="admin-input" />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-4">
                    <Field label="Accent">
                      <input type="color" value={form.accent} onChange={(event) => setForm({ ...form, accent: event.target.value, mood: makeMood(event.target.value) })} className="h-11 w-full rounded-xl border border-[#6B3A3A]/15 bg-white p-1" />
                    </Field>
                    <Field label="BG from">
                      <input type="color" value={gradientColors.from} onChange={(event) => setGradientColor("from", event.target.value)} className="h-11 w-full rounded-xl border border-[#6B3A3A]/15 bg-white p-1" />
                    </Field>
                    <Field label="BG middle">
                      <input type="color" value={gradientColors.mid} onChange={(event) => setGradientColor("mid", event.target.value)} className="h-11 w-full rounded-xl border border-[#6B3A3A]/15 bg-white p-1" />
                    </Field>
                    <Field label="BG end">
                      <input type="color" value={gradientColors.to} onChange={(event) => setGradientColor("to", event.target.value)} className="h-11 w-full rounded-xl border border-[#6B3A3A]/15 bg-white p-1" />
                    </Field>
                  </div>
                  <Field label="Advanced background CSS">
                    <textarea value={form.wash} onChange={(event) => setForm({ ...form, wash: event.target.value })} className="admin-input min-h-20 font-mono text-xs" />
                  </Field>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#6B3A3A]/10 bg-white shadow-sm">
              <div className="p-4">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-[#6B3A3A]">
                  <Palette className="h-5 w-5" />
                  Live Preview
                </h2>
              </div>
              <div className="relative min-h-[520px] overflow-hidden p-5 text-white" style={{ background: form.wash }}>
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(14,10,8,0.82)_0%,rgba(14,10,8,0.42)_100%)]" />
                <div className="relative z-10">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {[form.badgeOne, form.badgeTwo, form.badgeThree].map((badge) => (
                      <span key={badge} className="rounded-md border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-bold uppercase">
                        {badge}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display text-4xl font-bold leading-none">{form.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/75">{form.text}</p>
                  <div className="mt-5 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2" style={{ boxShadow: `0 0 60px ${form.mood}` }}>
                    <img src={form.image} alt={form.product} className="aspect-[4/3] w-full rounded-xl object-cover" />
                  </div>
                  <div className="mt-4 rounded-xl p-4 text-[#2f211b]" style={{ backgroundColor: form.accent }}>
                    <p className="text-xs font-bold uppercase">Now showing</p>
                    <p className="text-lg font-black">{form.product}</p>
                    <p className="text-2xl font-black">&#8377;{form.price}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </form>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#6B3A3A]">
      {label}
      {children}
    </label>
  );
}
