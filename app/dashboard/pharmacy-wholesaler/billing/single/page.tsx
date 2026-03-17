"use client";

import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { fDate, fDateandTime } from "@/lib/fDateAndTime";
import { formatINR } from "@/lib/fNumber";
import { Download, Printer } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import useSWR from "swr";
function InvoiceViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

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
      online: number;
      insurance: number;
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
        <div className="flex justify-between items-center bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-6 border-b">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold">Synapse HMS</h2>
          </div>
          <div className="flex space-x-12 text-sm">
            <div>
              <p className="text-xs opacity-80">Invoice Number</p>
              <p className="font-medium">{billing?.mrn}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Issued</p>
              <p className="font-medium">{fDateandTime(billing?.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Due Date</p>
              <p>
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
              <p className="text-xs opacity-80">Due Amount</p>
              <p className="font-medium text-red-200">
                {formatINR(
                  (() => {
                    const items = billing?.items ?? [];
                    const totalItems = items.reduce(
                      (sum, it) => sum + (it?.total ?? 0),
                      0
                    );
                    const paid =
                      (billing?.cash ?? 0) +
                      (billing?.online ?? 0) +
                      (billing?.insurance ?? 0);
                    return Math.max(0, totalItems - paid);
                  })()
                )}
              </p>
            </div>
            <div>
              <p className="text-xs opacity-80">Payment Status</p>
              <p className="font-medium text-white">
                {(() => {
                  const total = (billing?.items ?? []).reduce(
                    (sum, it) => sum + (it?.total ?? 0),
                    0
                  );
                  const paid =
                    (billing?.cash ?? 0) +
                    (billing?.online ?? 0) +
                    (billing?.insurance ?? 0);

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
              <p className="font-semibold text-gray-800">Mark Hospital</p>
              <p>contact@synapsehms.com</p>
              <p className="mt-1">Pothukallu, Nilambur, Kerala</p>
              <p>+91 98765 43210</p>
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
            <thead className="bg-gradient-to-r from-gray-100 to-gray-200 border-b">
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
                      acc +total,
                    0
                  ) ?? 0
                )}
              </span>
            </div>
            <div className="flex justify-between py-1 text-sm text-green-700">
              <span>Paid</span> <span>{formatINR((billing?.cash ?? 0) + (billing?.online ?? 0) + (billing?.insurance ?? 0))}</span>
            </div>
            <div className="flex justify-between py-1 text-sm text-red-600">
              <span>Due</span> <span>{formatINR(
                  (billing?.items?.reduce(
                    (acc, { total }) =>
                      acc +total,
                    0
                  ) ?? 0) - ((billing?.cash ?? 0) + (billing?.online ?? 0) + (billing?.insurance ?? 0))
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
        <div className="relative text-center text-xs text-gray-500 py-6 bg-gradient-to-r from-gray-50 to-gray-100">
          <p>
            Mark Hospital, Pothukallu, Nilambur, Kerala | GSTIN: 32ABCDE1234F1Z5
            | Contact: +91 98765 43210
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
            style={{ backgroundImage: "url(/mark-hospital-logo.png)" }}
          ></div>
        </div>
      </div>
    </AppShell>
  );
}

export default function InvoiceView() {
  return (
    <Suspense fallback={
      <AppShell>
        <div className="relative bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden m-5 p-8 flex justify-center">
          <p>Loading...</p>
        </div>
      </AppShell>
    }>
      <InvoiceViewContent />
    </Suspense>
  );
}
