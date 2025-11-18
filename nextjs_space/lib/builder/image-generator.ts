
// Image generation and download utilities for AI website builder

export async function findAndDownloadImage(description: string): Promise<string | null> {
  try {
    // Call asset retrieval API to find and download image
    const response = await fetch("/api/builder/download-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      console.error("Failed to download image:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.imageUrl || null;
  } catch (error) {
    console.error("Image download error:", error);
    return null;
  }
}

export async function downloadImagesForContent(content: any): Promise<any> {
  // This function will process the generated content and download all images
  const processedContent = { ...content };

  // Process each page
  if (processedContent.pages && Array.isArray(processedContent.pages)) {
    for (let pageIndex = 0; pageIndex < processedContent.pages.length; pageIndex++) {
      const page = processedContent.pages[pageIndex];

      // Download hero image
      if (page.hero?.imageDescription) {
        const imageUrl = await findAndDownloadImage(page.hero.imageDescription);
        if (imageUrl) {
          page.hero.image = imageUrl;
        }
      }

      // Download section images
      if (page.sections && Array.isArray(page.sections)) {
        for (let sectionIndex = 0; sectionIndex < page.sections.length; sectionIndex++) {
          const section = page.sections[sectionIndex];

          // Section image
          if (section.imageDescription) {
            const imageUrl = await findAndDownloadImage(section.imageDescription);
            if (imageUrl) {
              section.image = imageUrl;
            }
          }

          // Item images
          if (section.items && Array.isArray(section.items)) {
            for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
              const item = section.items[itemIndex];
              if (item.imageDescription) {
                const imageUrl = await findAndDownloadImage(item.imageDescription);
                if (imageUrl) {
                  item.image = imageUrl;
                }
              }
            }
          }
        }
      }
    }
  }

  return processedContent;
}
