// The app lives on live client state (snapshot + WebSocket): rendering it on the server would
// only duplicate work and risk hydration mismatches on clocks and presence.
export const ssr = false;
