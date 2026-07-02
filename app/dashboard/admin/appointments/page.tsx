import AppShell from "@/components/layout/app-shell";
import AdminHeader from "../components/AdminHeader";

export default function AppointmentsPage() {
    return (
        <AppShell>
            <div className="p-6">
                <AdminHeader
                    title="Appointments"
                    subtitle="Manage appointments and view related information."
                />
                {/* Content goes here */}
            </div>
        </AppShell>
    );
}
