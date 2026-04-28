import React, { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  apiFetch,
  getApiBase,
  isApiHtmlFallbackResponse,
} from "../../../lib/api";
import {
  AUTH_USER_CHANGED_EVENT,
  clearStoredUser,
  readStoredUser,
  writeStoredUser,
} from "../../../lib/auth";
import { ensureCsrfToken } from "../../../lib/csrf";
import StorageImage from "../../Shared/StorageImage";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const defaultMarkerIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MAP_MARKERS_STORAGE_PREFIX = "lj-map-markers";

const getMarkerStorageKey = (user: { id?: number; email?: string } | null) => {
  if (!user) return null;
  if (typeof user.id === "number")
    return `${MAP_MARKERS_STORAGE_PREFIX}:user:${user.id}`;

  const normalizedEmail = user.email?.trim().toLowerCase();
  if (normalizedEmail)
    return `${MAP_MARKERS_STORAGE_PREFIX}:email:${normalizedEmail}`;

  return null;
};

const MAP: React.FC = () => {
  const center: [number, number] = [1.4402, 125.1828];
  const [markers, setMarkers] = useState<
    Array<{
      id: string;
      position: [number, number];
      address?: string;
      loading?: boolean;
      error?: string;
    }>
  >([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [user, setUser] = useState<{
    id?: number;
    full_name?: string;
    email?: string;
  } | null>(() => readStoredUser());
  const [reportLocation, setReportLocation] = useState("");
  const [reportLat, setReportLat] = useState<number | null>(null);
  const [reportLng, setReportLng] = useState<number | null>(null);
  const [reportError, setReportError] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [statusItems, setStatusItems] = useState<
    Array<{
      id: number;
      full_name?: string;
      email?: string;
      photo?: string;
      admin_photo?: string;
      address?: string;
      description?: string;
      status?: string;
      created_at?: string;
    }>
  >([]);
  const markerStorageKey = getMarkerStorageKey(user);

  const readJsonSafe = async <T,>(response: Response): Promise<T> => {
    const contentType = response.headers.get("content-type") || "";
    if (isApiHtmlFallbackResponse(response)) {
      throw new Error(
        "Endpoint status laporan mengarah ke halaman web, bukan API.",
      );
    }
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    const text = await response.text();
    throw new Error(text || "Response bukan JSON");
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await apiFetch("/me", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          clearStoredUser();
          setUser(null);
          return;
        }
        const data = (await response.json()) as {
          user?: {
            id?: number;
            name?: string;
            username?: string;
            email?: string;
            full_name?: string;
          };
        };
        writeStoredUser(data.user || null);
        setUser(data.user || null);
      } catch {
        setUser(readStoredUser());
      }
    };
    void loadUser();
  }, []);

  useEffect(() => {
    const syncUser = (event: Event) => {
      const detail = (event as CustomEvent<typeof user>).detail;
      setUser(detail ?? readStoredUser());
    };

    window.addEventListener(AUTH_USER_CHANGED_EVENT, syncUser as EventListener);
    return () => {
      window.removeEventListener(
        AUTH_USER_CHANGED_EVENT,
        syncUser as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    setHydrated(false);

    if (!markerStorageKey) {
      setMarkers([]);
      setActiveId(null);
      setHydrated(true);
      return;
    }

    const stored = localStorage.getItem(markerStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Array<{
          id: string;
          position: [number, number];
          address?: string;
          loading?: boolean;
          error?: string;
        }>;
        if (Array.isArray(parsed)) {
          setMarkers(parsed);
          setActiveId(null);
          setHydrated(true);
          return;
        }
      } catch {
        localStorage.removeItem(markerStorageKey);
      }
    }

    setMarkers([]);
    setActiveId(null);
    setHydrated(true);
  }, [markerStorageKey]);

  useEffect(() => {
    if (!hydrated || !markerStorageKey) return;
    localStorage.setItem(markerStorageKey, JSON.stringify(markers));
  }, [markers, hydrated, markerStorageKey]);

  useEffect(() => {
    document.body.classList.toggle("lj-no-scroll", isFullscreen);
    return () => document.body.classList.remove("lj-no-scroll");
  }, [isFullscreen]);

  useEffect(() => {
    const shouldLock = reportOpen || statusOpen;
    document.body.classList.toggle("lj-no-scroll", shouldLock);
    return () => {
      document.body.classList.remove("lj-no-scroll");
    };
  }, [reportOpen, statusOpen]);

  const formatStatus = (status?: string) => {
    if (status === "process") return "In Progress";
    if (status === "done") return "Completed";
    return "Pending";
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const fetchAddress = async (id: string, position: [number, number]) => {
    setMarkers((prev) =>
      prev.map((marker) =>
        marker.id === id
          ? { ...marker, loading: true, error: undefined }
          : marker,
      ),
    );

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position[0]}&lon=${position[1]}`,
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil alamat");
      }

      const data = (await response.json()) as { display_name?: string };
      setMarkers((prev) =>
        prev.map((marker) =>
          marker.id === id
            ? {
                ...marker,
                loading: false,
                address: data.display_name || "Alamat tidak ditemukan",
              }
            : marker,
        ),
      );
    } catch {
      setMarkers((prev) =>
        prev.map((marker) =>
          marker.id === id
            ? { ...marker, loading: false, error: "Tidak bisa memuat alamat" }
            : marker,
        ),
      );
    }
  };

  const MapClickHandler: React.FC = () => {
    useMapEvents({
      click(event) {
        const newMarker = {
          id: `${Date.now()}-${Math.random()}`,
          position: [event.latlng.lat, event.latlng.lng] as [number, number],
        };
        setMarkers((prev) => [...prev, newMarker]);
        setActiveId(newMarker.id);
        fetchAddress(newMarker.id, newMarker.position);
      },
    });

    return null;
  };

  const activeMarker = activeId
    ? markers.find((marker) => marker.id === activeId)
    : null;

  useEffect(() => {
    if (!activeMarker) return;
    setReportLat(activeMarker.position[0]);
    setReportLng(activeMarker.position[1]);

    if (activeMarker.address) {
      setReportLocation(activeMarker.address);
      return;
    }

    setReportLocation(
      `${activeMarker.position[0]}, ${activeMarker.position[1]}`,
    );
  }, [activeMarker]);

  useEffect(() => {
    if (user) return;

    setMarkers([]);
    setActiveId(null);
    setReportOpen(false);
    setStatusOpen(false);
    setStatusItems([]);
    setReportLocation("");
    setReportLat(null);
    setReportLng(null);
    setReportError("");
  }, [user]);

  return (
    <section className="lj-map" id="peta">
      <div className="lj-container lj-map-inner">
        <div className="lj-map-header">
          <h2>Peta Interaktif</h2>
          <p>
            Temukan sebaran laporan jalan rusak untuk membantu pemantauan
            kondisi secara lebih akurat.
          </p>
        </div>

        <div className="lj-map-actions">
          <button
            className="lj-map-btn lj-map-btn--primary"
            type="button"
            onClick={() => {
              if (!user) {
                setAuthNotice("Harus sign in dulu untuk melaporkan masalah.");
                window.setTimeout(() => setAuthNotice(""), 3000);
                return;
              }

              if (!activeMarker) {
                setReportError("Pilih titik di peta terlebih dahulu.");
                setReportOpen(true);
                return;
              }

              if (activeMarker.address) {
                setReportLocation(activeMarker.address);
              } else {
                setReportLocation(
                  `${activeMarker.position[0]}, ${activeMarker.position[1]}`,
                );
              }

              setReportLat(activeMarker.position[0]);
              setReportLng(activeMarker.position[1]);
              setReportError("");
              setReportOpen(true);
            }}
          >
            <span className="lj-map-icon" aria-hidden="true">
              <img src="/images/Add.png" alt="" />
            </span>
            Laporkan Masalah
          </button>

          <button
            className="lj-map-btn lj-map-btn--ghost"
            type="button"
            onClick={async () => {
              if (!user) {
                setAuthNotice("Harus sign in dulu untuk cek status laporan.");
                window.setTimeout(() => setAuthNotice(""), 3000);
                return;
              }

              setStatusOpen(true);
              setStatusLoading(true);
              setStatusError("");

              try {
                const meResponse = await apiFetch("/me", {
                  credentials: "include",
                  headers: { Accept: "application/json" },
                });

                if (!meResponse.ok) {
                  clearStoredUser();
                  setUser(null);
                  throw new Error(
                    "Sesi login user tidak aktif. Silakan sign in lagi.",
                  );
                }

                const meData = await readJsonSafe<{
                  user?: {
                    id?: number;
                    full_name?: string;
                    email?: string;
                  };
                }>(meResponse);

                if (meData.user) {
                  writeStoredUser(meData.user);
                  setUser(meData.user);
                }

                const response = await apiFetch("/reports", {
                  credentials: "include",
                  headers: { Accept: "application/json" },
                });

                if (!response.ok) {
                  const data = await readJsonSafe<{ message?: string }>(
                    response,
                  );
                  throw new Error(data?.message || "Gagal memuat laporan");
                }

                const data = await readJsonSafe<
                  Array<{
                    id: number;
                    full_name?: string;
                    email?: string;
                    photo?: string;
                    admin_photo?: string;
                    address?: string;
                    description?: string;
                    status?: string;
                    created_at?: string;
                  }>
                >(response);

                const email = user.email?.toLowerCase();
                const filtered = data.filter((item) => {
                  if (email && item.email?.toLowerCase() === email) return true;
                  if (
                    user.full_name &&
                    item.full_name?.toLowerCase() ===
                      user.full_name.toLowerCase()
                  ) {
                    return true;
                  }
                  return false;
                });

                setStatusItems(filtered);
              } catch (err) {
                setStatusError(
                  err instanceof Error ? err.message : "Gagal memuat laporan",
                );
              } finally {
                setStatusLoading(false);
              }
            }}
          >
            <span className="lj-map-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation">
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M16.5 16.5L21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            Cek Status
          </button>

          <button
            className="lj-map-btn lj-map-btn--ghost"
            type="button"
            onClick={() => setIsFullscreen(true)}
          >
            Buka Peta Full
          </button>
        </div>

        <div className="lj-map-card">
          <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={false}
            className="lj-map-leaflet"
          >
            <MapClickHandler />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={marker.position as LatLngExpression}
                icon={defaultMarkerIcon}
                eventHandlers={{
                  click: () => {
                    setActiveId(marker.id);
                    if (!marker.address && !marker.loading && !marker.error) {
                      fetchAddress(marker.id, marker.position);
                    }
                  },
                }}
              />
            ))}
          </MapContainer>
        </div>

        {activeMarker && (
          <div className="lj-map-detail-panel">
            <div className="lj-map-detail-header">
              <h3>Detail Alamat</h3>
              <button
                className="lj-map-detail-close"
                type="button"
                aria-label="Tutup detail"
                onClick={() => {
                  if (activeMarker) {
                    setMarkers((prev) =>
                      prev.filter((marker) => marker.id !== activeMarker.id),
                    );
                  }
                  setActiveId(null);
                }}
              >
                x
              </button>
            </div>

            {activeMarker.loading && <p>Memuat alamat...</p>}
            {!activeMarker.loading && activeMarker.error && (
              <p>{activeMarker.error}</p>
            )}
            {!activeMarker.loading &&
              !activeMarker.error &&
              activeMarker.address && <p>{activeMarker.address}</p>}
            {!activeMarker.loading &&
              !activeMarker.error &&
              !activeMarker.address && <p>Alamat belum tersedia.</p>}
          </div>
        )}
      </div>

      {isFullscreen && (
        <div className="lj-map-fullscreen" role="dialog" aria-modal="true">
          <div className="lj-map-fullscreen-header">
            <h3>Peta Interaktif</h3>
            <button
              className="lj-map-fullscreen-close"
              type="button"
              onClick={() => setIsFullscreen(false)}
            >
              Tutup
            </button>
          </div>

          <div className="lj-map-fullscreen-body">
            <MapContainer
              center={center}
              zoom={13}
              scrollWheelZoom
              className="lj-map-leaflet-full"
            >
              <MapClickHandler />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {markers.map((marker) => (
                <Marker
                  key={`full-${marker.id}`}
                  position={marker.position as LatLngExpression}
                  icon={defaultMarkerIcon}
                  eventHandlers={{
                    click: () => {
                      setActiveId(marker.id);
                      if (!marker.address && !marker.loading && !marker.error) {
                        fetchAddress(marker.id, marker.position);
                      }
                    },
                  }}
                />
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      {reportOpen && (
        <div className="lj-modal-backdrop" role="dialog" aria-modal="true">
          <div className="lj-modal lj-report-modal">
            <div className="lj-modal-title">Form Laporan Jalan</div>
            <form
              className="lj-report-form"
              onSubmit={async (event) => {
                event.preventDefault();

                if (reportLat == null || reportLng == null) {
                  setReportError("Lokasi dari peta belum dipilih.");
                  return;
                }

                setReportSubmitting(true);
                setReportError("");
                setReportSuccess("");

                try {
                  const form = event.currentTarget;
                  const formData = new FormData(form);
                  formData.append("latitude", String(reportLat));
                  formData.append("longitude", String(reportLng));

                  const csrfToken = await ensureCsrfToken(getApiBase());
                  const response = await apiFetch("/reports", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                      Accept: "application/json",
                      "X-XSRF-TOKEN": csrfToken,
                    },
                    body: formData,
                  });

                  if (!response.ok) {
                    const data = await readJsonSafe<{ message?: string }>(
                      response,
                    );
                    throw new Error(data?.message || "Gagal mengirim laporan");
                  }

                  setReportSuccess("Laporan berhasil dikirim.");
                  setReportOpen(false);
                  window.setTimeout(() => setReportSuccess(""), 3000);
                } catch (err) {
                  setReportError(
                    err instanceof Error
                      ? err.message
                      : "Gagal mengirim laporan",
                  );
                } finally {
                  setReportSubmitting(false);
                }
              }}
            >
              <label className="lj-report-field">
                <span>Nama</span>
                <input
                  type="text"
                  value={user?.full_name || ""}
                  readOnly
                />
              </label>

              <label className="lj-report-field">
                <span>Email</span>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                />
              </label>

              <label className="lj-report-field">
                <span>Lokasi Jalan</span>
                <input
                  type="text"
                  name="address"
                  placeholder="Masukkan lokasi jalan"
                  value={reportLocation}
                  onChange={(event) => setReportLocation(event.target.value)}
                  required
                />
              </label>

              <label className="lj-report-field">
                <span>Foto</span>
                <input type="file" name="photo" accept="image/*" />
              </label>

              <label className="lj-report-field">
                <span>Deskripsi</span>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Deskripsikan masalah"
                  required
                />
              </label>

              <div className="lj-modal-actions">
                <button
                  type="button"
                  className="lj-modal-btn is-ghost"
                  onClick={() => setReportOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="lj-modal-btn"
                  disabled={reportSubmitting}
                >
                  {reportSubmitting ? "Mengirim..." : "Kirim"}
                </button>
              </div>

              {reportError ? (
                <div className="lj-report-error">{reportError}</div>
              ) : null}
            </form>
          </div>
        </div>
      )}

      {reportSuccess ? (
        <div className="lj-toast" role="status">
          {reportSuccess}
        </div>
      ) : null}

      {authNotice ? (
        <div className="lj-toast" role="status">
          {authNotice}
        </div>
      ) : null}

      {statusOpen && (
        <div className="lj-modal-backdrop" role="dialog" aria-modal="true">
          <div className="lj-modal lj-status-modal">
            <div className="lj-status-header">
              <div>
                <div className="lj-modal-title">Status Laporan</div>
                <div className="lj-status-subtitle">
                  Ringkasan laporan terbaru
                </div>
              </div>
              <button
                className="lj-status-close"
                type="button"
                onClick={() => setStatusOpen(false)}
              >
                Tutup
              </button>
            </div>

            {statusLoading ? (
              <div className="lj-status-loading">Memuat data...</div>
            ) : null}

            {!statusLoading && statusError ? (
              <div className="lj-report-error">{statusError}</div>
            ) : null}

            {!statusLoading && !statusError ? (
              <div className="lj-status-list">
                {statusItems.length === 0 ? (
                  <div className="lj-status-empty">
                    Belum ada laporan yang tercatat untuk akun ini.
                  </div>
                ) : (
                  statusItems.map((item) => (
                    <div className="lj-status-card" key={item.id}>
                      <div className="lj-status-card-top">
                        <div className="lj-status-user">
                          <div className="lj-status-user-name">
                            {item.full_name || user?.full_name || "Pengguna"}
                          </div>
                          <div className="lj-status-address">
                            {item.address || "Alamat belum ada"}
                          </div>
                        </div>

                        <div className="lj-status-side">
                          <span
                            className={`lj-status-badge is-${item.status || "pending"}`}
                          >
                            {formatStatus(item.status)}
                          </span>
                          <div className="lj-status-meta">
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="lj-status-card-body">
                        <div className="lj-status-photo">
                          {item.photo ? (
                            <StorageImage src={item.photo} alt="Foto laporan" />
                          ) : (
                            <div className="lj-status-photo-fallback">IMG</div>
                          )}
                        </div>

                        {item.description ? (
                          <div className="lj-status-desc">
                            {item.description}
                          </div>
                        ) : (
                          <div className="lj-status-desc">
                            Deskripsi belum tersedia.
                          </div>
                        )}

                        {item.admin_photo ? (
                          <div className="lj-status-admin-photo">
                            <div className="lj-status-admin-label">
                              Foto Admin
                            </div>
                            <StorageImage
                              src={item.admin_photo}
                              alt="Foto admin"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
};

export default MAP;
