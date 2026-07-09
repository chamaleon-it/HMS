import AppShell from "@/components/layout/app-shell";
import AdminHeader from "../components/AdminHeader";

export default function LaboratoryPage() {
    return (
        <AppShell>
            <div className="p-6">
                <AdminHeader
                    title="Laboratory"
                    subtitle="Manage laboratory and view related information."
                />
                {/* Content goes here */}
            </div>
        </AppShell>
    );
}
