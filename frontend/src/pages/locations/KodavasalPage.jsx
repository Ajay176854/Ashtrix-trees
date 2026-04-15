import LocalLandingPage from '@/components/LocalLandingPage'

const SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ClothingStore',
  name: 'Ashtrix Tees Kodavasal',
  description: 'Order premium t-shirts online with delivery to Kodavasal, Tamil Nadu.',
  url: 'https://ashtrixtees.com/tshirts-kodavasal',
  telephone: '+91-XXXXXXXXXX',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Kodavasal Town',
    addressLocality: 'Kodavasal',
    addressRegion: 'Tamil Nadu',
    postalCode: '612601',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '10.8710',
    longitude: '79.4752',
  },
  areaServed: ['Kodavasal', 'Thiruvarur District'],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    opens: '09:00',
    closes: '20:00',
  },
}

const CONFIG = {
  town: 'Kodavasal',
  district: 'Thiruvarur',
  slug: 'tshirts-kodavasal',
  title: 'Online T-Shirt Delivery in Kodavasal | Ashtrix Tees – Best Value',
  description: 'Order premium t-shirts online with delivery to Kodavasal, Tamil Nadu. Best value streetwear under ₹499. COD available. 240 GSM cotton quality. Ashtrix Tees.',
  heroHeading: 'BEST VALUE\nTEES DELIVERED\nTO KODAVASAL',
  heroSubtitle: 'Streetwear quality without the big-city price tag. Ashtrix Tees delivers premium 240 GSM tees directly to Kodavasal starting at just ₹299. COD available.',
  collegeNote: 'Free shipping on orders above ₹499. Delivered in 3–6 business days via Speed Post.',
  canonical: '/tshirts-kodavasal',
  schema: SCHEMA,
}

export default function KodavasalPage() {
  return <LocalLandingPage config={CONFIG} />
}
