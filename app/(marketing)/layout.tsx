import SiteNav from "./SiteNav";
import SiteFooter from "./SiteFooter";

// Marketing shell: nav + footer. Product routes (/s/*, /dashboard/*,
// /admin/*, /login) intentionally stay outside this group — no marketing
// chrome on the funnel, the app, or the login page.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteNav />
      {children}
      <SiteFooter />
    </>
  );
}
