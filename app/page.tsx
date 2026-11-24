import { AiraConsole } from "@/components/aira-console";

const steps = [
  {
    title: "Talk",
    body: "Say what you need, in your own words. Hindi, English or Hinglish all work.",
  },
  {
    title: "Confirm",
    body: "Aira reads you the total and the delivery time. Nothing is bought until you say yes.",
  },
  {
    title: "Track",
    body: "Ask where your order is, any time. Aira checks and tells you.",
  },
  {
    title: "Delivered",
    body: "Pay on delivery, in cash or by UPI. No app to install, no account to make.",
  },
];

const handles = [
  "Groceries and daily essentials",
  "Medicines, with a prescription when needed",
  "Cakes, sweets and gifts",
  "Documents and small parcels",
  "Anything you describe, even if it is not on any app",
];

export default function HomePage() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <a href="/" className="font-display text-xl font-bold tracking-tight">
          AirDelivery
        </a>
        <p className="hidden text-sm text-ink-soft sm:block">Works on any phone or laptop, on WiFi</p>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 pb-20 pt-6 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-14">
          <div className="flex min-w-0 flex-col justify-center">
            <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] font-bold leading-[0.98] tracking-[-0.02em] [overflow-wrap:anywhere]">
              Tell us what you need. We find it.
            </h1>
            <p className="mt-6 max-w-[34ch] text-lg text-ink-soft">
              Talk to Aira like you talk to a person. No app to install, no catalogue to scroll,
              no login before you start.
            </p>
            <ul className="mt-8 flex flex-col gap-2 text-ink-soft">
              {handles.map((item) => (
                <li key={item} className="border-b border-line py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            id="talk"
            className="min-w-0 rounded-[var(--radius-panel)] bg-chalk-deep p-4 sm:p-6"
          >
            <div className="mb-5 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold">Talk to Aira</h2>
              <p className="text-sm text-muted">Demo: pricing is shown only after a real check</p>
            </div>
            <AiraConsole />
          </div>
        </section>

        <section aria-labelledby="how-heading" className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
            <h2 id="how-heading" className="font-display text-3xl font-semibold sm:text-4xl">
              Four steps, all in one conversation
            </h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, index) => (
                <li key={step.title} className="flex flex-col gap-3 border-t-2 border-ink pt-5">
                  <span className="text-sm text-muted" aria-hidden>
                    {index + 1} of 4
                  </span>
                  <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                  <p className="text-ink-soft">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="price-heading" className="border-t border-line bg-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-2">
            <div>
              <h2 id="price-heading" className="font-display text-3xl font-semibold sm:text-4xl">
                Delivery is ₹49 to ₹99. Free above ₹999.
              </h2>
              <p className="mt-4 max-w-[46ch] text-ink-soft">
                Item prices are the shop price, shown to you before you confirm. A small service fee
                applies only when we search for something hard to find. Pay on delivery, by cash or UPI.
              </p>
            </div>
            <dl className="grid content-start gap-6 text-ink-soft">
              <div className="border-b border-line pb-4">
                <dt className="font-semibold text-ink">Can I cancel?</dt>
                <dd className="mt-1">Yes, until your order is out for delivery. Tell Aira.</dd>
              </div>
              <div className="border-b border-line pb-4">
                <dt className="font-semibold text-ink">Do I need an app?</dt>
                <dd className="mt-1">No. It works in your phone&apos;s browser.</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Is my voice recorded?</dt>
                <dd className="mt-1">
                  Not by default. Recordings are kept only with your consent.
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-5 py-8 text-sm text-muted sm:px-8">
          <p>AirDelivery. If it exists, we will find it and deliver it.</p>
          <p>Phase 1 preview. Not yet taking live orders.</p>
        </div>
      </footer>
    </>
  );
}
