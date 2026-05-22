import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Megaphone, Send, Mail, MessageSquare, Smartphone, Clock } from "lucide-react";
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

const typeIcons: Record<string, React.ElementType> = {
  email: Mail,
  sms: MessageSquare,
  push: Smartphone,
  whatsapp: MessageSquare,
};

const typeColors: Record<string, string> = {
  email: "bg-blue-50 text-blue-600",
  sms: "bg-green-50 text-green-600",
  push: "bg-purple-50 text-purple-600",
  whatsapp: "bg-green-50 text-green-600",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-amber-100 text-amber-600",
  sending: "bg-blue-100 text-blue-600",
  sent: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-600",
};

export default function Campaigns() {
  const { data: campaigns, refetch } = trpc.crm.getRemarketingCampaigns.useQuery({ page: 1, limit: 50 });
  const { data: segments } = trpc.crm.getCustomerSegments.useQuery();

  const [showCreate, setShowCreate] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    segmentId: 0,
    type: "email" as "email" | "sms" | "push" | "whatsapp",
    subject: "",
    content: "",
  });

  const createCampaign = trpc.crm.createCampaign.useMutation({
    onSuccess: () => {
      toast.success("Campaign created successfully");
      setShowCreate(false);
      setNewCampaign({ name: "", segmentId: 0, type: "email", subject: "", content: "" });
      refetch();
    },
  });

  const sendCampaign = trpc.crm.sendCampaign.useMutation({
    onSuccess: () => { toast.success("Campaign sent successfully"); refetch(); },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name) { toast.error("Campaign name is required"); return; }
    createCampaign.mutate({
      name: newCampaign.name,
      segmentId: newCampaign.segmentId || undefined,
      type: newCampaign.type,
      subject: newCampaign.subject || undefined,
      content: newCampaign.content || undefined,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#6B3A3A]">Remarketing Campaigns</h2>
            <p className="text-sm text-[#1A1A1A]/50">Create and manage remarketing campaigns for customer segments</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button className="bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full">
                <Plus className="h-4 w-4 mr-2" /> New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="font-display text-[#6B3A3A]">Create Remarketing Campaign</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div>
                  <label className="block text-sm font-medium text-[#6B3A3A] mb-1.5">Campaign Name *</label>
                  <input type="text" required value={newCampaign.name} onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#6B3A3A]/15 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#6B3A3A]/20 text-sm" placeholder="e.g. Birthday Special Offer" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6B3A3A] mb-1.5">Type</label>
                    <select value={newCampaign.type} onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as typeof newCampaign.type })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#6B3A3A]/15 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#6B3A3A]/20 text-sm">
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#6B3A3A] mb-1.5">Target Segment</label>
                    <select value={newCampaign.segmentId} onChange={(e) => setNewCampaign({ ...newCampaign, segmentId: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#6B3A3A]/15 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#6B3A3A]/20 text-sm">
                      <option value={0}>All Customers</option>
                      {segments?.map((seg) => <option key={seg.id} value={seg.id}>{seg.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B3A3A] mb-1.5">Subject Line</label>
                  <input type="text" value={newCampaign.subject} onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#6B3A3A]/15 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#6B3A3A]/20 text-sm" placeholder="Your exclusive offer awaits..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#6B3A3A] mb-1.5">Content</label>
                  <textarea rows={4} value={newCampaign.content} onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#6B3A3A]/15 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[#6B3A3A]/20 text-sm" placeholder="Write your campaign message..." />
                </div>
                <Button type="submit" disabled={createCampaign.isPending} className="w-full bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full">
                  {createCampaign.isPending ? "Creating..." : "Create Campaign"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {campaigns?.items.map((campaign, i) => {
            const TypeIcon = typeIcons[campaign.type ?? "email"] ?? Mail;
            const typeColor = typeColors[campaign.type ?? "email"] ?? typeColors.email;
            return (
              <motion.div key={campaign.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-white/60 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${typeColor}`}>
                  <TypeIcon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-display text-lg font-semibold text-[#6B3A3A]">{campaign.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${statusColors[campaign.status ?? "draft"]}`}>
                      {campaign.status ?? "draft"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-[#1A1A1A]/50">
                    <span className="capitalize">{campaign.type ?? "email"}</span>
                    {campaign.segmentId && segments && (
                      <span>Target: {segments.find((s) => s.id === campaign.segmentId)?.name ?? "Unknown"}</span>
                    )}
                    {campaign.subject && <span className="truncate max-w-xs">Subject: {campaign.subject}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {campaign.status === "draft" && (
                    <Button size="sm" className="bg-[#6B3A3A] hover:bg-[#6B3A3A]/90 text-white rounded-full" onClick={() => sendCampaign.mutate({ id: campaign.id })} disabled={sendCampaign.isPending}>
                      <Send className="h-3.5 w-3.5 mr-1.5" /> Send
                    </Button>
                  )}
                  {campaign.status === "scheduled" && (
                    <div className="flex items-center gap-1.5 text-sm text-amber-600">
                      <Clock className="h-4 w-4" /> Scheduled
                    </div>
                  )}
                  {campaign.status === "sent" && (
                    <div className="text-right text-xs text-[#1A1A1A]/50">
                      <p>Open: {campaign.openRate ?? 0}%</p>
                      <p>Click: {campaign.clickRate ?? 0}%</p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {(!campaigns || campaigns.items.length === 0) && (
          <div className="text-center py-16 bg-white/60 rounded-2xl">
            <Megaphone className="h-12 w-12 text-[#6B3A3A]/20 mx-auto mb-3" />
            <p className="text-[#6B3A3A] font-medium">No campaigns yet</p>
            <p className="text-sm text-[#1A1A1A]/50">Create your first remarketing campaign to re-engage customers</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
