import { RootLayout, buildMetadata } from "@/components/root-layout";

export const metadata = buildMetadata("en");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout lang="en">{children}</RootLayout>;
}
