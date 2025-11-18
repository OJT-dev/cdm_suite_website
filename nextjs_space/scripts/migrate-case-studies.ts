
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const caseStudies = [
  {
    id: 'foqn-funny',
    title: 'FOQN Funny',
    category: 'E-Commerce',
    client: 'FOQN Funny',
    description: 'E-commerce website with unfiltered energy',
    challenge: 'Creating a digital experience that perfectly captures the FOQN Funny vibe and makes the brand look as good online as it sounds on stage.',
    solution: 'We designed and developed a complete e-commerce platform with custom product pages, FAQ section, customer reviews, and an intuitive shopping experience.',
    results: [
      'Seamless user experience',
      'Smooth community engagement',
      'Easy-to-use platform',
      'Professional brand presence'
    ],
    testimonial: {
      quote: "We needed a website with the same edgy, unfiltered energy as our brand. CDM Suite didn't just give us a generic e-commerce site; they created a whole digital experience that perfectly captures the FOQN Funny vibe. The design is killer, the user experience is smooth, and our community loves how easy it is to use. The team was fantastic to collaborate with and completely understood the look and feel we were going for. They made our brand look as good online as it sounds on stage.",
      author: "The Founder",
      company: "FOQN Funny"
    },
    image: '/images/case-studies/foqn-funny.jpg',
    tags: ['E-Commerce', 'Web Design', 'Branding']
  },
  {
    id: 'rapido-shipping',
    title: 'Rapido Shipping Jamaica',
    category: 'Logistics',
    client: 'Rapido Shipping Jamaica',
    description: 'Professional shipping and logistics website',
    challenge: 'Creating a professional website that makes the shipping process clear and delivers a seamless experience for customers.',
    solution: 'We developed a comprehensive website with clear service information, contact forms, shipping calculator integration, and detailed about section highlighting their expertise.',
    results: [
      'Clear shipping process',
      'Flawless user experience',
      'Steady business growth',
      'Zero customer confusion'
    ],
    testimonial: {
      quote: "I can't say enough good things about the CDM Suite team. We needed a professional website that made our shipping process super clear, and they delivered, plain and simple. They listened, they were fast, and the final site works flawlessly. Since launching, our business has seen steady growth, and we've had zero confusion from customers. If you want a team that will build you something that actually works for your business, look no further.",
      author: "The Management",
      company: "Rapido Shipping Jamaica"
    },
    image: '/images/case-studies/rapido-shipping.jpg',
    tags: ['Web Design', 'Logistics', 'Professional Services']
  },
  {
    id: 'sun-absorbed',
    title: 'Sun Absorbed LLC',
    category: 'Travel & Tourism',
    client: 'Sun Absorbed LLC',
    description: 'Custom vacation packages website',
    challenge: 'Creating a website for dream vacations that feels like the start of a vacation itself, with seamless booking and beautiful design.',
    solution: 'We built a stunning travel website with custom vacation package displays, inquiry forms, detailed destination information, and an immersive visual experience.',
    results: [
      'Beautiful, immersive design',
      'Easy-to-use booking system',
      'Great customer feedback',
      'Professional brand presence'
    ],
    testimonial: {
      quote: "I'm honestly blown away. We came to CDM Suite with a big idea for Sun Absorbed Travel, and they just completely nailed it. It felt like they read our minds! The whole process was so easy—it felt like we were brainstorming with friends who just happen to be amazing designers. They took our vibe and turned it into a website that's not only beautiful but also super simple for our customers to use. We've already gotten so much great feedback. People are telling us the site itself feels like the start of a vacation! We couldn't be happier. Seriously, if you need a team that will pour their heart into your project and deliver something special, CDM Suite is it.",
      author: "The Team",
      company: "Sun Absorbed LLC"
    },
    image: '/images/case-studies/sun-absorbed.jpg',
    tags: ['Travel', 'Web Design', 'Booking System']
  },
  {
    id: 'dreniefied-collection',
    title: 'Dreniefied Collection',
    category: 'E-Commerce',
    client: 'Dreniefied Collection',
    description: 'Premium wig e-commerce store',
    challenge: 'Building a digital home for a personal brand that goes beyond selling wigs—creating a community and sharing a story.',
    solution: 'We created a stunning e-commerce platform with custom product displays, detailed product pages, checkout system, and a design that captures the brand\'s essence.',
    results: [
      'Stunning, on-brand design',
      'Seamless shopping experience',
      'Perfect vibe capture',
      'Strong community building'
    ],
    testimonial: {
      quote: "My brand, Dreniefied Collection, is incredibly personal to me, and I needed a website that felt just as special. I'm not just selling wigs; I'm building a community and sharing a piece of my story. From the very beginning, the team at CDM Suite understood that. They dove deep into my vision and created a digital home for my brand that is beyond what I hoped for. The design is stunning, it captures our vibe perfectly, and most importantly, it gives my customers a seamless, beautiful shopping experience. They didn't just build a store; they brought a vision to life.",
      author: "A.S., Founder",
      company: "Dreniefied Collection"
    },
    image: '/images/case-studies/dreniefied.jpg',
    tags: ['E-Commerce', 'Fashion', 'Branding']
  },
  {
    id: 'meta-ads-inflatables-1',
    title: '70 Leads from $130 Facebook Ads',
    category: 'Digital Advertising',
    client: 'Inflatables Business',
    description: 'Facebook Ads campaign for inflatable rental business',
    challenge: 'Generate high-quality leads for a new inflatable rental business with a limited budget.',
    solution: 'Strategic Facebook Ads campaign with targeted audience, compelling creative, and optimized landing page.',
    results: [
      '70 high-quality leads',
      '$130 total ad spend',
      '$1.86 cost per lead',
      '2-week campaign duration'
    ],
    testimonial: null,
    image: '/images/case-studies/meta-ads-1.jpg',
    tags: ['Facebook Ads', 'Lead Generation', 'Meta Advertising']
  },
  {
    id: 'meta-ads-inflatables-2',
    title: 'Bachelor Party Inflatable Rentals',
    category: 'Digital Advertising',
    client: 'Luxury Inflatable Rentals',
    description: 'Targeted Facebook campaign for bachelorette parties',
    challenge: 'Target specific event type (bachelorette parties) for luxury inflatable rentals.',
    solution: 'Highly targeted Facebook Ads with event-specific creative and messaging.',
    results: [
      '70 leads in 2 weeks',
      '$130 ad budget',
      'High conversion rate',
      'Premium event bookings'
    ],
    testimonial: null,
    image: '/images/case-studies/meta-ads-2.jpg',
    tags: ['Facebook Ads', 'Event Marketing', 'Targeted Advertising']
  },
  {
    id: 'meta-ads-coaching',
    title: 'Cut Lead Costs in Half with Facebook Ads',
    category: 'Digital Advertising',
    client: 'Business Coaching Company',
    description: 'Facebook Ads optimization for coaching business',
    challenge: 'Reduce lead acquisition costs while maintaining lead quality for a business coaching company.',
    solution: 'Advanced targeting, creative optimization, and conversion tracking.',
    results: [
      'Lead costs slashed to $8.43',
      'Over 30 days campaign',
      'Consistent lead quality',
      '50% cost reduction'
    ],
    testimonial: null,
    image: '/images/case-studies/meta-ads-3.jpg',
    tags: ['Facebook Ads', 'Cost Optimization', 'B2B Marketing']
  }
];

async function main() {
  console.log('🚀 Starting case study migration...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const study of caseStudies) {
    try {
      // Check if study already exists
      const existing = await prisma.caseStudy.findUnique({
        where: { slug: study.id }
      });

      if (existing) {
        console.log(`⏭️  Skipping "${study.title}" - already exists`);
        skipCount++;
        continue;
      }

      // Create the case study
      await prisma.caseStudy.create({
        data: {
          slug: study.id,
          title: study.title,
          category: study.category,
          client: study.client,
          description: study.description,
          challenge: study.challenge,
          solution: study.solution,
          results: study.results,
          testimonialQuote: study.testimonial?.quote || null,
          testimonialAuthor: study.testimonial?.author || null,
          testimonialCompany: study.testimonial?.company || null,
          heroImage: study.image,
          tags: study.tags,
          status: 'published',
          publishedAt: new Date(),
          order: successCount
        }
      });

      console.log(`✅ Migrated "${study.title}"`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error migrating "${study.title}":`, error);
      errorCount++;
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ⏭️  Skipped: ${skipCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📝 Total: ${caseStudies.length}\n`);

  console.log('✨ Migration complete!\n');
}

main()
  .catch((e) => {
    console.error('💥 Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
