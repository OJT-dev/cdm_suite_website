import { prisma } from '../lib/db';

async function fixDuplicateImages() {
  try {
    // Get all published blog posts
    const posts = await prisma.blogPost.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
      },
      orderBy: { publishedAt: 'desc' },
    });

    console.log(`Found ${posts.length} published blog posts`);

    // Group posts by featured image
    const imageGroups = new Map<string, typeof posts>();
    posts.forEach((post: any) => {
      if (post.featuredImage) {
        if (!imageGroups.has(post.featuredImage)) {
          imageGroups.set(post.featuredImage, []);
        }
        imageGroups.get(post.featuredImage)!.push(post);
      }
    });

    // Find duplicates
    const duplicates = Array.from(imageGroups.entries())
      .filter(([_, posts]) => posts.length > 1);

    if (duplicates.length === 0) {
      console.log('No duplicate images found!');
      return;
    }

    console.log(`\nFound ${duplicates.length} images used by multiple posts:`);
    
    for (const [image, dupPosts] of duplicates) {
      console.log(`\nImage: ${image}`);
      console.log(`Used by ${dupPosts.length} posts:`);
      dupPosts.forEach((post: any) => {
        console.log(`  - ${post.title} (${post.slug})`);
      });
    }

    // List the posts that need new images (all except the first one in each group)
    const postsNeedingNewImages = duplicates.flatMap(([_, posts]) => posts.slice(1));
    
    console.log(`\n${postsNeedingNewImages.length} posts need new images:`);
    postsNeedingNewImages.forEach(post => {
      console.log(`- ${post.title}`);
    });

    console.log('\nTo fix this, we need to generate new unique images for each of these posts.');
    console.log('The images should be relevant to the post content and visually distinct.');

  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
