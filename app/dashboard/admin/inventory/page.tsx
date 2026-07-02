import AppShell from "@/components/layout/app-shell";
import AdminHeader from "../components/AdminHeader";

export default function InventoryPage() {
    return (
        <AppShell>
            <div className="p-6">
                <AdminHeader
                    title="Inventory"
                    subtitle="Manage inventory and view related information."
                />
                {/* Content goes here */}
            </div>
        </AppShell>
    );
}
