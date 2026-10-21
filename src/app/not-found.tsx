import SiteLayout from "./(site)/layout";
import NotFound from "./(site)/not-found";

/** Unmatched URLs still get the full site chrome. */
export default function RootNotFound() {
  return (
    <SiteLayout params={Promise.resolve({})}>
      <NotFound />
    </SiteLayout>
  );
}
