import AppShell from "@/components/layout/app-shell";
import AdminHeader from "../components/AdminHeader";

export default function PharmacyPage() {
    return (
        <AppShell>
            <div className="p-6">
                <AdminHeader
                    title="Pharmacy"
                    subtitle="Manage pharmacy and view related information."
                />
                {/* Content goes here */}
            </div>
        </AppShell>
    );
}
