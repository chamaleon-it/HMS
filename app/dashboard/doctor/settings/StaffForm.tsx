import React, { useState } from "react";
import useSWR from "swr";
import api from "@/lib/axios";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Loader2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function StaffForm({ role, title }: { role: string; title: string }) {
  const getEndpoint = () => {
    if (role === 'Lab') return '/technician';
    if (role === 'Pharmacy') return '/pharmacist';
    return `/users/role/${role}`;
  };

  const { data, mutate, isLoading } = useSWR(getEndpoint());
  const staffMembers = data?.data || [];

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  // Form states for Add Staff
  const [addForm, setAddForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    qualification: "",
    licenseNumber: "",
    designation: "",
    consultationFee: 0,
  });

  // Form states for Edit Staff
  const [editForm, setEditForm] = useState({
    status: "Active",
    qualification: "",
    licenseNumber: "",
    designation: "",
    inCharge: false,
    consultationFee: 0,
    availability: {
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      days: [] as string[],
    }
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'Doctor' && addForm.password !== addForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      let endpoint = "/users";
      let payload: any = { ...addForm, role };

      if (role === 'Lab') {
        endpoint = "/technician/register";
        payload = { name: addForm.name, qualification: addForm.qualification, licenseNumber: addForm.licenseNumber, designation: addForm.designation };
      } else if (role === 'Pharmacy') {
        endpoint = "/pharmacist/register";
        payload = { name: addForm.name, qualification: addForm.qualification, licenseNumber: addForm.licenseNumber, designation: addForm.designation };
      }

      await toast.promise(api.post(endpoint, payload), {
        loading: `Adding ${title.toLowerCase()}...`,
        success: `${title} added successfully`,
        error: `Failed to add ${title.toLowerCase()}`,
      });
      mutate();
      setIsAddOpen(false);
      setAddForm({ name: "", username: "", email: "", password: "", confirmPassword: "", qualification: "", licenseNumber: "", designation: "", consultationFee: 0 });
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to add ${title.toLowerCase()}`);
    }
  };

  const openEdit = (staff: any) => {
    setSelectedStaff(staff);
    setEditForm({
      status: staff.status || "Active",
      qualification: staff.qualification || "",
      licenseNumber: staff.licenseNumber || "",
      designation: staff.designation || "",
      inCharge: staff.inCharge || false,
      consultationFee: staff.consultationFee || 0,
      availability: {
        startDate: staff.availability?.startDate?.split("T")[0] || "",
        endDate: staff.availability?.endDate?.split("T")[0] || "",
        startTime: staff.availability?.startTime || "",
        endTime: staff.availability?.endTime || "",
        days: staff.availability?.days || [],
      }
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let endpoint = `/users/${selectedStaff._id}`;
      let payload: any = editForm;

      if (role === 'Lab') {
        endpoint = `/technician/${selectedStaff._id}`;
        payload = { qualification: editForm.qualification, licenseNumber: editForm.licenseNumber, designation: editForm.designation };
      } else if (role === 'Pharmacy') {
        endpoint = `/pharmacist/${selectedStaff._id}`;
        payload = { qualification: editForm.qualification, licenseNumber: editForm.licenseNumber, designation: editForm.designation };
      }

      await toast.promise(api.patch(endpoint, payload), {
        loading: `Updating ${title.toLowerCase()}...`,
        success: `${title} updated successfully`,
        error: `Failed to update ${title.toLowerCase()}`,
      });
      mutate();
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to update ${title.toLowerCase()}`);
    }
  };

  const toggleDay = (day: string) => {
    setEditForm(prev => {
      const days = prev.availability.days;
      return {
        ...prev,
        availability: {
          ...prev.availability,
          days: days.includes(day) ? days.filter(d => d !== day) : [...days, day]
        }
      };
    });
  };

  const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">{title} List</h2>
          <p className="text-sm text-gray-500">Manage {title.toLowerCase()}s, their availability, and statuses.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-(--color-synapse-light) hover:bg-(--color-synapse-purple)">
          <Plus className="w-4 h-4 mr-2" /> Add {title}
        </Button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-(--color-synapse-dark)">
            <TableRow className="hover:bg-(--color-synapse-dark)">
              <TableHead className="text-white uppercase text-xs font-bold w-1/5 py-4 rounded-tl-xl">Name</TableHead>
              {role === 'Doctor' ? (
                <>
                  <TableHead className="text-white uppercase text-xs font-bold w-1/5 py-4">Email</TableHead>
                  <TableHead className="text-white uppercase text-xs font-bold w-1/5 py-4">Specialization</TableHead>
                  <TableHead className="text-white uppercase text-xs font-bold w-1/5 py-4">Status</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="text-white uppercase text-xs font-bold w-1/5 py-4">Qualification</TableHead>
                  <TableHead className="text-white uppercase text-xs font-bold w-1/5 py-4">License No.</TableHead>
                  <TableHead className="text-white uppercase text-xs font-bold w-1/5 py-4">Designation</TableHead>
                </>
              )}
              <TableHead className="text-white uppercase text-xs font-bold text-right py-4 rounded-tr-xl">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                </TableCell>
              </TableRow>
            ) : staffMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                  No {title.toLowerCase()}s found.
                </TableCell>
              </TableRow>
            ) : (
              staffMembers.map((staff: any) => (
                <TableRow key={staff._id} className="hover:bg-gray-50 border-gray-100">
                  <TableCell className="font-medium text-gray-900 py-4 pl-4 flex items-center gap-2">
                    {role === 'Doctor' ? `Dr. ${staff.name}` : staff.name}
                    {role === 'Doctor' && staff.status === 'Active' && <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></div>}
                    {role !== 'Doctor' && staff.inCharge && <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 border border-emerald-500 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></div>}
                  </TableCell>

                  {role === 'Doctor' ? (
                    <>
                      <TableCell className="text-gray-500">{staff.email}</TableCell>
                      <TableCell className="text-gray-500">{staff.specialization || "General"}</TableCell>
                      <TableCell>
                        <Badge className={staff.status === 'Active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none' : 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-none'}>
                          {staff.status || 'Active'}
                        </Badge>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-gray-500">{staff.qualification || <span className="italic opacity-50">Not set</span>}</TableCell>
                      <TableCell className="text-gray-500">{staff.licenseNumber || <span className="italic opacity-50">Not set</span>}</TableCell>
                      <TableCell className="text-gray-500">{staff.designation || <span className="italic opacity-50">Not set</span>}</TableCell>
                    </>
                  )}

                  <TableCell className="text-right py-4 pr-4">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(staff)} className="text-gray-400 hover:text-gray-700">
                      <span className="sr-only">Actions</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New {title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} placeholder="John Doe" />
              </div>

              {role === 'Doctor' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" required value={addForm.username} onChange={e => setAddForm({ ...addForm, username: e.target.value })} placeholder="dr_johndoe" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} placeholder="john@example.com" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="consultationFee">Consultation Fee</Label>
                    <Input id="consultationFee" type="number" min="0" required value={addForm.consultationFee} onChange={e => setAddForm({ ...addForm, consultationFee: Number(e.target.value) })} placeholder="e.g. 500" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" required value={addForm.confirmPassword} onChange={e => setAddForm({ ...addForm, confirmPassword: e.target.value })} />
                  </div>
                </>
              )}

              {role !== 'Doctor' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="qualification">Qualification (e.g. MLT, B.Pharm)</Label>
                    <Input id="qualification" value={addForm.qualification} onChange={e => setAddForm({ ...addForm, qualification: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="licenseNumber">License No.</Label>
                    <Input id="licenseNumber" value={addForm.licenseNumber} onChange={e => setAddForm({ ...addForm, licenseNumber: e.target.value })} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="designation">Designation (e.g. Chief Technician)</Label>
                    <Input id="designation" value={addForm.designation} onChange={e => setAddForm({ ...addForm, designation: e.target.value })} />
                  </div>
                </>
              )}
            </div>
            <Button type="submit" className="w-full bg-(--color-synapse-light) hover:bg-(--color-synapse-purple)">
              Create {title} Account
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage {role === 'Doctor' ? `Dr. ${selectedStaff?.name}` : selectedStaff?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-6 mt-4">
            <div className="space-y-4">
              {role === 'Doctor' && (
                <>
                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Consultation Fee</Label>
                    <Input type="number" min="0" value={editForm.consultationFee} onChange={e => setEditForm({ ...editForm, consultationFee: Number(e.target.value) })} placeholder="e.g. 500" />
                  </div>
                </>
              )}

              {role !== 'Doctor' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Qualification</Label>
                    <Input value={editForm.qualification} onChange={e => setEditForm({ ...editForm, qualification: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>License No.</Label>
                    <Input value={editForm.licenseNumber} onChange={e => setEditForm({ ...editForm, licenseNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Designation</Label>
                    <Input value={editForm.designation} onChange={e => setEditForm({ ...editForm, designation: e.target.value })} />
                  </div>
                </div>
              )}

              {role === 'Doctor' && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold mb-4">Availability & Leaves</h4>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Start Date (Valid from)</Label>
                      <Input type="date" value={editForm.availability.startDate} onChange={e => setEditForm({ ...editForm, availability: { ...editForm.availability, startDate: e.target.value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date (Valid until)</Label>
                      <Input type="date" value={editForm.availability.endDate} onChange={e => setEditForm({ ...editForm, availability: { ...editForm.availability, endDate: e.target.value } })} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input type="time" value={editForm.availability.startTime} onChange={e => setEditForm({ ...editForm, availability: { ...editForm.availability, startTime: e.target.value } })} />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input type="time" value={editForm.availability.endTime} onChange={e => setEditForm({ ...editForm, availability: { ...editForm.availability, endTime: e.target.value } })} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Working Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {weekDays.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${editForm.availability.days.includes(day)
                            ? 'bg-(--color-synapse-light) text-white border-transparent'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Deselect a day to mark it as leave/off-day.</p>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-(--color-synapse-light) hover:bg-(--color-synapse-purple)">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
