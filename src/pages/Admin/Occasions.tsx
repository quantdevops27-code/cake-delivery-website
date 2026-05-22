import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Edit3, PartyPopper, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";

type SectionForm = {
  id?: number;
  title: string;
  slug: string;
  type: "occasion" | "festival" | "category" | "recipient";
  event: string;
  image: string;
  description: string;
  active: boolean;
  sortOrder: number;
  startsAt: string;
  endsAt: string;
  productSlugs: string;
};

const emptyForm: SectionForm = {
  title: "",
  slug: "",
  type: "occasion",
  event: "Birthday",
  image: "/images/cake-blackforest.jpg",
  description: "",
  active: true,
  sortOrder: 1,
  startsAt: "",
  endsAt: "",
  productSlugs: "classic-black-forest-cake,rich-chocolate-truffle-cake",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function Occasions() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SectionForm>(emptyForm);
  const utils = trpc.useUtils();
  const { data: sections } = trpc.commerce.adminListOccasionSections.useQuery();

  const refresh = async () => {
    await utils.commerce.adminListOccasionSections.invalidate();
    await utils.commerce.listOccasionSections.invalidate();
  };

  const createSection = trpc.commerce.createOccasionSection.useMutation({
    onSuccess: async () => {
      toast.success("Section created");
      setOpen(false);
      await refresh();
    },
  });

  const updateSection = trpc.commerce.updateOccasionSection.useMutation({
    onSuccess: async () => {
      toast.success("Section updated");
      setOpen(false);
      await refresh();
    },
  });

  const deleteSection = trpc.commerce.deleteOccasionSection.useMutation({
    onSuccess: async () => {
      toast.success("Section deleted");
      await refresh();
    },
  });

  const openCreate = () => {
    setForm(emptyForm);
    setOpen(true);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      type: form.type,
      event: form.event,
      image: form.image,
      description: form.description,
      active: form.active,
      sortOrder: Number(form.sortOrder),
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      productSlugs: form.productSlugs
        .split(",")
        .map((slug) => slug.trim())
        .filter(Boolean),
    };

    if (form.id) {
      updateSection.mutate({ id: form.id, ...payload });
    } else {
      createSection.mutate(payload);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#6B3A3A]">
              Occasion & Festival Sections
            </h2>
            <p className="text-sm text-[#1A1A1A]/50">
              Manage storefront sections like Birthday, Anniversary, Holi, Diwali and Christmas.
            </p>
          </div>
          <Button onClick={openCreate} className="rounded-full bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Section
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {sections?.map((section) => (
            <div key={section.id} className="overflow-hidden rounded-2xl bg-white/70 shadow-sm">
              <div className="grid grid-cols-[160px_1fr]">
                <img src={section.image} alt={section.title} className="h-full min-h-40 w-full object-cover" />
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-[#D4A373]">{section.type} / {section.event}</p>
                      <h3 className="font-display text-xl font-semibold text-[#6B3A3A]">{section.title}</h3>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${section.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {section.active ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm text-[#1A1A1A]/60">{section.description}</p>
                  <p className="mt-3 text-xs text-[#1A1A1A]/45">
                    Products: {section.productSlugs.join(", ")}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setForm({
                          id: section.id,
                          title: section.title,
                          slug: section.slug,
                          type: section.type,
                          event: section.event,
                          image: section.image,
                          description: section.description,
                          active: section.active,
                          sortOrder: section.sortOrder,
                          startsAt: section.startsAt ?? "",
                          endsAt: section.endsAt ?? "",
                          productSlugs: section.productSlugs.join(","),
                        });
                        setOpen(true);
                      }}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteSection.mutate({ id: section.id })}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[88vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-[#6B3A3A]">
                {form.id ? "Edit Storefront Section" : "Add Storefront Section"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Section Title">
                  <input
                    required
                    value={form.title}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        title: event.target.value,
                        slug: form.slug || slugify(event.target.value),
                      })
                    }
                    className="admin-input"
                  />
                </Field>
                <Field label="Slug">
                  <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="admin-input" />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Type">
                  <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as SectionForm["type"] })} className="admin-input">
                    <option value="occasion">Occasion</option>
                    <option value="festival">Festival</option>
                    <option value="category">Category</option>
                    <option value="recipient">Recipient</option>
                  </select>
                </Field>
                <Field label="Event">
                  <input value={form.event} onChange={(event) => setForm({ ...form, event: event.target.value })} className="admin-input" />
                </Field>
                <Field label="Sort Order">
                  <input type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="admin-input" />
                </Field>
              </div>
              <Field label="Description">
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="admin-input min-h-24" />
              </Field>
              <Field label="Image URL">
                <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} className="admin-input" />
              </Field>
              <Field label="Product Slugs comma separated">
                <input value={form.productSlugs} onChange={(event) => setForm({ ...form, productSlugs: event.target.value })} className="admin-input" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Starts At">
                  <input type="date" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} className="admin-input" />
                </Field>
                <Field label="Ends At">
                  <input type="date" value={form.endsAt} onChange={(event) => setForm({ ...form, endsAt: event.target.value })} className="admin-input" />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-[#6B3A3A]">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                Show on storefront
              </label>
              <Button className="rounded-full bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90">
                <PartyPopper className="mr-2 h-4 w-4" />
                Save Section
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
