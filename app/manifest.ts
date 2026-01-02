import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Synapse',
        short_name: 'Synapse',
        description: 'Synapse',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
            {
                src: '/globe.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
            },
            {
                src: '/globe.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
            },
        ],
    }
}