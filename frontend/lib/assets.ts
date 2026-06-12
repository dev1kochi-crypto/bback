export const siteAssets = {
  headerBackground: '/app/images/header-bg.png',
  pageBannerBackground: '/app/images/inner-page-banner-bg.png',
  contactPhoneIcon: '/app/images/solar_phone-outline.png',
  contactDirectionsIcon: '/app/images/carbon_location.png',
  contactMailIcon: '/app/images/iconoir_mail.png',
  menuIcon: '/app/images/gg_menu-hotdog.png',
  productPhotoComingSoon: '/app/images/product-photo-coming-soon.svg',
} as const;

export function menuItemImageSrc(image: string | null | undefined): string {
  const trimmed = image?.trim();
  return trimmed ? trimmed : siteAssets.productPhotoComingSoon;
}

export function hasMenuItemImage(image: string | null | undefined): boolean {
  return Boolean(image?.trim());
}
