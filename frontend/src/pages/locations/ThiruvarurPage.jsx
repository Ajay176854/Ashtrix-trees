import LocalLandingPage from '@/components/LocalLandingPage'

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Ashtrix Tees Thiruvarur',
  description: 'Shop premium oversized, printed & plain t-shirts. Free delivery to Thiruvarur district, Tamil Nadu. COD available. Starting ₹299.',
  url: 'https://ashtrixtees.com/tshirts-in-thiruvarur',
  telephone: '+91-XXXXXXXXXX',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Main Road',
    addressLocality: 'Thiruvarur',
    addressRegion: 'Tamil Nadu',
    postalCode: '610001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '10.7661',
    longitude: '79.6344',
  },
  areaServed: ['Thiruvarur', 'Thiruvarur District'],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    opens: '09:00',
    closes: '20:00',
  },
}

const CONFIG = {
  town: 'Thiruvarur',
  district: 'Thiruvarur',
  slug: 'tshirts-in-thiruvarur',
  title: 'Best Oversized T-Shirts in Thiruvarur | Ashtrix Tees – 240 GSM Cotton, Free Delivery',
  description: 'Shop premium oversized, printed & plain t-shirts online. Free delivery to Thiruvarur district, Tamil Nadu. COD available. 240 GSM cotton. Starting ₹299.',
  heroHeading: 'TEES\nDELIVERED\nTO THIRUVARUR',
  heroSubtitle: 'Ashtrix Tees – Tamil Nadu\'s own streetwear brand. Premium 240 GSM oversized, printed & plain tees starting at ₹299. Free delivery to Thiruvarur district. COD available.',
  collegeNote: 'Popular with students from Thiruvarur Engineering College, Govt Arts College & more.',
  canonical: '/tshirts-in-thiruvarur',
  schema: SCHEMA,
}

export default function ThiruvarurPage() {
  return <LocalLandingPage config={CONFIG} />
}
