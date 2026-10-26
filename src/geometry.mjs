export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export function constrain(view) {
  const zoom = clamp(view.zoom, 1, 5), edge = 0.5 / zoom;
  return { zoom, x: clamp(view.x, edge, 1 - edge), y: clamp(view.y, edge, 1 - edge) };
}
export function imagePoint(point, size, view) {
  return { x: view.x + (point.x / size.width - 0.5) / view.zoom, y: view.y + (point.y / size.height - 0.5) / view.zoom };
}
export function zoomAt(view, zoom, point, size) {
  zoom = clamp(zoom, 1, 5);
  const anchor = imagePoint(point, size, view);
  return constrain({ zoom, x: anchor.x - (point.x / size.width - 0.5) / zoom, y: anchor.y - (point.y / size.height - 0.5) / zoom });
}
export function panBy(view, delta, size) {
  return constrain({ ...view, x: view.x - delta.x / (size.width * view.zoom), y: view.y - delta.y / (size.height * view.zoom) });
}
export function hitDifference(point, differences, found, size, zoom) {
  const padX = Math.min(0.018, 10 / (size.width * zoom)), padY = Math.min(0.025, 10 / (size.height * zoom));
  return differences.find(d => !found.includes(d.id) && point.x >= d.bounds.x - padX && point.x <= d.bounds.x + d.bounds.width + padX && point.y >= d.bounds.y - padY && point.y <= d.bounds.y + d.bounds.height + padY);
}
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
