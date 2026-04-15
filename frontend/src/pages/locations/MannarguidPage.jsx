import LocalLandingPage from '@/components/LocalLandingPage'

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Ashtrix Tees Mannargudi',
  description: 'Premium oversized & printed t-shirts delivered to Mannargudi. COD available.',
  url: 'https://ashtrixtees.com/tshirts-delivery-mannargudi',
  telephone: '+91-XXXXXXXXXX',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Mannargudi Town',
    addressLocality: 'Mannargudi',
    addressRegion: 'Tamil Nadu',
    postalCode: '614001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '10.6631',
    longitude: '79.4396',
  },
  areaServed: ['Mannargudi', 'Thiruvarur District'],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    opens: '09:00',
    closes: '20:00',
  },
}

const CONFIG = {
  town: 'Mannargudi',
  district: 'Thiruvarur',
  slug: 'tshirts-delivery-mannargudi',
  title: 'Best Printed Tees in Mannargudi | Ashtrix Tees – Premium Quality',
  description: 'Buy premium oversized & printed t-shirts online with delivery to Mannargudi. COD available. 240 GSM cotton. Ashtrix Tees – Tamil Nadu streetwear. Starting ₹299.',
  heroHeading: 'FRESH FITS\nDELIVERED TO\nMANNARGUDI',
  heroSubtitle: 'Ashtrix Tees ships directly to Mannargudi. Premium streetwear tees starting ₹299. COD available, no prep needed. Oversized, printed, plain & more.',
  collegeNote: 'Trusted by students from Rajah Serfoji Govt. College, Mannargudi and nearby institutions.',
  canonical: '/tshirts-delivery-mannargudi',
  schema: SCHEMA,
}

export default function MannarguidPage() {
  return <LocalLandingPage config={CONFIG} />
}
