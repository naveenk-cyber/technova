import type { InfoPageContent } from './StaticPage';

/**
 * Content for the footer-linked support and company pages, keyed by route
 * slug. Keeping it here means every footer link has a real destination.
 */
export const INFO_PAGES: Record<string, InfoPageContent> = {
  help: {
    title: 'Help Center',
    intro: 'Quick answers to the questions we are asked most often.',
    sections: [
      {
        heading: 'Finding the right product',
        body: 'Use the search bar or browse by category. Each product page lists full specifications, stock availability, and customer reviews so you can compare before you buy.',
      },
      {
        heading: 'Asking the AI Advisor',
        body: 'The AI Advisor searches the live catalog and explains which products fit your budget and requirements. Treat its output as a shortlist, then confirm the final specs on the product page.',
      },
      {
        heading: 'Need a human?',
        body: 'Call 1800-TECHNOVA (toll free) or email support@technova.in. Support is available seven days a week.',
      },
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    intro: 'Changed your mind? Here is how returns work.',
    sections: [
      {
        heading: '7-day return window',
        body: 'Most unused products can be returned within 7 days of delivery. Items must include original packaging and all accessories.',
      },
      {
        heading: 'How to start a return',
        body: 'Open your order from the Orders page and choose the items you want to return. Our team will confirm pickup and refund the amount to your original payment method.',
      },
      {
        heading: 'Refund timing',
        body: 'Refunds are issued within 5–7 business days of the returned item passing inspection.',
      },
    ],
  },
  shipping: {
    title: 'Shipping Policy',
    intro: 'How and when your order reaches you.',
    sections: [
      {
        heading: 'Free delivery over ₹999',
        body: 'Standard shipping is free on every order above ₹999. Below that, a flat delivery fee applies at checkout.',
      },
      {
        heading: 'Delivery timelines',
        body: 'Metro cities typically receive orders in 2 business days; other locations take 3–5 business days.',
      },
      {
        heading: 'Tracking',
        body: 'You can follow your order status from the Orders page once the order has been placed.',
      },
    ],
  },
  warranty: {
    title: 'Warranty',
    intro: 'Coverage included with every purchase.',
    sections: [
      {
        heading: 'Manufacturer warranty',
        body: 'All products carry a minimum 1-year manufacturer warranty covering manufacturing defects. Duration varies by brand and category.',
      },
      {
        heading: 'Claiming a warranty claim',
        body: 'Keep your invoice and contact support with your order ID. We coordinate the claim with the brand on your behalf.',
      },
      {
        heading: 'What is not covered',
        body: 'Physical damage, liquid damage, and unauthorised repairs are not covered under warranty.',
      },
    ],
  },
  about: {
    title: 'About Us',
    intro: "India's AI-powered technology marketplace.",
    sections: [
      {
        heading: 'What we do',
        body: 'TECHNOVA brings premium electronics, honest specifications, and AI-assisted discovery together so you can buy technology with confidence instead of guesswork.',
      },
      {
        heading: 'Why we exist',
        body: 'Choosing a laptop or a phone is a research project. We built the store around the information you actually need, presented clearly.',
      },
      {
        heading: 'Where we are',
        body: 'Headquartered in Bengaluru, Karnataka, and shipping across India.',
      },
    ],
  },
  careers: {
    title: 'Careers',
    intro: 'Help us build the future of tech retail.',
    sections: [
      {
        heading: 'Open roles',
        body: 'We hire across engineering, product, design, and operations. Send an introduction and what you have built to support@technova.in and our team will get back to you.',
      },
      {
        heading: 'How we work',
        body: 'Small teams, high ownership, and a bias toward shipping useful things over writing long documents.',
      },
    ],
  },
  press: {
    title: 'Press',
    intro: 'Media enquiries and brand assets.',
    sections: [
      {
        heading: 'Media enquiries',
        body: 'For interviews, commentary, or product information, email press@technova.in with your outlet and deadline.',
      },
      {
        heading: 'Brand assets',
        body: 'Logos and product photography are available on request to accredited press only.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'How we handle your data.',
    sections: [
      {
        heading: 'What we collect',
        body: 'Account details (name, email), order history, and the contents of your cart and wishlist. Passwords are stored only as salted bcrypt hashes and are never readable.',
      },
      {
        heading: 'How we use it',
        body: 'To process orders, provide support, and improve recommendations. We do not sell your personal data.',
      },
      {
        heading: 'Payments',
        body: 'This storefront runs a simulated payment flow — no real card details are captured or stored.',
      },
      {
        heading: 'Your choices',
        body: 'You can review and update your details at any time from your account page, and sign out to clear the session on this device.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: 'The agreement between you and TECHNOVA.',
    sections: [
      {
        heading: 'Orders and pricing',
        body: 'An order is confirmed once payment is accepted. If a pricing error appears we will contact you before dispatch rather than charge the incorrect amount.',
      },
      {
        heading: 'Stock',
        body: 'Availability is checked at checkout. If an item sells out after you order, you are refunded in full.',
      },
      {
        heading: 'Liability',
        body: 'Product warranties are provided by the manufacturers. TECHNOVA is not liable for indirect or consequential losses.',
      },
      {
        heading: 'Account security',
        body: 'You are responsible for keeping your account credentials confidential and for activity performed under your account.',
      },
    ],
  },
};