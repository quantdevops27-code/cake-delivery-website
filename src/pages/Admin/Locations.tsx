import { useState } from "react";
import type { FormEvent } from "react";
import { Edit3, MapPinned, Plus, Trash2 } from "lucide-react";
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

type LocationForm = {
  id?: number;
  city: string;
  pincode: string;
  area: string;
  sameDay: boolean;
  expressMinutes: number;
  midnightDelivery: boolean;
  deliveryFee: string;
  isActive: boolean;
};

const emptyForm: LocationForm = {
  city: "",
  pincode: "",
  area: "",
  sameDay: true,
  expressMinutes: 120,
  midnightDelivery: false,
  deliveryFee: "0.00",
  isActive: true,
};

export default function Locations() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<LocationForm>(emptyForm);
  const utils = trpc.useUtils();
  const { data: locations } = trpc.commerce.listLocations.useQuery();

  const refresh = async () => {
    await utils.commerce.listLocations.invalidate();
  };

  const createLocation = trpc.commerce.createLocation.useMutation({
    onSuccess: async () => {
      toast.success("Location added");
      setOpen(false);
      await refresh();
    },
  });

  const updateLocation = trpc.commerce.updateLocation.useMutation({
    onSuccess: async () => {
      toast.success("Location updated");
      setOpen(false);
      await refresh();
    },
  });

  const deleteLocation = trpc.commerce.deleteLocation.useMutation({
    onSuccess: async () => {
      toast.success("Location deleted");
      await refresh();
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = {
      city: form.city,
      pincode: form.pincode,
      area: form.area,
      sameDay: form.sameDay,
      expressMinutes: Number(form.expressMinutes),
      midnightDelivery: form.midnightDelivery,
      deliveryFee: form.deliveryFee,
      isActive: form.isActive,
    };

    if (form.id) {
      updateLocation.mutate({ id: form.id, ...payload });
    } else {
      createLocation.mutate(payload);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#6B3A3A]">
              Pincode & Location Management
            </h2>
            <p className="text-sm text-[#1A1A1A]/50">
              Control city-wise serviceability, delivery fees, same-day and midnight slots.
            </p>
          </div>
          <Button
            onClick={() => {
              setForm(emptyForm);
              setOpen(true);
            }}
            className="rounded-full bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#6B3A3A]/10 bg-[#F8EDEB]/50 text-left text-[#1A1A1A]/50">
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Pincode</th>
                <th className="px-4 py-3 font-medium">Delivery Rules</th>
                <th className="px-4 py-3 font-medium">Fee</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations?.map((location) => (
                <tr key={location.id} className="border-b border-[#6B3A3A]/5 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#6B3A3A]/10">
                        <MapPinned className="h-5 w-5 text-[#6B3A3A]" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#6B3A3A]">{location.city}</p>
                        <p className="text-xs text-[#1A1A1A]/50">{location.area}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono">{location.pincode}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {location.sameDay && <Badge>Same day</Badge>}
                      {location.midnightDelivery && <Badge>Midnight</Badge>}
                      <Badge>{`${location.expressMinutes} min`}</Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3">&#8377;{Number(location.deliveryFee).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs ${location.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {location.isActive ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setForm(location);
                          setOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteLocation.mutate({ id: location.id })}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="font-display text-[#6B3A3A]">
                {form.id ? "Edit Location" : "Add Location"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City">
                  <input required value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="admin-input" />
                </Field>
                <Field label="Pincode">
                  <input required value={form.pincode} onChange={(event) => setForm({ ...form, pincode: event.target.value })} className="admin-input" />
                </Field>
              </div>
              <Field label="Area">
                <input required value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} className="admin-input" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Express Minutes">
                  <input type="number" value={form.expressMinutes} onChange={(event) => setForm({ ...form, expressMinutes: Number(event.target.value) })} className="admin-input" />
                </Field>
                <Field label="Delivery Fee">
                  <input value={form.deliveryFee} onChange={(event) => setForm({ ...form, deliveryFee: event.target.value })} className="admin-input" />
                </Field>
              </div>
              <div className="flex flex-wrap gap-4">
                <Check label="Same day" checked={form.sameDay} onChange={(checked) => setForm({ ...form, sameDay: checked })} />
                <Check label="Midnight delivery" checked={form.midnightDelivery} onChange={(checked) => setForm({ ...form, midnightDelivery: checked })} />
                <Check label="Active" checked={form.isActive} onChange={(checked) => setForm({ ...form, isActive: checked })} />
              </div>
              <Button className="rounded-full bg-[#6B3A3A] text-white hover:bg-[#6B3A3A]/90">
                Save Location
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

function Badge({ children }: { children: string | number }) {
  return <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">{children}</span>;
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-[#6B3A3A]">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
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
