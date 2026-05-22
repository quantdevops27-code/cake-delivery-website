import { useState } from "react";
import type { FormEvent } from "react";
import { Edit3, FolderTree, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";

type CollectionForm = {
  id?: number;
  navName: string;
  navPath: string;
  columnTitle: string;
  name: string;
  slug: string;
  path: string;
  badge: string;
  promoImage: string;
  occasionSlug: string;
  active: boolean;
  sortOrder: number;
};

const emptyForm: CollectionForm = {
  navName: "Cakes",
  navPath: "/shop",
  columnTitle: "Trending Cakes",
  name: "",
  slug: "",
  path: "/shop",
  badge: "",
  promoImage: "",
  occasionSlug: "",
  active: true,
  sortOrder: 1,
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function Collections() {
  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.commerce.adminListCollectionItems.useQuery();
  const [form, setForm] = useState<CollectionForm>(emptyForm);

  const createItem = trpc.commerce.createCollectionItem.useMutation({
    onSuccess: async () => {
      toast.success("Collection item created");
      setForm(emptyForm);
      await utils.commerce.adminListCollectionItems.invalidate();
      await utils.commerce.listCollectionMenus.invalidate();
    },
  });

  const updateItem = trpc.commerce.updateCollectionItem.useMutation({
    onSuccess: async () => {
      toast.success("Collection item updated");
      setForm(emptyForm);
      await utils.commerce.adminListCollectionItems.invalidate();
      await utils.commerce.listCollectionMenus.invalidate();
    },
  });

  const deleteItem = trpc.commerce.deleteCollectionItem.useMutation({
    onSuccess: async () => {
      toast.success("Collection item deleted");
      await utils.commerce.adminListCollectionItems.invalidate();
      await utils.commerce.listCollectionMenus.invalidate();
    },
  });

  const submitForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      path: form.path || `/shop?search=${encodeURIComponent(form.name)}`,
      badge: form.badge || null,
      promoImage: form.promoImage || null,
      occasionSlug: form.occasionSlug || null,
      sortOrder: Number(form.sortOrder),
    };
    if (form.id) updateItem.mutate({ id: form.id, ...payload });
    else createItem.mutate(payload);
  };

  return (
    <AdminLayout>
      <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <form onSubmit={submitForm} className="rounded-2xl border border-[#6B3A3A]/10 bg-white/70 p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#6B3A3A]">Collection Builder</h2>
              <p className="text-sm text-[#1A1A1A]/50">Main collection, sub-column aur menu item manage karo.</p>
            </div>
            <FolderTree className="h-6 w-6 text-[#6B3A3A]" />
          </div>

          <div className="grid gap-4">
            <Field label="Main Collection">
              <input value={form.navName} onChange={(event) => setForm({ ...form, navName: event.target.value })} className="admin-input" placeholder="Cakes" required />
            </Field>
            <Field label="Main Collection URL">
              <input value={form.navPath} onChange={(event) => setForm({ ...form, navPath: event.target.value })} className="admin-input" required />
            </Field>
            <Field label="Sub Collection / Column">
              <input value={form.columnTitle} onChange={(event) => setForm({ ...form, columnTitle: event.target.value })} className="admin-input" placeholder="By Flavours" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Item Name">
                <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value, slug: form.slug || slugify(event.target.value) })} className="admin-input" required />
              </Field>
              <Field label="Slug">
                <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="admin-input" required />
              </Field>
            </div>
            <Field label="Item URL">
              <input value={form.path} onChange={(event) => setForm({ ...form, path: event.target.value })} className="admin-input" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Badge">
                <input value={form.badge} onChange={(event) => setForm({ ...form, badge: event.target.value })} className="admin-input" placeholder="New" />
              </Field>
              <Field label="Sort Order">
                <input type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="admin-input" />
              </Field>
            </div>
            <Field label="Promo Image URL">
              <input value={form.promoImage} onChange={(event) => setForm({ ...form, promoImage: event.target.value })} className="admin-input" placeholder="/images/cake-truffle.jpg" />
            </Field>
            <Field label="Linked Occasion Slug">
              <input value={form.occasionSlug} onChange={(event) => setForm({ ...form, occasionSlug: event.target.value })} className="admin-input" placeholder="birthday-special" />
            </Field>
            <label className="flex items-center gap-2 text-sm font-semibold text-[#6B3A3A]">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
              Active on storefront menu
            </label>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 rounded-full bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90">
                <Plus className="mr-2 h-4 w-4" />
                {form.id ? "Save Item" : "Add Item"}
              </Button>
              {form.id && (
                <Button type="button" variant="outline" onClick={() => setForm(emptyForm)} className="rounded-full">
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl bg-white/70 shadow-sm">
          <div className="border-b border-[#6B3A3A]/10 p-5">
            <h2 className="font-display text-2xl font-semibold text-[#6B3A3A]">Mega Menu Items</h2>
            <p className="text-sm text-[#1A1A1A]/50">Bakingo/FNP style nested menu structure.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8EDEB]/70 text-left text-[#1A1A1A]/55">
                <tr>
                  <th className="px-4 py-3 font-medium">Main</th>
                  <th className="px-4 py-3 font-medium">Sub Collection</th>
                  <th className="px-4 py-3 font-medium">Item</th>
                  <th className="px-4 py-3 font-medium">URL</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-[#1A1A1A]/50">Loading collections...</td></tr>
                ) : (
                  items?.map((item) => (
                    <tr key={item.id} className="border-b border-[#6B3A3A]/5 last:border-0">
                      <td className="px-4 py-3 font-semibold text-[#6B3A3A]">{item.navName}</td>
                      <td className="px-4 py-3">{item.columnTitle}</td>
                      <td className="px-4 py-3">
                        {item.name}
                        {item.badge && <span className="ml-2 rounded-full bg-red-100 px-2 py-1 text-xs text-red-600">{item.badge}</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#1A1A1A]/50">{item.path}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setForm({ ...item, badge: item.badge ?? "", promoImage: item.promoImage ?? "", occasionSlug: item.occasionSlug ?? "" })}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteItem.mutate({ id: item.id })} className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-[#6B3A3A]">
      {label}
      {children}
    </label>
  );
}
