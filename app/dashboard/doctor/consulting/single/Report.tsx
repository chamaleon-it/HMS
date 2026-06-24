import React from 'react'
import useGetLabReport from './useGetLabReport'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { fDate } from '@/lib/fDateAndTime'

export default function Report({ patientId }: { patientId: string }) {
    const { data } = useGetLabReport({ patientId })

    return (

        <div className="space-y-3">

            {data?.length === 0 ? <div className="flex flex-col items-center justify-center p-8 text-center  rounded-xl shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-700 mb-1">
                    No Results Found
                </h2>
            </div> :
                <Table className='rounded-2xl overflow-hidden'>
                    <TableHeader>
                        <TableRow className='bg-slate-700 hover:bg-slate-700'>
                            <TableHead className='text-white'>SL</TableHead>
                            <TableHead className='text-white'>Date</TableHead>
                            <TableHead className='text-white'>Test</TableHead>
                            <TableHead className='text-white'>Value</TableHead>
                            <TableHead className='text-white'>Reference</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {
                            data?.map((lab, index) => (
                                <TableRow key={lab._id}>
                                    <TableCell>{String(index + 1).padStart(2, '0')}</TableCell>
                                    <TableCell>
                                        {fDate(lab.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">

                                            {lab?.name?.map((e) => (
                                                <div key={e._id} className="flex items-center gap-1 h-5 font-medium text-sm">
                                                    {e.name}
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">

                                            {lab?.name?.map(
                                                (e) => (
                                                    <span
                                                        key={e._id}
                                                        className="text-gray-600 font-mono h-5"
                                                    >
                                                        {e.value ? <>
                                                            {e.type === "Imaging" ? <a
                                                                href={e?.value?.toString()}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center px-2 py-0.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                                                            >
                                                                View Result
                                                            </a> : `${e.value} ${e.unit}`}
                                                        </> : "-"}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        <div className="flex flex-col gap-2">

                                            {lab?.name?.map(
                                                (e) => (
                                                    <span
                                                        key={e._id}
                                                        className="text-gray-600 font-mono h-5"
                                                    >{`${e?.min ?? ""} - ${e?.max ?? ""} ${e?.min ? e.unit : ""}`}</span>
                                                )
                                            )}
                                        </div>
                                    </TableCell>




                                </TableRow>
                            ))
                        }
                    </TableBody>

                </Table>
            }
        </div>
    )
}
