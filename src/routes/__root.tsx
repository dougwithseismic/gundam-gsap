import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { useEffect, useState } from "react";
import { ScrambleCoordinates } from "../features/scramble-effect/scramble-coordinates";

export const Route = createRootRoute({
  component: () => <Root />,
});

function Root() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ipInfo, setIpInfo] = useState({
    ip: "127.0.0.1",
    lat: 52.111,
    lon: 21.0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Fetch IP and location info
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        setIpInfo({
          ip: data.ip,
          lat: data.latitude,
          lon: data.longitude,
        });
      })
      .catch(console.error);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background text-xs text-text uppercase">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 px-4 py-4 font-mono">
        <div className="flex items-start justify-between">
          <span className="text-text-muted">
            [WS_TERMINAL//UNIT:{ipInfo.ip}]
          </span>
          <div className="flex flex-col items-end gap-1">
            <span className="text-text-muted">
              [MOBILE_SUIT_STATUS: ACTIVE]
            </span>
            <ScrambleCoordinates lat={ipInfo.lat} lon={ipInfo.lon} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-neutral-800 bg-primary px-6 py-3 font-mono">
        <div className="flex items-center justify-between">
          <span className="text-text-muted">[OPERATION_METEOR: STANDBY]</span>
          <span className="text-text-muted">
            [SYSTEM_TIME:
            {currentTime
              .toLocaleString(undefined, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
                timeZoneName: "shortOffset",
              })
              .replace(/[/,]/g, ".")}
            ]
          </span>
        </div>
      </footer>
      <TanStackRouterDevtools />
    </div>
  );
}
