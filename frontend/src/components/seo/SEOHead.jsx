import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'Ashtrix Tees'
const SITE_URL = 'https://ashtrixtees.com'
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`
const DEFAULT_DESCRIPTION =
  'Ashtrix Tees – Buy premium oversized, printed & plain t-shirts online. 240 GSM cotton. Free shipping above ₹499. Delivered across Thiruvarur, Tamil Nadu.'

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = DEFAULT_IMAGE,
  noIndex = false,
  schema = null,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} – Fresh Fits, Always`
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined

  return (
    <Helmet>
      {/* ── Primary ──────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* ── Open Graph ───────────────────────────── */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* ── Twitter Card ──────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* ── Geo ───────────────────────────────────── */}
      <meta name="geo.region" content="IN-TN" />
      <meta name="geo.placename" content="Thruthuraipoondi, Thiruvarur, Tamil Nadu" />
      <meta name="geo.position" content="10.5765;79.6232" />
      <meta name="ICBM" content="10.5765, 79.6232" />

      {/* ── JSON-LD Schema ────────────────────────── */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  )
}
