import React from 'react';
import LocalLandingPage from '@/components/LocalLandingPage';

const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Ashtrix Tees Thruthuraipoondi",
  "description": "Premium 240 GSM oversized and printed t-shirts in Thruthuraipoondi. Fast local delivery across the delta region.",
  "url": "https://ashtrixtees.com/tshirts-thruthuraipoondi",
  "telephone": "+91-XXXXXXXXXX",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Thruthuraipoondi",
    "addressRegion": "Tamil Nadu",
    "postalCode": "614713",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "10.5345",
    "longitude": "79.6232"
  },
  "areaServed": ["Thruthuraipoondi", "Edaiyur", "Muthupet"]
};

const CONFIG = {
  town: 'Thruthuraipoondi',
  district: 'Thiruvarur',
  slug: 'tshirts-thruthuraipoondi',
  title: 'Premium T-Shirts in Thruthuraipoondi | Oversized & Printed | Ashtrix Tees',
  description: 'Shop the best 240 GSM oversized t-shirts in Thruthuraipoondi. Ashtrix Tees offers premium quality, fast delivery, and trendy streetwear for the delta region.',
  heroHeading: 'STREETWEAR\nCOMES TO\nPOONDI',
  heroSubtitle: 'Premium 240 GSM oversized, printed & plain tees starting at ₹299. Fast local delivery to Thruthuraipoondi & surrounding areas. COD available now.',
  collegeNote: 'Special delivery options for students near Thruthuraipoondi Govt Arts & Science College.',
  canonical: '/tshirts-thruthuraipoondi',
  schema: SCHEMA,
};

const ThruthuraipoondiPage = () => {
  return <LocalLandingPage config={CONFIG} />;
};

export default ThruthuraipoondiPage;
