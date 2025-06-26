// ✅ src/lib/useBreadcrumbSegments.js

export default function useBreadcrumbSegments(path, labels = {}) {
  const segments = path.split('/').filter(Boolean);
  let url = '';
  return segments.map((segment, idx) => {
    url += '/' + segment;
    return {
      label: labels[segment] || segment,
      url
    };
  });
}
