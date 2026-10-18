"use client";

import { useEffect, useRef, useMemo } from "react";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Prevent Leaflet from crashing if an animation frame or teardown runs on a detached element
if (typeof window !== "undefined" && L && L.DomUtil) {
  const origGetPos = L.DomUtil.getPosition;

  L.DomUtil.getPosition = function (el: HTMLElement) {
    if (!el) return new L.Point(0, 0);

    return origGetPos.call(this, el);
  };
}

import {
  MapPin,
  Maximize2,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { SourcedHousingOption } from "@/types/sourced-housing";

import {
  getPropertyLocation,
  PropertyLocation,
  UGA_CAMPUS_CENTER,
} from "@/lib/housing-locations";

interface Props {
  optionA?: SourcedHousingOption | null;
  optionB?: SourcedHousingOption | null;
  scenarioAName?: string;
  scenarioBName?: string;
  className?: string;
}

type OptionLetter = "A" | "B";

const OPTION_COLORS: Record<OptionLetter, string> = {
  A: "#BA0C2F",
  B: "#2563EB",
};

const SINGLE_MARKER_ZOOM = 15;
const FIT_PADDING: L.PointTuple = [60, 60];

// Escapes text before interpolating it into Leaflet's HTML strings.
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Teardrop pin with the option letter and the property name in a box below
function createMarkerIcon(letter: OptionLetter, propertyName: string) {
  const color = OPTION_COLORS[letter];
  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -42px); pointer-events: auto;">
      <svg width="32" height="42" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));">
        <path d="M18 0C8.05888 0 0 8.05888 0 18C0 28.5 15.5 44 17.1 45.5C17.6 46 18.4 46 18.9 45.5C20.5 44 36 28.5 36 18C36 8.05888 27.9411 0 18 0Z" fill="${color}"/>
        <circle cx="18" cy="18" r="13" fill="#ffffff"/>
        <text x="18" y="23" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" fill="${color}" text-anchor="middle">${letter}</text>
      </svg>
      <div class="custom-marker-box" style="margin-top: 3px; padding: 2.5px 8px; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.22); font-size: 11px; font-weight: 700; white-space: nowrap; max-width: 170px; overflow: hidden; text-overflow: ellipsis; text-align: center;">
        ${escapeHtml(propertyName)}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-map-title-marker",
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -42],
  });
}

function createPopupHtml(
  letter: OptionLetter,
  loc: PropertyLocation,
  configuration?: string,
) {
  const categoryLabel =
    loc.category === "on_campus" ? "On-Campus" : "Off-Campus";

  return `
    <div style="font-family: inherit; padding: 4px 2px; min-width: 180px;">
      <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
        <span style="background: ${OPTION_COLORS[letter]}; color: #fff; font-weight: 700; font-size: 11px; padding: 2px 7px; border-radius: 9999px;">
          Option ${letter}
        </span>
        <span class="popup-sub" style="font-size: 11px; font-weight: 600; text-transform: uppercase;">
          ${categoryLabel}
        </span>
      </div>
      <div class="popup-title" style="font-size: 14px; font-weight: 700; line-height: 1.3; margin-bottom: 3px;">
        ${escapeHtml(loc.propertyName)}
      </div>
      ${
        configuration
          ? `<div class="popup-conf" style="font-size: 12px; margin-bottom: 4px;">${escapeHtml(configuration)}</div>`
          : ""
      }
      ${
        loc.address
          ? `<div class="popup-addr" style="font-size: 11px; margin-top: 4px; padding-top: 4px;">${escapeHtml(loc.address)}</div>`
          : ""
      }
    </div>
  `;
}

// Frames the given points: both, one, or the campus overview when empty.
function frameLocations(map: L.Map, points: L.LatLngTuple[]) {
  map.stop();
  if (points.length >= 2) {
    map.fitBounds(L.latLngBounds(points), {
      padding: FIT_PADDING,
      maxZoom: SINGLE_MARKER_ZOOM,
      animate: true,
    });
  } else if (points.length === 1) {
    map.setView(points[0], SINGLE_MARKER_ZOOM, { animate: true });
  } else {
    map.setView(
      [UGA_CAMPUS_CENTER.lat, UGA_CAMPUS_CENTER.lng],
      UGA_CAMPUS_CENTER.defaultZoom,
      { animate: false },
    );
  }
}

export default function HousingLocationMapClient({
  optionA,
  optionB,
  scenarioAName,
  scenarioBName,
  className = "",
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const locationA = useMemo(() => getPropertyLocation(optionA), [optionA]);
  const locationB = useMemo(() => getPropertyLocation(optionB), [optionB]);

  const points = useMemo(
    () =>
      [locationA, locationB]
        .filter((loc): loc is PropertyLocation => Boolean(loc))
        .map((loc): L.LatLngTuple => [loc.lat, loc.lng]),
    [locationA, locationB],
  );

  const isMissingA = Boolean(scenarioAName?.trim()) && !locationA;
  const isMissingB = Boolean(scenarioBName?.trim()) && !locationB;
  const hasAnyMarker = points.length > 0;

  // Initialize map once
  useEffect(() => {
    const container = mapContainerRef.current;

    if (!container || mapInstanceRef.current) return;

    const map = L.map(container, {
      center: [UGA_CAMPUS_CENTER.lat, UGA_CAMPUS_CENTER.lng],
      zoom: UGA_CAMPUS_CENTER.defaultZoom,
      zoomControl: false,
      scrollWheelZoom: false, // Don't hijack page scrolling
      attributionControl: true,
    });

    map.attributionControl.setPosition("bottomright");
    L.control.zoom({ position: "topright" }).addTo(map);

    // Standard OpenStreetMap tiles (no API key required)
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Keep the map sized correctly when layout, tabs or breakpoints change
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      try {
        map.stop();
        map.closePopup();
        markersGroupRef.current?.clearLayers();
        map.remove();
      } catch {
        // Prevent unmount exceptions if map was already cleared
      }
      mapInstanceRef.current = null;
      markersGroupRef.current = null;
    };
  }, []);

  // Update markers and viewport framing when selections change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    if (!map || !markersGroup) return;

    try {
      map.closePopup();
      map.stop();
      markersGroup.clearLayers();
    } catch {
      // Ignore if layers were already cleared
    }

    (
      [
        { letter: "A", loc: locationA, option: optionA, zIndexOffset: 100 },
        { letter: "B", loc: locationB, option: optionB, zIndexOffset: 90 },
      ] as const
    ).forEach(({ letter, loc, option, zIndexOffset }) => {
      if (!loc) return;

      L.marker([loc.lat, loc.lng], {
        icon: createMarkerIcon(letter, loc.propertyName),
        title: `Option ${letter}: ${loc.propertyName}`,
        zIndexOffset,
      })
        .bindPopup(createPopupHtml(letter, loc, option?.configuration), {
          closeButton: false,
          offset: [0, 0],
        })
        .addTo(markersGroup);
    });

    frameLocations(map, points);
  }, [locationA, locationB, optionA, optionB, points]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      frameLocations(mapInstanceRef.current, points);
    }
  };

  return (
    <div className={`relative flex flex-col w-full ${className}`}>
      {/* Top Map Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-surface border-b border-separator/30 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-primary shrink-0" />
          <span className="font-semibold text-foreground">
            Housing Locations
          </span>
          {hasAnyMarker ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              <CheckCircle2 className="size-3" />
              {points.length === 2 ? "Both Options Mapped" : "1 Option Mapped"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-default-100 text-default-500">
              Athens &amp; UGA Campus Overview
            </span>
          )}
          {(isMissingA || isMissingB) && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-warning-500/10 text-warning-600">
              <AlertCircle className="size-3" />
              {isMissingA && isMissingB
                ? "Location data unavailable for both options"
                : isMissingA
                  ? "Location data unavailable for Option A"
                  : "Location data unavailable for Option B"}
            </span>
          )}
        </div>

        <button
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-default-600 hover:text-foreground hover:bg-default-100 transition-colors cursor-pointer border border-separator/30"
          title="Reset map view to framed locations or campus"
          type="button"
          onClick={handleResetView}
        >
          <Maximize2 className="size-3.5" />
          Frame Locations
        </button>
      </div>

      {/* Map Viewport Container */}
      <div className="relative w-full h-[340px] sm:h-[400px] lg:h-[430px] bg-default-100">
        <style>{`
          .custom-map-title-marker {
            background: transparent !important;
            border: none !important;
          }
          .custom-marker-box {
            background: #ffffff;
            color: #09090b;
            border: 1.5px solid #d4d4d8;
          }
          .popup-sub { color: #64748b; }
          .popup-title { color: #0f172a; }
          .popup-conf { color: #475569; }
          .popup-addr { color: #64748b; border-top: 1px solid #e2e8f0; }

          :is(.dark *) .custom-marker-box,
          .dark .custom-marker-box {
            background: #18181b !important;
            color: #f4f4f5 !important;
            border-color: #3f3f46 !important;
          }
          :is(.dark *) .leaflet-tile-pane,
          .dark .leaflet-tile-pane {
            filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%);
          }
          :is(.dark *) .leaflet-popup-content-wrapper,
          :is(.dark *) .leaflet-popup-tip,
          .dark .leaflet-popup-content-wrapper,
          .dark .leaflet-popup-tip {
            background: #18181b !important;
            color: #f4f4f5 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
          }
          :is(.dark *) .leaflet-control-zoom a,
          .dark .leaflet-control-zoom a {
            background-color: #18181b !important;
            color: #f4f4f5 !important;
            border-color: rgba(255, 255, 255, 0.15) !important;
          }
          :is(.dark *) .leaflet-control-zoom a:hover,
          .dark .leaflet-control-zoom a:hover {
            background-color: #27272a !important;
          }
          :is(.dark *) .leaflet-control-attribution,
          .dark .leaflet-control-attribution {
            background: rgba(24, 24, 27, 0.8) !important;
            color: #a1a1aa !important;
          }
          :is(.dark *) .leaflet-control-attribution a,
          .dark .leaflet-control-attribution a {
            color: #60a5fa !important;
          }
          :is(.dark *) .popup-sub,
          .dark .popup-sub { color: #94a3b8 !important; }
          :is(.dark *) .popup-title,
          .dark .popup-title { color: #f1f5f9 !important; }
          :is(.dark *) .popup-conf,
          .dark .popup-conf { color: #94a3b8 !important; }
          :is(.dark *) .popup-addr,
          .dark .popup-addr { color: #94a3b8 !important; border-top-color: #334155 !important; }
        `}</style>
        {/* className must stay static: React would overwrite Leaflet's own classes */}
        <div
          ref={mapContainerRef}
          className="w-full h-full z-0 outline-none"
          style={{ minHeight: "340px" }}
        />

        {/* Hint overlay when nothing is selected */}
        {!hasAnyMarker && !isMissingA && !isMissingB && (
          <div className="absolute top-4 left-4 z-[400] max-w-xs bg-surface/90 backdrop-blur-md border border-separator/40 rounded-xl p-3 shadow-md text-xs text-default-600">
            <div className="flex items-start gap-2">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-0.5">
                  Select Housing to Compare
                </p>
                <p>Choose sourced properties above to see where they are.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
