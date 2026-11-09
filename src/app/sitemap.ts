import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://keys-nusuk.vercel.app';
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 1.0,
      alternates: {
        languages: {
          en: `${baseUrl}?lang=en`,
          ar: `${baseUrl}?lang=ar`,
        },
      },
    },
    {
      url: `${baseUrl}/llms.txt`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];
}
