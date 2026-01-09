import Content from './Content'


export async function generateStaticParams() {
    return [
        { id: '1' },
        { id: '2' },
        { id: '3' },
    ]
}

export default function page({ params }: { params: { id: string } }) {
    return (
        <Content id={params.id} />

    )
}
