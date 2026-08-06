"use client";

import AppShell from "@/components/layout/app-shell";
import { Separator } from "@/components/ui/separator";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import useSWR from "swr";
import configuration from "@/config/configuration";
import HospitalName from "@/components/print/HospitalName";
export default function InvoiceView({ id }: { id: string }) {

  const { data: billingData } = useSWR<{
    message: string;
    data: {
      _id: string;
      user: string;
      patient: {
        _id: string;
        name: string;
        phoneNumber: string;
        email: string;
        gender: string;
        dateOfBirth: Date;
        conditions: string[];
        allergies: string;
        notes: string;
        createdBy: string;
        status: string;
        mrn: string;
        createdAt: string;
        updatedAt: string;
      };
      items: {
        name: string;
        quantity: number;
        unitPrice: number;
        gst: number;
        discount: number;
        total: number;
      }[];
      cash: number;
      card: number;
      upi: number;
      mrn: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }>(`/billing/${id}`);

  const billing = billingData?.data;

  return (
    <AppShell>
      <div className="relative bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden m-5">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white text-slate-900 px-8 py-6 border-b border-slate-200">
          <HospitalName />
          <div className="flex space-x-12 text-sm text-slate-700">
            <div>
              <p className="text-xs text-slate-500">Invoice Number</p>
              <p className="font-medium text-slate-900">{billing?.mrn}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Issued</p>
              <p className="font-medium text-slate-900">{fDateandTime(billing?.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Due Date</p>
              <p className="text-slate-900">
                {billing?.createdAt
                  ? fDate(
                    new Date(
                      new Date(billing.createdAt).getTime() +
                      10 * 24 * 60 * 60 * 1000
                    )
                  )
                  : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Due Amount</p>
              <p className="font-medium text-rose-600">
                {formatINR(
                  (() => {
                    const items = billing?.items ?? [];
                    const totalItems = items.reduce(
                      (sum, it) => sum + (it?.total ?? 0),
                      0
                    );
                    const paid =
                      (billing?.cash ?? 0) +
                      (billing?.card ?? 0) +
                      (billing?.upi ?? 0);
                    return Math.max(0, totalItems - paid);
                  })()
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Payment Status</p>
              <p className="font-semibold text-slate-900">
                {(() => {
                  const total = (billing?.items ?? []).reduce(
                    (sum, it) => sum + (it?.total ?? 0),
                    0
                  );
                  const paid =
                    (billing?.cash ?? 0) +
                    (billing?.card ?? 0) +
                    (billing?.upi ?? 0);

                  if (total <= paid) return "Paid";
                  if (paid === 0) return "Unpaid";
                  return "Partial";
                })()}
              </p>
            </div>
          </div>
        </div>
        {/* Clinic & Patient Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-gray-100">
          <div className="p-8">
            <h3 className="text-sm text-gray-500 mb-2">Clinic Details</h3>
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-800">{configuration().hospitalName}</p>
              <p>{configuration().hospitalEmail}</p>
              <p className="mt-1">{configuration().hospitalAddress}</p>
              <p>{configuration().hospitalPhone}</p>
              <p className="mt-1">Booking No: BK2025-00921</p>

            </div>
          </div>
          <div className="p-8">
            <h3 className="text-sm text-gray-500 mb-2">Patient Details</h3>
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-800">
                {billing?.patient.name}
              </p>
              <p>{billing?.patient.phoneNumber}</p>{" "}
              <p className="mt-1">Patient ID: PT-002134</p>
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="overflow-hidden border-t border-gray-100">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-linear-to-r from-gray-100 to-gray-200 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">
                  Description
                </th>
                <th className="text-right p-4 font-semibold text-gray-700">
                  Qty
                </th>
                <th className="text-right p-4 font-semibold text-gray-700">
                  Unit Price
                </th>
                <th className="text-right p-4 font-semibold text-gray-700">
                  Discount
                </th>

                <th className="text-right p-4 font-semibold text-gray-700">
                  GST%
                </th>
                <th className="text-right p-4 font-semibold text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {billing?.items.map((item) => {
                return (
                  <tr className="border-b hover:bg-gray-50 transition" key={item.name}>
                    <td className="p-4">{item.name}</td>
                    <td className="text-right p-4">{item.quantity}</td>
                    <td className="text-right p-4">
                      {formatINR(item.unitPrice)}
                    </td>
                    <td className="text-right p-4">
                      {formatINR(item.discount)}
                    </td>
                    <td className="text-right p-4">{item.gst}%</td>
                    <td className="text-right p-4">{formatINR(item.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Totals */}
        <div className="flex justify-end p-8">
          <div className="w-full md:w-1/2 text-sm text-gray-700">
            <div className="flex justify-between py-1">
              <span>Subtotal</span>{" "}
              <span>
                {formatINR(
                  billing?.items.reduce(
                    (sum, item) =>
                      sum + (item.quantity * item.unitPrice - item.discount),
                    0
                  ) ?? 0
                )}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span>GST</span>{" "}
              <span>
                {formatINR(
                  billing?.items?.reduce(
                    (totalGst, { quantity, unitPrice, discount, gst }) =>
                      totalGst +
                      ((quantity * unitPrice - discount) * gst) / 100,
                    0
                  ) ?? 0
                )}
              </span>
            </div>
            <div className="flex justify-between py-2 font-semibold text-gray-900 border-t mt-2 pt-2">
              <span>Total</span> <span>
                {formatINR(
                  billing?.items?.reduce(
                    (acc, { total }) =>
                      acc + total,
                    0
                  ) ?? 0
                )}
              </span>
            </div>
            <div className="flex justify-between py-1 text-sm text-green-700">
              <span>Paid</span> <span>{formatINR((billing?.cash ?? 0) + (billing?.card ?? 0) + (billing?.upi ?? 0))}</span>
            </div>
            <div className="flex justify-between py-1 text-sm text-red-600">
              <span>Due</span> <span>{formatINR(
                (billing?.items?.reduce(
                  (acc, { total }) =>
                    acc + total,
                  0
                ) ?? 0) - ((billing?.cash ?? 0) + (billing?.card ?? 0) + (billing?.upi ?? 0))
              )}</span>
            </div>
          </div>
        </div>
        {/* Signature */}
        <div className="flex justify-between items-center text-sm text-gray-600 px-8 pb-8">
          <div>
            <p>
              <strong>Authorized Signatory</strong>
            </p>
            <div className="h-10 mt-4 border-b border-gray-400 w-48"></div>
          </div>
          {/* <div className="text-right">
            <Button variant="outline" size="sm" className="mr-2">
              <Printer className="w-4 h-4 mr-1" /> Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
          </div> */}
        </div>
        <Separator /> {/* Footer */}
        <div className="relative text-center text-xs text-slate-500 py-6 bg-white border-t border-slate-200">
          <p>
            {configuration().hospitalAddress}
            | Contact: {configuration().hospitalPhone}
          </p>
          <p>
            All prices are inclusive of GST as per Government of India norms.
          </p>
          <p className="italic">
            This is a computer-generated invoice and does not require a
            signature.
          </p>
          <div
            className="absolute inset-0 opacity-5 bg-center bg-no-repeat bg-contain"
            style={{ backgroundImage: `url(${configuration().logo})` }}
          ></div>
        </div>
      </div>
    </AppShell>
  );
}
