import React, { useEffect, useMemo, useState } from 'react';
import Header from '../Header';
import Sidebar from '../Sidebar';
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../../assets/style.css';
import { apiFetch, getApiBase, resolveStorageUrl } from '../../../lib/api';
import { ensureCsrfToken } from '../../../lib/csrf';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DashboardContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const center: [number, number] = [1.4402, 125.1828];
  const [reports, setReports] = useState<
    Array<{
      id: number;
      full_name?: string;
      email?: string;
      address: string;
      photo?: string | null;
      admin_photo?: string | null;
      description?: string;
      status: 'pending' | 'process' | 'done';
      created_at: string;
      latitude?: number;
      longitude?: number;
    }>
  >([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<typeof reports[number] | null>(null);
  const [editStatus, setEditStatus] = useState<'pending' | 'process' | 'done'>('pending');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  const [editPhoto, setEditPhoto] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const [userCount, setUserCount] = useState(0);
  const [mapInput, setMapInput] = useState('');
  const [mapError, setMapError] = useState('');
  const [mapMarkers, setMapMarkers] = useState<
    Array<{ id: string; position: [number, number] }>
  >([]);
  const [showReportMarkers, setShowReportMarkers] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const readJsonSafe = async <T,>(response: Response): Promise<T> => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return (await response.json()) as T;
    }
    const text = await response.text();
    throw new Error(text || 'Response bukan JSON');
  };

  useEffect(() => {
    let active = true;
    const ensureAdmin = async () => {
      try {
        const response = await apiFetch('/me', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) {
          window.location.href = '/admin/signin';
          return;
        }
        const data = await readJsonSafe<{ user?: { role?: string } }>(response);
        if (data.user?.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        if (active) setAdminChecked(true);
      } catch {
        window.location.href = '/admin/signin';
      }
    };
    void ensureAdmin();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!adminChecked) return;
    let active = true;
    const fetchReports = async () => {
      try {
        const [reportsResponse, usersResponse] = await Promise.all([
          apiFetch('/reports', {
            credentials: 'include',
            headers: { Accept: 'application/json' },
          }),
          apiFetch('/users/count', {
            credentials: 'include',
            headers: { Accept: 'application/json' },
          }),
        ]);

        if (reportsResponse.ok) {
          const data = await readJsonSafe<typeof reports>(reportsResponse);
          if (active) setReports(data);
        }

        if (usersResponse.ok) {
          const data = await readJsonSafe<{ total?: number }>(usersResponse);
          if (active) setUserCount(typeof data.total === 'number' ? data.total : 0);
        }
      } catch {
        // ignore
      }
    };

    fetchReports();
    const intervalId = window.setInterval(fetchReports, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [adminChecked]);

  useEffect(() => {
    document.body.classList.toggle('lj-no-scroll', detailOpen);
    return () => {
      document.body.classList.remove('lj-no-scroll');
    };
  }, [detailOpen]);

  useEffect(() => {
    return () => {
      if (editPhotoPreview) {
        URL.revokeObjectURL(editPhotoPreview);
      }
    };
  }, [editPhotoPreview]);

  const openDetail = (report: typeof reports[number]) => {
    setActiveReport(report);
    setEditStatus(report.status);
    setEditError('');
    setEditSuccess('');
    setEditPhoto(null);
    setEditPhotoPreview('');
    setDetailOpen(true);
  };

  const handleDelete = async (reportId: number) => {
    const ok = window.confirm('Hapus laporan ini?');
    if (!ok) return;
    try {
      const csrfToken = await ensureCsrfToken(getApiBase());
      const response = await apiFetch(`/reports/${reportId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN': csrfToken },
      });
      if (!response.ok) throw new Error();
      setReports((prev) => prev.filter((item) => item.id !== reportId));
    } catch {
      window.alert('Gagal menghapus laporan.');
    }
  };

  const addMarkerFromCoords = (lat: number, lng: number) => {
    setShowReportMarkers(true);
    setMapMarkers((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, position: [lat, lng] },
    ]);
  };

  const handleAddMarker = () => {
    const raw = mapInput.trim();
    if (!raw) {
      setMapError('Masukkan koordinat terlebih dahulu.');
      return;
    }
    const parts = raw.split(',').map((part) => part.trim());
    if (parts.length < 2) {
      setMapError('Gunakan format: latitude, longitude');
      return;
    }
    const lat = Number.parseFloat(parts[0]);
    const lng = Number.parseFloat(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setMapError('Koordinat tidak valid.');
      return;
    }
    const isClose = (a: number, b: number) => Math.abs(a - b) < 0.000001;
    const existsInManual = mapMarkers.some(
      (marker) => isClose(marker.position[0], lat) && isClose(marker.position[1], lng)
    );
    const existsInReports = reports.some(
      (report) =>
        typeof report.latitude === 'number' &&
        typeof report.longitude === 'number' &&
        isClose(report.latitude, lat) &&
        isClose(report.longitude, lng)
    );
    if (existsInManual) {
      setMapError('Koordinat sudah ada di peta.');
      return;
    }
    if (existsInReports) {
      setShowReportMarkers(true);
      setMapError('');
      return;
    }
    setMapError('');
    addMarkerFromCoords(lat, lng);
  };

  const handleResetMarkers = () => {
    setMapInput('');
    setMapError('');
    setMapMarkers([]);
    setShowReportMarkers(false);
  };

  const handleUpdateStatus = async () => {
    if (!activeReport) return;
    setEditSaving(true);
    setEditError('');
    setEditSuccess('');
    try {
      const csrfToken = await ensureCsrfToken(getApiBase());
      const formData = new FormData();
      formData.append('_method', 'PATCH');
      formData.append('status', editStatus);
      if (editPhoto) {
        formData.append('photo', editPhoto);
      }

      const response = await apiFetch(`/reports/${activeReport.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN': csrfToken },
        body: formData,
      });
      if (!response.ok) {
        const data = await readJsonSafe<{ message?: string }>(response);
        throw new Error(data?.message || 'Gagal memperbarui status');
      }
      const updated = await readJsonSafe<typeof reports[number]>(response);
      setReports((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setActiveReport(updated);
      setEditPhoto(null);
      setEditPhotoPreview('');
      setEditSuccess('Gambar berhasil dikirim.');
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Gagal memperbarui status');
    } finally {
      setEditSaving(false);
    }
  };

  const stats = useMemo(() => {
    const total = reports.length;
    const done = reports.filter((r) => r.status === 'done').length;
    const pending = reports.filter((r) => r.status === 'pending').length;
    return { total, done, pending };
  }, [reports]);

  if (!adminChecked) {
    return null;
  }

  return (
    <div className={`lj-dashboard-page ${sidebarOpen ? '' : 'is-collapsed'}`}>
      <Sidebar />
      <main className="lj-dashboard-main">
        <Header
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <section className="lj-dashboard-content">
          <h1 className="lj-dashboard-title">Dashboard</h1>

          <div className="lj-dashboard-cards">
            <div className="lj-dashboard-card">
              <div className="lj-dashboard-card-icon is-purple" aria-hidden="true">
                <img src="/images/totalLaporan.png" alt="" />
              </div>
              <div>
                <p>Total Laporan</p>
                <h3>{stats.total}</h3>
              </div>
            </div>

            <div className="lj-dashboard-card">
              <div className="lj-dashboard-card-icon is-blue" aria-hidden="true">
                <img src="/images/totalPengguna.png" alt="" />
              </div>
              <div>
                <p>Total Pengguna</p>
                <h3>{userCount}</h3>
              </div>
            </div>

            <div className="lj-dashboard-card">
              <div className="lj-dashboard-card-icon is-green" aria-hidden="true">
                <img src="/images/selesai.png" alt="" />
              </div>
              <div>
                <p>Selesai</p>
                <h3>{stats.done}</h3>
              </div>
            </div>

            <div className="lj-dashboard-card">
              <div className="lj-dashboard-card-icon is-red" aria-hidden="true">
                <img src="/images/belumDitangani.png" alt="" />
              </div>
              <div>
                <p>Belum Ditangani</p>
                <h3>{stats.pending}</h3>
              </div>
            </div>
          </div>

          <div className="lj-dashboard-panel">
            <table className="lj-dashboard-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '24px 0' }}>
                      Belum ada laporan.
                    </td>
                  </tr>
                ) : (
                  reports.map((report, index) => (
                    <tr key={report.id}>
                      <td>{index + 1}</td>
                      <td>{report.full_name || '-'}</td>
                      <td>{new Date(report.created_at).toLocaleDateString('id-ID')}</td>
                      <td>
                        <span
                          className={`lj-badge ${
                            report.status === 'pending'
                              ? 'is-danger'
                              : report.status === 'process'
                                ? 'is-warning'
                                : 'is-success'
                          }`}
                        >
                          {report.status === 'pending'
                            ? 'Pending'
                            : report.status === 'process'
                              ? 'In Progress'
                              : 'Completed'}
                        </span>
                      </td>
                      <td>
                        <div className="lj-action">
                          <button type="button" aria-label="Edit" onClick={() => openDetail(report)}>
                            <img src="/images/tabler_edit-filled.png" alt="" />
                          </button>
                          <button
                            type="button"
                            aria-label="Delete"
                            onClick={() => handleDelete(report.id)}
                          >
                            <img src="/images/mdi_trash.png" alt="" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="lj-dashboard-panel">
            <h2 className="lj-dashboard-subtitle">Peta Lokasi Jalan</h2>
            <div className="lj-dashboard-map-tools">
              <div className="lj-dashboard-map-field">
                <label htmlFor="dashboard-coords">Lokasi (lat, lng)</label>
                <input
                  id="dashboard-coords"
                  type="text"
                  placeholder="Contoh: 1.4402, 125.1828"
                  value={mapInput}
                  onChange={(event) => setMapInput(event.target.value)}
                />
              </div>
              <button
                type="button"
                className="lj-modal-btn lj-dashboard-map-btn"
                onClick={handleAddMarker}
              >
                Masukan Koordinat
              </button>
              <button
                type="button"
                className="lj-modal-btn is-ghost lj-dashboard-map-btn"
                onClick={handleResetMarkers}
              >
                Reset
              </button>
            </div>

            {mapError ? <div className="lj-dashboard-map-error">{mapError}</div> : null}

            <div className="lj-dashboard-map">
              <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                className="lj-dashboard-map-leaflet"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {showReportMarkers
                  ? reports
                      .filter(
                        (report) =>
                          typeof report.latitude === 'number' &&
                          !Number.isNaN(report.latitude) &&
                          typeof report.longitude === 'number' &&
                          !Number.isNaN(report.longitude)
                      )
                      .map((report) => (
                        <CircleMarker
                          key={`report-${report.id}`}
                          center={[report.latitude as number, report.longitude as number]}
                          radius={7}
                          pathOptions={{
                            color: '#1e293b',
                            weight: 2,
                            fillColor: '#2563eb',
                            fillOpacity: 0.95,
                          }}
                        >
                          <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                            {report.full_name || 'Laporan'} ({report.latitude}, {report.longitude})
                          </Tooltip>
                        </CircleMarker>
                      ))
                  : null}

                {mapMarkers.map((marker) => (
                  <CircleMarker
                    key={marker.id}
                    center={marker.position as [number, number]}
                    radius={8}
                    pathOptions={{
                      color: '#7f1d1d',
                      weight: 2,
                      fillColor: '#ef4444',
                      fillOpacity: 0.9,
                    }}
                  />
                ))}
              </MapContainer>
            </div>
          </div>
        </section>
      </main>

      {detailOpen && activeReport ? (
        <div className="lj-modal-backdrop" role="dialog" aria-modal="true">
          <div className="lj-modal lj-report-detail">
            <div className="lj-modal-title lj-report-detail-title">Detail Laporan</div>
            <div className="lj-report-detail-card">
              <div className="lj-report-detail-meta">
                <div>
                  <strong>Nama:</strong> {activeReport.full_name || '-'}
                </div>
                <div>
                  <strong>Email:</strong> {activeReport.email || '-'}
                </div>
                <div>
                  <strong>Tanggal:</strong>{' '}
                  {new Date(activeReport.created_at).toLocaleDateString('id-ID')}
                </div>
              </div>

              <div className="lj-report-detail-content">
                <div className="lj-report-detail-photo-block">
                  <div className="lj-report-detail-photo">
                    {activeReport.photo ? (
                      <img src={resolveStorageUrl(activeReport.photo)} alt="Foto laporan" />
                    ) : (
                      <div className="lj-report-detail-photo-fallback">IMG</div>
                    )}
                  </div>

                  <label className="lj-report-detail-upload">
                    <span>Upload gambar untuk dipantau pengguna</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.currentTarget.files?.[0] || null;
                        setEditPhoto(file);
                        if (file) {
                          const url = URL.createObjectURL(file);
                          setEditPhotoPreview(url);
                        } else {
                          setEditPhotoPreview('');
                        }
                      }}
                    />
                  </label>

                  {editPhotoPreview ? (
                    <div className="lj-report-detail-admin-preview">
                      <div className="lj-report-detail-admin-label">Preview Foto Admin</div>
                      <img src={editPhotoPreview} alt="Preview foto admin" />
                    </div>
                  ) : activeReport.admin_photo ? (
                    <div className="lj-report-detail-admin-preview">
                      <div className="lj-report-detail-admin-label">Foto Admin</div>
                      <img src={resolveStorageUrl(activeReport.admin_photo)} alt="Foto admin" />
                    </div>
                  ) : null}

                  {editSuccess ? (
                    <div className="lj-report-detail-success">{editSuccess}</div>
                  ) : null}
                </div>

                <div className="lj-report-detail-info">
                  <div>
                    <strong>Lokasi:</strong> {activeReport.address}
                  </div>
                  <div>
                    <strong>Koordinat:</strong>{' '}
                    {activeReport.latitude && activeReport.longitude
                      ? `${activeReport.latitude}, ${activeReport.longitude}`
                      : '-'}
                  </div>
                  <div>
                    <strong>Keterangan:</strong> {activeReport.description || '-'}
                  </div>
                  <label className="lj-report-detail-status">
                    <span>Status</span>
                    <select
                      value={editStatus}
                      onChange={(event) =>
                        setEditStatus(event.target.value as 'pending' | 'process' | 'done')
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="process">In Progress</option>
                      <option value="done">Completed</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            {editError ? <div className="lj-report-detail-error">{editError}</div> : null}

            <div className="lj-modal-actions">
              <button
                type="button"
                className="lj-modal-btn is-ghost"
                onClick={() => setDetailOpen(false)}
              >
                Tutup
              </button>
              <button type="button" className="lj-modal-btn" onClick={handleUpdateStatus}>
                {editSaving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DashboardContent;
