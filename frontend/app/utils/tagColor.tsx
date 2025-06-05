export const TAG_COLORS = {
  design: "bg-pink-100 text-pink-800",
  development: "bg-green-100 text-green-800",
  marketing: "bg-yellow-100 text-yellow-800",
  devops: "bg-blue-100 text-blue-800",
  // default fallback
  default: "bg-gray-100 text-gray-800",
};

export function getTagColor(tag: string) {
  const normalizedTag = tag.toLowerCase();
  return TAG_COLORS[normalizedTag] || TAG_COLORS.default;
}
