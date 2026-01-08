// SockJS (and some legacy libs) expect "global" in browser builds.
(window as any).global = window;
