"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import axiosInstance from '@/lib/axios';
import ConsultationRoom from '@/components/consultation/ConsultationRoom';
import { Loader2 } from 'lucide-react';

const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);

function ConsultationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const consultationId = searchParams.get('id');
  const [userName, setUserName] = useState<string>('User');

  const { data, error, isLoading } = useSWR(
    consultationId ? `/consultations/${consultationId}` : null,
    fetcher
  );

  useEffect(() => {
    // Attempt to fetch current user's name from localStorage or auth context if available
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.name) {
          setUserName(parsed.name);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleEndConsultation = async () => {
    if (!consultationId) {
      router.back();
      return;
    }
    try {
      await axiosInstance.patch(`/consultations/${consultationId}/end`);
      router.back();
    } catch (err) {
      console.error('Failed to end consultation', err);
      router.back();
    }
  };

  if (!consultationId) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-semibold text-red-600">Error</h2>
        <p className="mt-2 text-gray-600">Invalid Consultation ID.</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 rounded-md bg-primary px-4 py-2 text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Joining Consultation...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100">
        <h2 className="text-2xl font-semibold text-red-600">Error</h2>
        <p className="mt-2 text-gray-600">Could not load consultation. Unauthorized or Invalid Room.</p>
        <button 
          onClick={() => router.back()}
          className="mt-4 rounded-md bg-[var(--color-cosmo-dark)] px-4 py-2 text-white"
        >
          Go Back
        </button>
      </div>
    );
  }

  const consultation = data.data;

  return (
    <ConsultationRoom
      roomId={consultation.roomId}
      meetingUrl={consultation.meetingUrl}
      userName={userName}
      onEndConsultation={handleEndConsultation}
    />
  );
}

export default function ConsultationPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <ConsultationContent />
    </Suspense>
  );
}
