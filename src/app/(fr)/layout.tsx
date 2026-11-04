import { RootLayout, buildMetadata } from "@/components/root-layout";

export const metadata = buildMetadata("fr");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout lang="fr">{children}</RootLayout>;
}
