import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import React from 'react'
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { ProfileType } from './interface';

export default function TestCatalogue(
  {
    
  }: {
    profile?: ProfileType;
    profileMutate: () => void;
  }
) {
  return (
     <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardContent>
              <SectionHeader
                title="Master test catalogue"
                description="Manage all individual tests, panels and profiles."
                emoji="🧬"
              />
              <div className="space-y-5 text-sm">
                <p className="text-[12px] text-slate-500">
                  All tests configured here are available across OP, IP and external lab
                  orders.
                </p>
              </div>
              </CardContent>
            </Card>

            <Card>
                <CardContent>
              <SectionHeader
                title="Panels & profiles"
                description="Group common tests together for quick ordering."
                emoji="📦"
              />
              <div className="space-y-4 text-sm">
                <FieldRow
                  label="Show profiles on patient bill"
                  description="Show only profile name instead of individual tests."
                >
                  <Switch defaultChecked />
                </FieldRow>
                <FieldRow
                  label="Allow editing panel composition"
                  description="Permit lab admin to add/remove tests from predefined panels."
                >
                  <Switch defaultChecked />
                </FieldRow>
              </div>
              <div className="flex justify-end mt-5">
            <Button className="bg-emerald-700 hover:bg-emerald-700 text-white"><Save className="h-4 w-4" /> Save Settings</Button>
          </div>
              </CardContent>
            </Card>
          </div>
  )
}



const SectionHeader = ({
  title,
  description,
  emoji,
}: {
  title: string;
  description: string;
  emoji: string;
}) => (
  <div className="flex items-start gap-3 mb-4">
    <div className="mt-1 rounded-2xl bg-cyan-50 p-2 flex items-center justify-center">
      <span className="text-lg">{emoji || "🧪"}</span>
    </div>
    <div>
      <h3 className="text-base font-semibold tracking-tight text-slate-900">
        {title}
      </h3>
      <p className="text-xs text-slate-500 leading-snug">{description}</p>
    </div>
  </div>
);


 const FieldRow = ({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[13px] md:text-sm font-medium text-slate-800">
          {label}
        </p>
        {description && (
          <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-1 max-w-sm flex justify-end">{children}</div>
    </div>
    <div className="mt-1 h-px bg-slate-200" />
  </div>
);