import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Palette } from "lucide-react";
import { trpc } from "@/providers/trpc";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Segments() {
  const { data: segments, refetch } = trpc.crm.getCustomerSegments.useQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [newSegment, setNewSegment] = useState({ name: "", description: "", color: "#6B3A3A" });

  const createSegment = trpc.crm.createSegment.useMutation({
    onSuccess: () => {
      toast.success("Segment created successfully");
      setShowCreate(false);
      setNewSegment({ name: "", description: "", color: "#6B3A3A" });
      refetch();
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegment.name) { toast.error("Segment name is required"); return; }
    createSegment.mutate({ name: newSegment.name, description: newSegment.description, criteria: { type: "manual" }, color: newSegment.color });
  };

  const colorOptions = ["#6B3A3A", "#D4A373", "#2D8A4E", "#E85D4A", "#4A7FB5", "#8B5E83", "#C49A3C"];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#6B3A3A]">Customer Segments</h2>
            <p className="text-sm text-[#1A1A1A]/50">Create and manage customer segments for remarketing</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full">
                <Plus className="h-4 w-4 mr-2" /> Create Segment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display text-[#6B3A3A]">New Customer Segment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-[#6B3A3A] mb-1.5">Segment Name *</label>
                  <input type="text" required value={newSegment.name} onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#6B3A3A]/15 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#6B3A3A]/20 text-sm" placeholder="e.g. High Value Customers" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B3A3A] mb-1.5">Description</label>
                  <textarea rows={3} value={newSegment.description} onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#6B3A3A]/15 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#6B3A3A]/20 text-sm" placeholder="Describe this segment..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B3A3A] mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {colorOptions.map((color) => (
                      <button key={color} type="button" onClick={() => setNewSegment({ ...newSegment, color })}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${newSegment.color === color ? "border-[#1A1A1A] scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={createSegment.isPending} className="w-full bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full">
                  {createSegment.isPending ? "Creating..." : "Create Segment"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments?.map((segment, i) => (
            <motion.div key={segment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white/60 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: (segment.color ?? "#6B3A3A") + "20" }}>
                  <Users className="h-6 w-6" style={{ color: segment.color ?? "#6B3A3A" }} />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: (segment.color ?? "#6B3A3A") + "15", color: segment.color ?? "#6B3A3A" }}>
                  {segment.memberCount} members
                </span>
              </div>
              <h3 className="font-display text-lg font-semibold text-[#6B3A3A] mb-1">{segment.name}</h3>
              <p className="text-sm text-[#1A1A1A]/50 mb-4">{segment.description}</p>
              <div className="flex items-center gap-2 text-xs text-[#1A1A1A]/40">
                <Palette className="h-3 w-3" />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color ?? "#6B3A3A" }} />
                <span>{segment.color ?? "#6B3A3A"}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {(!segments || segments.length === 0) && (
          <div className="text-center py-16 bg-white/60 rounded-2xl">
            <Users className="h-12 w-12 text-[#6B3A3A]/20 mx-auto mb-3" />
            <p className="text-[#6B3A3A] font-medium">No segments yet</p>
            <p className="text-sm text-[#1A1A1A]/50">Create your first customer segment to get started</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
