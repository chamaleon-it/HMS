'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileQuestion, MoveLeft } from 'lucide-react';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 text-center dark:bg-zinc-900">
            <div className="flex flex-col items-center space-y-6">
                <div className="rounded-full bg-blue-100 p-6 dark:bg-blue-900/30">
                    <FileQuestion className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                        Page not found
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Sorry, we couldn&apos;t find the page you&apos;re looking for.
                    </p>
                </div>

                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="gap-2"
                    >
                        <MoveLeft className="h-4 w-4" />
                        Go back
                    </Button>
                    <Button
                        onClick={() => router.push('/')}
                    >
                        Go to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
