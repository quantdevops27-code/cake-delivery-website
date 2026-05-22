import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Edit3, Gift, ImagePlus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

type AddOnForm = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  type: "topper" | "candle" | "flower" | "dessert" | "gift" | "custom";
  active: boolean;
  sortOrder: number;
  productSlugs: string;
};

const emptyForm: AddOnForm = {
  name: "",
  slug: "",
  description: "",
  price: "149.00",
  image: "/images/cake-floral.jpg",
  type: "gift",
  active: true,
  sortOrder: 1,
  productSlugs: "",
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Image upload failed"));
    reader.readAsDataURL(file);
  });
}

export default function AddOns() {
  const utils = trpc.useUtils();
  const { data: addOns, isLoading } = trpc.commerce.adminListAddOns.useQuery();
  const [form, setForm] = useState<AddOnForm>(emptyForm);

  const uploadProductImage = trpc.product.uploadImage.useMutation();
  const createAddOn = trpc.commerce.createAddOn.useMutation({
    onSuccess: async () => {
      toast.success("Add-on created");
      setForm(emptyForm);
      await utils.commerce.adminListAddOns.invalidate();
      await utils.commerce.listAddOns.invalidate();
    },
  });
  const updateAddOn = trpc.commerce.updateAddOn.useMutation({
    onSuccess: async () => {
      toast.success("Add-on updated");
      setForm(emptyForm);
      await utils.commerce.adminListAddOns.invalidate();
      await utils.commerce.listAddOns.invalidate();
    },
  });
  const deleteAddOn = trpc.commerce.deleteAddOn.useMutation({
    onSuccess: async () => {
      toast.success("Add-on deleted");
      await utils.commerce.adminListAddOns.invalidate();
      await utils.commerce.listAddOns.invalidate();
    },
  });

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    try {
      const dataUrl = await readImageFile(file);
      const { url } = await uploadProductImage.mutateAsync({ fileName: file.name, dataUrl });
      setForm((current) => ({ ...current, image: url }));
      toast.success("Add-on image uploaded");
    } catch {
      toast.error("Image upload failed");
    }
  };

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description,
      price: form.price,
      image: form.image,
      type: form.type,
      active: form.active,
      sortOrder: Number(form.sortOrder),
      productSlugs: form.productSlugs.split(",").map((slug) => slug.trim()).filter(Boolean),
    };

    if (form.id) updateAddOn.mutate({ id: form.id, ...payload });
    else createAddOn.mutate(payload);
  };

  return (
    <AdminLayout>
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={submitForm} className="rounded-2xl border border-[#6B3A3A]/10 bg-white/70 p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#6B3A3A]">Add-on Markup</h2>
              <p className="text-sm text-[#1A1A1A]/50">Cake toppers, candles, flowers, hampers aur upsells.</p>
            </div>
            <Gift className="h-6 w-6 text-[#6B3A3A]" />
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[110px_minmax(0,1fr)]">
              <div className="overflow-hidden rounded-2xl border border-[#6B3A3A]/10 bg-white">
                <div className="aspect-square">
                  <img src={form.image} alt="Add-on preview" className="h-full w-full object-cover" />
                </div>
              </div>
              <div className="grid content-start gap-3">
                <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-full bg-[#6B3A3A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#6B3A3A]/90">
                  <ImagePlus className="h-4 w-4" />
                  Upload Image
                  <input type="file" accept="image/*" onChange={uploadImage} className="sr-only" />
                </label>
                <Field label="Image URL">
                  <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="admin-input" required />
                </Field>
              </div>
            </div>

            <Field label="Add-on Name">
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: form.slug || slugify(event.target.value) })} className="admin-input" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Slug">
                <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="admin-input" required />
              </Field>
              <Field label="Price">
                <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="admin-input" required />
              </Field>
            </div>
            <Field label="Description">
              <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="admin-input min-h-20" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as AddOnForm["type"] })} className="admin-input">
                  <option value="topper">Topper</option>
                  <option value="candle">Candle</option>
                  <option value="flower">Flower</option>
                  <option value="dessert">Dessert</option>
                  <option value="gift">Gift</option>
                  <option value="custom">Custom</option>
                </select>
              </Field>
              <Field label="Sort Order">
                <input type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="admin-input" />
              </Field>
            </div>
            <Field label="Allowed product slugs">
              <input value={form.productSlugs} onChange={(event) => setForm({ ...form, productSlugs: event.target.value })} className="admin-input" placeholder="blank means all products" />
            </Field>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#6B3A3A]">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
              Active on product page
            </label>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 rounded-full bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90">
                <Plus className="mr-2 h-4 w-4" />
                {form.id ? "Save Add-on" : "Add Add-on"}
              </Button>
              {form.id && <Button type="button" variant="outline" onClick={() => setForm(emptyForm)} className="rounded-full">Cancel</Button>}
            </div>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl bg-white/70 shadow-sm">
          <div className="border-b border-[#6B3A3A]/10 p-5">
            <h2 className="font-display text-2xl font-semibold text-[#6B3A3A]">Upsell Add-ons</h2>
            <p className="text-sm text-[#1A1A1A]/50">Frontend product add-ons ab yahan se manage honge.</p>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {isLoading ? (
              <p className="text-sm text-[#1A1A1A]/50">Loading add-ons...</p>
            ) : (
              addOns?.map((addOn) => (
                <div key={addOn.id} className="overflow-hidden rounded-2xl border border-[#6B3A3A]/10 bg-white">
                  <img src={addOn.image} alt={addOn.name} className="aspect-square w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#6B3A3A]">{addOn.name}</h3>
                        <p className="mt-1 text-xs text-[#1A1A1A]/50">{addOn.description}</p>
                      </div>
                      <span className="rounded-full bg-[#F8EDEB] px-2.5 py-1 text-xs font-bold text-[#6B3A3A]">&#8377;{Number(addOn.price).toLocaleString()}</span>
                    </div>
                    <p className="mt-3 text-xs text-[#1A1A1A]/45">
                      Products: {addOn.productSlugs.length ? addOn.productSlugs.join(", ") : "All"}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setForm({ ...addOn, productSlugs: addOn.productSlugs.join(",") })}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => deleteAddOn.mutate({ id: addOn.id })} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
