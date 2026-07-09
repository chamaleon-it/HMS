import React from "react";
import IPDetailsClient from "./client";

export function generateStaticParams() {
  return [];
}

export default function IPDetailsPage({ params }: { params: { id: string } }) {
  return <IPDetailsClient id={params.id} />;
}
