
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

async function createAllProducts() {
  console.log(`\n${colors.bright}${colors.blue}🚀 Setting up Stripe Live Products for CDM Suite${colors.reset}\n`);
  console.log(`${colors.yellow}⚠️  Make sure you're using LIVE mode credentials!${colors.reset}\n`);

  const productIds = {};

  try {
    // 1. Website Fix Services (Main Products)
    console.log(`${colors.bright}📦 Creating Website Fix Services...${colors.reset}`);
    
    const dfyProduct = await stripe.products.create({
      name: 'Website Fix - Done-For-You',
      description: 'Professional website audit and fixes by our expert team. We handle everything for you.',
      metadata: {
        service_type: 'website-fix-dfy',
        category: 'website-services'
      }
    });

    const dfyPrice = await stripe.prices.create({
      product: dfyProduct.id,
      unit_amount: 10000, // $100.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      }
    });

    console.log(`${colors.green}✅ Done-For-You: ${dfyPrice.id} ($100/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_WEBSITE_FIX_DFY = dfyPrice.id;

    const selfProduct = await stripe.products.create({
      name: 'Website Fix - Self-Service',
      description: 'Get detailed audit reports and fix recommendations. Implement changes yourself with our guidance.',
      metadata: {
        service_type: 'website-fix-self',
        category: 'website-services'
      }
    });

    const selfPrice = await stripe.prices.create({
      product: selfProduct.id,
      unit_amount: 5000, // $50.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      }
    });

    console.log(`${colors.green}✅ Self-Service: ${selfPrice.id} ($50/mo)${colors.reset}\n`);
    productIds.STRIPE_PRICE_WEBSITE_FIX_SELF = selfPrice.id;

    // 2. Ad Management Services
    console.log(`${colors.bright}📢 Creating Ad Management Tiers...${colors.reset}`);
    
    const adStarter = await createServiceProduct(
      'Ad Management - Starter',
      'Perfect for small businesses testing digital marketing with Meta Ads + Google PPC management',
      25000,
      'ad-management-starter'
    );
    console.log(`${colors.green}✅ Starter: ${adStarter.priceId} ($250/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_AD_MANAGEMENT_STARTER = adStarter.priceId;

    const adGrowth = await createServiceProduct(
      'Ad Management - Growth',
      'Scale your business with advanced campaigns, A/B testing, and more keywords',
      55000,
      'ad-management-growth'
    );
    console.log(`${colors.green}✅ Growth: ${adGrowth.priceId} ($550/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_AD_MANAGEMENT_GROWTH = adGrowth.priceId;

    const adPremium = await createServiceProduct(
      'Ad Management - Premium',
      'Multi-channel strategy with TikTok, Snapchat, CRO consulting, and dedicated support',
      100000,
      'ad-management-premium'
    );
    console.log(`${colors.green}✅ Premium: ${adPremium.priceId} ($1,000/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_AD_MANAGEMENT_PREMIUM = adPremium.priceId;

    const adEnterprise = await createServiceProduct(
      'Ad Management - Enterprise',
      'Custom strategy with white-glove support for large-scale campaigns',
      350000,
      'ad-management-enterprise'
    );
    console.log(`${colors.green}✅ Enterprise: ${adEnterprise.priceId} ($3,500/mo)${colors.reset}\n`);
    productIds.STRIPE_PRICE_AD_MANAGEMENT_ENTERPRISE = adEnterprise.priceId;

    // 3. SEO Services
    console.log(`${colors.bright}🔍 Creating SEO Service Tiers...${colors.reset}`);
    
    const seoLocal = await createServiceProduct(
      'SEO - Local/Basic',
      'Local SEO with Google My Business optimization and keyword research',
      17500,
      'seo-local-basic'
    );
    console.log(`${colors.green}✅ Local/Basic: ${seoLocal.priceId} ($175/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_SEO_LOCAL = seoLocal.priceId;

    const seoGrowth = await createServiceProduct(
      'SEO - Growth',
      'Comprehensive SEO with backlinks, technical optimization, and content development',
      60000,
      'seo-growth'
    );
    console.log(`${colors.green}✅ Growth: ${seoGrowth.priceId} ($600/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_SEO_GROWTH = seoGrowth.priceId;

    const seoComprehensive = await createServiceProduct(
      'SEO - Comprehensive/Global',
      'Enterprise SEO for competitive keywords with multi-language support',
      300000,
      'seo-comprehensive'
    );
    console.log(`${colors.green}✅ Comprehensive: ${seoComprehensive.priceId} ($3,000/mo)${colors.reset}\n`);
    productIds.STRIPE_PRICE_SEO_COMPREHENSIVE = seoComprehensive.priceId;

    // 4. Social Media Management
    console.log(`${colors.bright}📱 Creating Social Media Management Tiers...${colors.reset}`);
    
    const socialBasic = await createServiceProduct(
      'Social Media - Basic',
      'Single platform management with 8 posts/month and basic engagement',
      20000,
      'social-media-basic'
    );
    console.log(`${colors.green}✅ Basic: ${socialBasic.priceId} ($200/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_SOCIAL_BASIC = socialBasic.priceId;

    const socialGrowth = await createServiceProduct(
      'Social Media - Growth',
      '2-3 platforms with 12-18 posts/month, video content, and ad management',
      49000,
      'social-media-growth'
    );
    console.log(`${colors.green}✅ Growth: ${socialGrowth.priceId} ($490/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_SOCIAL_GROWTH = socialGrowth.priceId;

    const socialPro = await createServiceProduct(
      'Social Media - Pro',
      'Full spectrum management across 3-5 platforms with daily posts and influencer strategy',
      150000,
      'social-media-pro'
    );
    console.log(`${colors.green}✅ Pro: ${socialPro.priceId} ($1,500/mo)${colors.reset}\n`);
    productIds.STRIPE_PRICE_SOCIAL_PRO = socialPro.priceId;

    // 5. Web Development (One-time payments)
    console.log(`${colors.bright}🌐 Creating Web Development Packages...${colors.reset}`);
    
    const webStarter = await createOneTimeProduct(
      'Web Development - Starter',
      'Semi-custom responsive website up to 5 pages with basic SEO',
      42000,
      'web-dev-starter'
    );
    console.log(`${colors.green}✅ Starter: ${webStarter.priceId} ($420 one-time)${colors.reset}`);
    productIds.STRIPE_PRICE_WEB_DEV_STARTER = webStarter.priceId;

    const webGrowth = await createOneTimeProduct(
      'Web Development - Growth',
      'Custom design with 10-15 pages, blog section, and e-commerce capability',
      97500,
      'web-dev-growth'
    );
    console.log(`${colors.green}✅ Growth: ${webGrowth.priceId} ($975 one-time)${colors.reset}`);
    productIds.STRIPE_PRICE_WEB_DEV_GROWTH = webGrowth.priceId;

    const webPremium = await createOneTimeProduct(
      'Web Development - Premium',
      'Fully custom enterprise website with advanced functionality and unlimited pages',
      375000,
      'web-dev-premium'
    );
    console.log(`${colors.green}✅ Premium: ${webPremium.priceId} ($3,750 one-time)${colors.reset}\n`);
    productIds.STRIPE_PRICE_WEB_DEV_PREMIUM = webPremium.priceId;

    // 6. App Development (One-time payments)
    console.log(`${colors.bright}📱 Creating App Development Packages...${colors.reset}`);
    
    const appMvp = await createOneTimeProduct(
      'App Development - MVP',
      'Basic mobile app with simple UI and limited backend',
      122500,
      'app-dev-mvp'
    );
    console.log(`${colors.green}✅ MVP: ${appMvp.priceId} ($1,225 one-time)${colors.reset}`);
    productIds.STRIPE_PRICE_APP_DEV_MVP = appMvp.priceId;

    const appGrowth = await createOneTimeProduct(
      'App Development - Growth',
      'Feature-rich app with push notifications, payments, and API integrations',
      375000,
      'app-dev-growth'
    );
    console.log(`${colors.green}✅ Growth: ${appGrowth.priceId} ($3,750 one-time)${colors.reset}`);
    productIds.STRIPE_PRICE_APP_DEV_GROWTH = appGrowth.priceId;

    const appEnterprise = await createOneTimeProduct(
      'App Development - Enterprise',
      'Custom large-scale multi-platform app with AI, AR, or advanced features',
      1250000,
      'app-dev-enterprise'
    );
    console.log(`${colors.green}✅ Enterprise: ${appEnterprise.priceId} ($12,500 one-time)${colors.reset}\n`);
    productIds.STRIPE_PRICE_APP_DEV_ENTERPRISE = appEnterprise.priceId;

    // 7. Website Maintenance
    console.log(`${colors.bright}🔧 Creating Website Maintenance Plans...${colors.reset}`);
    
    const maintBasic = await createServiceProduct(
      'Website Maintenance - Basic',
      'Monthly updates, security scans, backups, and 1 content update',
      10000,
      'website-maint-basic'
    );
    console.log(`${colors.green}✅ Basic: ${maintBasic.priceId} ($100/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_WEBSITE_MAINT_BASIC = maintBasic.priceId;

    const maintStandard = await createServiceProduct(
      'Website Maintenance - Standard',
      'Bi-weekly backups, performance checks, 3 content updates, and monthly reports',
      25000,
      'website-maint-standard'
    );
    console.log(`${colors.green}✅ Standard: ${maintStandard.priceId} ($250/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_WEBSITE_MAINT_STANDARD = maintStandard.priceId;

    const maintBusiness = await createServiceProduct(
      'Website Maintenance - Business',
      'Weekly backups, SEO monitoring, 5 content updates, and priority support',
      50000,
      'website-maint-business'
    );
    console.log(`${colors.green}✅ Business: ${maintBusiness.priceId} ($500/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_WEBSITE_MAINT_BUSINESS = maintBusiness.priceId;

    const maintPremium = await createServiceProduct(
      'Website Maintenance - Premium',
      'Daily backups, unlimited updates, dedicated manager, and emergency support',
      100000,
      'website-maint-premium'
    );
    console.log(`${colors.green}✅ Premium: ${maintPremium.priceId} ($1,000/mo)${colors.reset}\n`);
    productIds.STRIPE_PRICE_WEBSITE_MAINT_PREMIUM = maintPremium.priceId;

    // 8. App Maintenance
    console.log(`${colors.bright}📱 Creating App Maintenance Plans...${colors.reset}`);
    
    const appMaintBasic = await createServiceProduct(
      'App Maintenance - Basic',
      'Bug fixes, OS updates, security patches, and hosting',
      35000,
      'app-maint-basic'
    );
    console.log(`${colors.green}✅ Basic: ${appMaintBasic.priceId} ($350/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_APP_MAINT_BASIC = appMaintBasic.priceId;

    const appMaintStandard = await createServiceProduct(
      'App Maintenance - Standard',
      'All Basic features plus library updates, crash monitoring, and enhancements',
      97500,
      'app-maint-standard'
    );
    console.log(`${colors.green}✅ Standard: ${appMaintStandard.priceId} ($975/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_APP_MAINT_STANDARD = appMaintStandard.priceId;

    const appMaintPremium = await createServiceProduct(
      'App Maintenance - Premium',
      'Proactive enhancements, dedicated support, analytics, and optimization',
      275000,
      'app-maint-premium'
    );
    console.log(`${colors.green}✅ Premium: ${appMaintPremium.priceId} ($2,750/mo)${colors.reset}`);
    productIds.STRIPE_PRICE_APP_MAINT_PREMIUM = appMaintPremium.priceId;

    const appMaintEnterprise = await createServiceProduct(
      'App Maintenance - Enterprise',
      'Mission-critical support with fast SLA, security audits, and multi-region maintenance',
      650000,
      'app-maint-enterprise'
    );
    console.log(`${colors.green}✅ Enterprise: ${appMaintEnterprise.priceId} ($6,500/mo)${colors.reset}\n`);
    productIds.STRIPE_PRICE_APP_MAINT_ENTERPRISE = appMaintEnterprise.priceId;

    // Print summary
    console.log(`\n${colors.bright}${colors.green}✅ All products created successfully!${colors.reset}\n`);
    console.log(`${colors.bright}📝 Add these to your .env file:${colors.reset}\n`);
    
    Object.entries(productIds).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });

    console.log(`\n${colors.yellow}⚠️  IMPORTANT: Update your webhook endpoint in Stripe Dashboard${colors.reset}`);
    console.log(`   Endpoint URL: https://cdmsuite.abacusai.app/api/stripe-webhook`);
    console.log(`   Events to select: checkout.session.completed, customer.subscription.*\n`);

    return productIds;

  } catch (error) {
    console.error(`\n${colors.red}❌ Error creating products:${colors.reset}`, error.message);
    throw error;
  }
}

async function createServiceProduct(name, description, amount, metadataId) {
  const product = await stripe.products.create({
    name,
    description,
    metadata: {
      service_id: metadataId,
      category: 'recurring-service'
    }
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency: 'usd',
    recurring: {
      interval: 'month'
    }
  });

  return { productId: product.id, priceId: price.id };
}

async function createOneTimeProduct(name, description, amount, metadataId) {
  const product = await stripe.products.create({
    name,
    description,
    metadata: {
      service_id: metadataId,
      category: 'one-time-payment'
    }
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: amount,
    currency: 'usd'
  });

  return { productId: product.id, priceId: price.id };
}

// Run the setup
createAllProducts()
  .then(productIds => {
    console.log(`${colors.bright}${colors.green}🎉 Stripe Live setup complete!${colors.reset}\n`);
    process.exit(0);
  })
  .catch(error => {
    console.error(`${colors.red}❌ Setup failed${colors.reset}`);
    process.exit(1);
  });
