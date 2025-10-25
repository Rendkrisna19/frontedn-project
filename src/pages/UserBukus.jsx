import React, { useEffect, useMemo, useState } from "react";
import api from "../api";

export default function UserBooks() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 12 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function fetchData(p = 1, query = "") {
  setLoading(true);
  setErr("");
  try {
    const url = `/books?page=${p}&per_page=24${query ? `&q=${encodeURIComponent(query)}` : ""}`;
    const { data } = await api.get(url);

    setItems(data.data || []);
    setMeta({
      current_page: data?.meta?.current_page ?? p,
      last_page:    data?.meta?.last_page ?? 1,
      per_page:     data?.meta?.per_page ?? 24,
      total:        data?.meta?.total ?? 0,
    });
    setPage(data?.meta?.current_page ?? p);
  } catch {
    setErr("Gagal memuat data buku. Pastikan backend aktif & rute /api/books publik.");
    setItems([]);
    setMeta({ current_page: 1, last_page: 1, per_page: 24, total: 0 });
    setPage(1);
  } finally {
    setLoading(false);
  }
}

  useEffect(() => { fetchData(1, ""); }, []);

  // buat deret halaman (maks 7 tombol): 1 ... mid ... last
  const pages = useMemo(() => {
    const last = meta.last_page || 1;
    const curr = page || 1;
    const arr = [];
    const add = (n) => { if (n >= 1 && n <= last && !arr.includes(n)) arr.push(n); };

    add(1);
    add(2);
    add(curr - 1);
    add(curr);
    add(curr + 1);
    add(last - 1);
    add(last);

    arr.sort((a, b) => a - b);

    // sisipkan ellipsis marker (-1)
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      out.push(arr[i]);
      if (i < arr.length - 1 && arr[i + 1] - arr[i] > 1) out.push(-1);
    }
    return out;
  }, [page, meta.last_page]);

  function go(p) {
    if (p < 1 || p > meta.last_page || p === page) return;
    fetchData(p, q);
  }

  function onSearch() {
    // reset ke halaman 1 saat cari
    fetchData(1, q);
  }

  return (
    <div className="grid gap-6">
      {/* HERO / HEADER */}
      <div className="rounded-2xl p-5 border border-white/10 bg-gradient-to-r from-orange-600/20 via-orange-500/10 to-transparent">
        <h1 className="text-2xl font-extrabold tracking-tight">Katalog Buku</h1>
        <p className="text-sm text-slate-300 mt-1">
          Total {meta.total} buku. Gunakan pencarian untuk menemukan judul/penulis.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            placeholder="Cari judul / penulis…"
            className="px-4 py-2 rounded-xl bg-[#0b1220] border border-white/10 w-full max-w-xl shadow-inner"
          />
          <button
            onClick={onSearch}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 transition shadow"
          >
            Cari
          </button>
        </div>
      </div>

      {err && (
        <div className="text-sm text-rose-400">{err}</div>
      )}

      {/* GRID 4 / 6 — cover kotak */}
      <div className={`grid grid-cols-2 md:grid-cols-4 2xl:grid-cols-6 gap-4`}>
        {loading && (
          [...Array(6)].map((_,i)=>(
            <div key={i} className="p-4 rounded-2xl border border-white/10 bg-white/[.04] animate-pulse">
              <div className="w-full aspect-square rounded-2xl bg-white/10 mb-3" />
              <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
              <div className="h-3 w-1/2 bg-white/10 rounded" />
            </div>
          ))
        )}

        {!loading && items.map((b) => (
          <div
            key={b.id}
            className="group p-4 rounded-2xl border border-white/10 bg-white/[.04] backdrop-blur
                       hover:-translate-y-1 hover:shadow-xl transition transform"
          >
            <div className="relative">
              <img
                src={b.cover_url}
                alt={b.title}
                className="w-full aspect-square object-cover rounded-2xl border border-white/10"
              />
              <span className="absolute top-2 left-2 text-[10px] px-2 py-1 rounded-full bg-orange-600/90">
                Stok {b.stock ?? 0}
              </span>
            </div>

            <div className="mt-3">
              <div className="font-semibold text-base line-clamp-2 leading-snug group-hover:text-orange-300">
                {b.title}
              </div>
              <div className="text-xs text-slate-300 mt-1">{b.author}</div>
              <div className="text-[10px] text-slate-400 mt-1">ISBN {b.isbn}</div>
              <div className="text-[10px] text-slate-400">Tahun {b.year ?? "-"}</div>
            </div>
          </div>
        ))}

        {!loading && items.length === 0 && !err && (
          <div className="col-span-full text-sm text-slate-300">Tidak ada data.</div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between">
        <div className="text-xs">
          Hal {page} dari {meta.last_page}
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={page <= 1}
            onClick={() => go(page - 1)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 disabled:opacity-50"
          >
            Prev
          </button>

          {pages.map((p, idx) =>
            p === -1 ? (
              <span key={`gap-${idx}`} className="px-2 text-sm opacity-70">…</span>
            ) : (
              <button
                key={p}
                onClick={() => go(p)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition
                            ${p === page
                              ? "bg-orange-600 border-orange-500"
                              : "bg-slate-800 border-white/10 hover:bg-slate-700"}`}
              >
                {p}
              </button>
            )
          )}

          <button
            disabled={page >= meta.last_page}
            onClick={() => go(page + 1)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-white/10 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
