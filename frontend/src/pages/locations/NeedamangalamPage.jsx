import LocalLandingPage from '@/components/LocalLandingPage'

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Ashtrix Tees Needamangalam',
  description: 'Buy affordable t-shirts online with delivery to Needamangalam, Tamil Nadu. COD available.',
  url: 'https://ashtrixtees.com/buy-tshirts-needamangalam',
  telephone: '+91-XXXXXXXXXX',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Needamangalam Junction',
    addressLocality: 'Needamangalam',
    addressRegion: 'Tamil Nadu',
    postalCode: '614404',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '10.7631',
    longitude: '79.4042',
  },
  areaServed: ['Needamangalam', 'Thiruvarur District'],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    opens: '09:00',
    closes: '20:00',
  },
}

const CONFIG = {
  town: 'Needamangalam',
  district: 'Thiruvarur',
  slug: 'buy-tshirts-needamangalam',
  title: 'Buy T-Shirts in Needamangalam Online | Ashtrix Tees – Best Value',
  description: 'Shop premium oversized & printed t-shirts with delivery to Needamangalam. COD available. Zero prepayment risk. Ashtrix Tees. Starting ₹299.',
  heroHeading: 'PREMIUM TEES\nSHIPPED TO\nNEEDAMANGALAM',
  heroSubtitle: 'No local store? No problem. Ashtrix Tees delivers premium 240 GSM tees right to Needamangalam. COD available, easy returns, free shipping above ₹499.',
  collegeNote: 'Order now and receive in 3–6 business days. We\'ve delivered to 50+ customers in Thiruvarur district.',
  canonical: '/buy-tshirts-needamangalam',
  schema: SCHEMA,
}

export default function NeedamangalamPage() {
  return <LocalLandingPage config={CONFIG} />
}
