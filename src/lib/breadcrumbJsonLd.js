export function getBreadcrumbJsonLd(pathSegments) {
  const itemList = pathSegments.map((seg, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: seg.label,
    item: seg.url
  }))
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itemList
  }
}