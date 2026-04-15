export default function AnnouncementBar() {
  const messages = [
    '✦ FREE SHIPPING ON ORDERS ABOVE ₹499',
    '✦ USE CODE WELCOME10 FOR 10% OFF',
    '✦ NEW DROP EVERY FRIDAY',
    '✦ PREMIUM 240 GSM COTTON',
    '✦ COD AVAILABLE',
  ]
  const doubled = [...messages, ...messages]

  return (
    <div className="bg-brand-accent text-brand-black overflow-hidden h-8 flex items-center">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((msg, i) => (
          <span key={i} className="font-mono text-xs font-medium tracking-widest mx-8">
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
