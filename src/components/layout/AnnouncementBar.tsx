import { siteConfig } from "@/constants/site";

export function AnnouncementBar() {
  return (
    <div className="bg-primary py-2.5 text-center">
      <p className="px-4 font-body text-xs tracking-wide text-white sm:text-sm">
        {siteConfig.announcement}
      </p>
    </div>
  );
}
