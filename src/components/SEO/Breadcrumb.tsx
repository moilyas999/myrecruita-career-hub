import { Link, useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { generateBreadcrumbSchema } from "@/components/SEO/StructuredData";
import { StructuredData } from "@/components/SEO/StructuredData";

const routeNames: Record<string, string> = {
  "/": "Home",
  "/jobs": "Jobs",
  "/about": "About Us",
  "/contact": "Contact",
  "/employers": "Employers",
  "/submit-cv": "Submit CV",
  "/career-partner": "Career Partner",
  "/featured-talent": "Featured Talent",
  "/blog": "Blog",
  "/post-job": "Post a Job",
};

export function SEOBreadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  
  // Don't show breadcrumb on home page
  if (location.pathname === "/") return null;
  
  const breadcrumbs = [
    { name: "Home", url: "/" },
    ...pathSegments.map((segment, index) => {
      const path = "/" + pathSegments.slice(0, index + 1).join("/");
      const name = routeNames[path] || segment.charAt(0).toUpperCase() + segment.slice(1);
      return { name, url: path };
    })
  ];

  const schema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <StructuredData data={schema} id="breadcrumb" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <BreadcrumbItem key={crumb.url}>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink asChild>
                      <Link to={crumb.url}>{crumb.name}</Link>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </>
  );
}