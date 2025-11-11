import AppShell from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Download, Printer } from "lucide-react";
export default function InvoiceView() {
  return (
    <AppShell>
      <div className="relative bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden m-5">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-6 border-b">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold">Mark Hospital</h2>
          </div>
          <div className="flex space-x-12 text-sm">
            <div>
              <p className="text-xs opacity-80">Invoice Number</p>
              <p className="font-medium">INV-2025-00921</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Issued</p>
              <p className="font-medium">17/10/2025</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Due Date</p>
              <p className="font-medium">25/10/2025</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Due Amount</p>
              <p className="font-medium text-red-200">₹0.00</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Payment Status</p>
              <p className="font-medium text-green-300">Paid</p>
            </div>
          </div>
        </div>
        {/* Clinic & Patient Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-x divide-gray-100">
          <div className="p-8">
            <h3 className="text-sm text-gray-500 mb-2">Clinic Details</h3>
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-800">Mark Hospital</p>
              <p>contact@markhospital.in</p>
              <p className="mt-1">Pothukallu, Nilambur, Kerala</p>
              <p>+91 98765 43210</p>
              <p className="mt-1">Booking No: BK2025-00921</p>
              <p className="mt-1 text-gray-500 text-xs">
                GSTIN: 32ABCDE1234F1Z5
              </p>
            </div>
          </div>
          <div className="p-8">
            <h3 className="text-sm text-gray-500 mb-2">Patient Details</h3>
            <div className="text-sm text-gray-700">
              <p className="font-semibold text-gray-800">John Mathew</p>
              <p>+91 988xxxx34</p> <p className="mt-1">Patient ID: PT-002134</p>
              <p className="mt-1 text-gray-500 text-xs">
                Attending: Dr. John Honai (General Medicine)
              </p>
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
                  Price
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
              <tr className="border-b hover:bg-gray-50 transition">
                <td className="p-4">Consultation</td>
                <td className="text-right p-4">1</td>
                <td className="text-right p-4">₹500.00</td>
                <td className="text-right p-4">0%</td>
                <td className="text-right p-4">₹500.00</td>
              </tr>
              <tr className="border-b hover:bg-gray-50 transition">
                <td className="p-4">CBC Lab Test</td>
                <td className="text-right p-4">1</td>
                <td className="text-right p-4">₹350.00</td>
                <td className="text-right p-4">5%</td>
                <td className="text-right p-4">₹367.50</td>
              </tr>
              <tr className="hover:bg-gray-50 transition">
                <td className="p-4">X-Ray Chest PA</td>
                <td className="text-right p-4">1</td>
                <td className="text-right p-4">₹800.00</td>
                <td className="text-right p-4">12%</td>
                <td className="text-right p-4">₹896.00</td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Totals */}
        <div className="flex justify-end p-8">
          <div className="w-full md:w-1/2 text-sm text-gray-700">
            <div className="flex justify-between py-1">
              <span>Subtotal</span> <span>₹1,650.00</span>
            </div>
            <div className="flex justify-between py-1">
              <span>GST</span> <span>₹113.50</span>
            </div>
            <div className="flex justify-between py-2 font-semibold text-gray-900 border-t mt-2 pt-2">
              <span>Total</span> <span>₹1,763.50</span>
            </div>
            <div className="flex justify-between py-1 text-sm text-green-700">
              <span>Paid</span> <span>₹1,763.50</span>
            </div>
            <div className="flex justify-between py-1 text-sm text-red-600">
              <span>Due</span> <span>₹0.00</span>
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
          <div className="text-right">
            <Button variant="outline" size="sm" className="mr-2">
              <Printer className="w-4 h-4 mr-1" /> Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-1" /> PDF
            </Button>
          </div>
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
