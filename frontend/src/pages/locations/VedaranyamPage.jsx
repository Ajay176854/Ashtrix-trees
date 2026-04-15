import LocalLandingPage from '@/components/LocalLandingPage'

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Ashtrix Tees Vedaranyam',
  description: 'Shop t-shirts online with delivery to Vedaranyam, Thiruvarur district, Tamil Nadu.',
  url: 'https://ashtrixtees.com/tshirts-vedaranyam',
  telephone: '+91-XXXXXXXXXX',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Vedaranyam Town',
    addressLocality: 'Vedaranyam',
    addressRegion: 'Tamil Nadu',
    postalCode: '614810',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '10.3741',
    longitude: '79.8454',
  },
  areaServed: ['Vedaranyam', 'Thiruvarur District'],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    opens: '09:00',
    closes: '20:00',
  },
}

const CONFIG = {
  town: 'Vedaranyam',
  district: 'Thiruvarur',
  slug: 'tshirts-vedaranyam',
  title: 'T-Shirts Online Vedaranyam | Ashtrix Tees – Tamil Nadu Streetwear',
  description: 'Buy premium streetwear t-shirts online with delivery to Vedaranyam, Tamil Nadu. Oversized, printed & plain tees. COD available. Ashtrix Tees. Starting ₹299.',
  heroHeading: 'STREETWEAR\nNOW REACHING\nVEDARANYAM',
  heroSubtitle: 'Ashtrix Tees – the Tamil Nadu streetwear brand that delivers everywhere. Premium oversized, printed & plain tees delivered to Vedaranyam. Starting ₹299, COD available.',
  collegeNote: 'Every order ships with free returns. Zero risk, premium quality.',
  canonical: '/tshirts-vedaranyam',
  schema: SCHEMA,
}

export default function VedaranyamPage() {
  return <LocalLandingPage config={CONFIG} />
}
