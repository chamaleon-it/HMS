import React from 'react'

export default function Statistics() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<span className="text-xl">👥</span>}
                label="Total"
                value={0}
                tone="bg-violet-100"
              />
              <StatCard
                icon={<span className="text-xl">🩺</span>}
                label="Active"
                value={0}
                tone="bg-green-100"
              />
              <StatCard
                icon={<span className="text-xl">🚨</span>}
                label="Critical"
                value={0}
                tone="bg-red-100"
              />
              <StatCard
                icon={<span className="text-xl">🚪</span>}
                label="Discharged"
                value={0}
                tone="bg-blue-100"
              />
            </div>
  )
}


const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: string;
}> = ({ icon, label, value, tone }) => (
  <div
    className={`flex items-center gap-3 p-4 rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm hover:shadow-md transition-shadow`}
  >
    <div className={`w-10 h-10 rounded-xl grid place-items-center ${tone}`}>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  </div>
);