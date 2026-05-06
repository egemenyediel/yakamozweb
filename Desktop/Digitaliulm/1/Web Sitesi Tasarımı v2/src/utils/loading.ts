export type LoadingSubscriber = (active: boolean) => void;

let activeCount = 0;
const subs = new Set<LoadingSubscriber>();

function notify() {
  const isActive = activeCount > 0;
  subs.forEach((fn) => {
    try { fn(isActive); } catch {}
  });
}

export function startLoading() {
  activeCount += 1;
  notify();
}

export function endLoading() {
  activeCount = Math.max(0, activeCount - 1);
  notify();
}

export function subscribeLoading(fn: LoadingSubscriber) {
  subs.add(fn);
  // Emit current state immediately
  try { fn(activeCount > 0); } catch {}
  return () => subs.delete(fn);
}
