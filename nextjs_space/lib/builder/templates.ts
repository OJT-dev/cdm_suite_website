
// Website Templates for AI Builder
export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  features: string[];
  ideal_for: string[];
  pages: string[]; // Default pages for this template
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const WEBSITE_TEMPLATES: Template[] = [
  {
    id: "business",
    name: "Professional Business",
    description: "Clean, corporate design perfect for service businesses and consulting firms",
    category: "Business",
    thumbnail: "/templates/business.jpg",
    features: ["Service showcase", "Team profiles", "Contact forms", "Testimonials"],
    ideal_for: ["Consulting firms", "Professional services", "B2B companies", "Agencies"],
    pages: ["Home", "Services", "About", "Team", "Contact"],
    colors: {
      primary: "#1E3A8A",
      secondary: "#3B82F6",
      accent: "#F59E0B"
    }
  },
  {
    id: "agency",
    name: "Creative Agency",
    description: "Bold, modern design with portfolio showcase and dynamic animations",
    category: "Creative",
    thumbnail: "/templates/agency.jpg",
    features: ["Portfolio grid", "Case studies", "Creative animations", "Client logos"],
    ideal_for: ["Design agencies", "Marketing firms", "Creative studios", "Freelancers"],
    pages: ["Home", "Work", "Services", "About", "Contact"],
    colors: {
      primary: "#7C3AED",
      secondary: "#EC4899",
      accent: "#F59E0B"
    }
  },
  {
    id: "portfolio",
    name: "Portfolio Showcase",
    description: "Minimalist design to highlight your work and achievements",
    category: "Personal",
    thumbnail: "/templates/portfolio.jpg",
    features: ["Project gallery", "Case studies", "Skills showcase", "Blog integration"],
    ideal_for: ["Designers", "Developers", "Photographers", "Artists"],
    pages: ["Home", "Projects", "About", "Blog", "Contact"],
    colors: {
      primary: "#0F172A",
      secondary: "#64748B",
      accent: "#06B6D4"
    }
  },
  {
    id: "ecommerce",
    name: "Online Store",
    description: "Product-focused design with shopping cart and checkout integration",
    category: "E-commerce",
    thumbnail: "/templates/ecommerce.jpg",
    features: ["Product catalog", "Shopping cart", "Checkout flow", "Payment integration"],
    ideal_for: ["Retail stores", "Product sellers", "Boutiques", "Online shops"],
    pages: ["Home", "Shop", "Product", "Cart", "Checkout", "Contact"],
    colors: {
      primary: "#DC2626",
      secondary: "#EF4444",
      accent: "#FBBF24"
    }
  },
  {
    id: "saas",
    name: "SaaS Product",
    description: "Conversion-focused design for software and digital products",
    category: "Technology",
    thumbnail: "/templates/saas.jpg",
    features: ["Feature showcase", "Pricing tables", "Dashboard preview", "Integration logos"],
    ideal_for: ["SaaS companies", "Software products", "Tech startups", "Apps"],
    pages: ["Home", "Features", "Pricing", "About", "Contact"],
    colors: {
      primary: "#0EA5E9",
      secondary: "#6366F1",
      accent: "#10B981"
    }
  },
  {
    id: "blog",
    name: "Content Blog",
    description: "Content-first design for bloggers, writers, and content creators",
    category: "Publishing",
    thumbnail: "/templates/blog.jpg",
    features: ["Article layouts", "Categories", "Author profiles", "Newsletter signup"],
    ideal_for: ["Bloggers", "Writers", "Content creators", "Publishers"],
    pages: ["Home", "Blog", "About", "Contact"],
    colors: {
      primary: "#059669",
      secondary: "#10B981",
      accent: "#F59E0B"
    }
  }
];

export function getTemplate(id: string): Template | undefined {
  return WEBSITE_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return WEBSITE_TEMPLATES.filter(t => t.category === category);
}
