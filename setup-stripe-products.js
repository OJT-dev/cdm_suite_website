
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  try {
    console.log('🔧 Creating Stripe products...\n');

    // Create Done-For-You Website Fix Product
    const dfyProduct = await stripe.products.create({
      name: 'Website Fix - Done-For-You',
      description: 'Professional website audit and fixes by our expert team. We handle everything for you.',
      metadata: {
        service_type: 'website-fix-dfy',
        features: 'Full audit, Priority fixes, Expert implementation, Ongoing support'
      }
    });

    const dfyPrice = await stripe.prices.create({
      product: dfyProduct.id,
      unit_amount: 10000, // $100.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        service_tier: 'done-for-you'
      }
    });

    console.log('✅ Done-For-You Product Created:');
    console.log(`   Product ID: ${dfyProduct.id}`);
    console.log(`   Price ID: ${dfyPrice.id}`);
    console.log(`   Amount: $${dfyPrice.unit_amount / 100}/month\n`);

    // Create Self-Service Website Fix Product
    const selfProduct = await stripe.products.create({
      name: 'Website Fix - Self-Service',
      description: 'Get detailed audit reports and fix recommendations. Implement changes yourself with our guidance.',
      metadata: {
        service_type: 'website-fix-self',
        features: 'Detailed audit report, Step-by-step guides, Self-service platform access'
      }
    });

    const selfPrice = await stripe.prices.create({
      product: selfProduct.id,
      unit_amount: 5000, // $50.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      },
      metadata: {
        service_tier: 'self-service'
      }
    });

    console.log('✅ Self-Service Product Created:');
    console.log(`   Product ID: ${selfProduct.id}`);
    console.log(`   Price ID: ${selfPrice.id}`);
    console.log(`   Amount: $${selfPrice.unit_amount / 100}/month\n`);

    // Output environment variables
    console.log('📝 Add these to your .env file:\n');
    console.log(`STRIPE_PRICE_WEBSITE_FIX_DFY=${dfyPrice.id}`);
    console.log(`STRIPE_PRICE_WEBSITE_FIX_SELF=${selfPrice.id}`);

    return {
      dfy: dfyPrice.id,
      self: selfPrice.id
    };
  } catch (error) {
    console.error('❌ Error creating products:', error.message);
    throw error;
  }
}

createProducts()
  .then(prices => {
    console.log('\n✅ All products created successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Failed to create products');
    process.exit(1);
  });
