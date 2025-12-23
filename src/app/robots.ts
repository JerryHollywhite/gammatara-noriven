import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gammatara.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/modules/'], // Protect private routes from indexing
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
