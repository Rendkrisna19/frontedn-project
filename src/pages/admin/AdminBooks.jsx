import React, { useEffect, useState } from "react";
import api from "../../api";

export default function AdminBooks() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [q, setQ] = useState("");
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    id: null, title: "", author: "", isbn: "", year: "", stock: 0, cover: null, preview: ""
  });
  const [errors, setErrors] = useState({}); // tampung error 422

  async function fetchData(p = 1, query = "") {
    try {
      const { data } = await api.get(`/books?page=${p}${query ? `&q=${encodeURIComponent(query)}` : ""}`);
      setItems(data.data || []);
      setMeta({ current_page: data?.meta?.current_page ?? 1, last_page: data?.meta?.last_page ?? 1 });
    } catch {
      alert("Gagal memuat daftar buku. Pastikan backend berjalan & rute publik /api/books ada.");
    }
  }

  useEffect(() => { fetchData(1, ""); }, []);

  function openNew() {
    setErrors({});
    setForm({ id: null, title: "", author: "", isbn: "", year: "", stock: 0, cover: null, preview: "" });
    setShow(true);
  }

  function openEdit(b) {
    setErrors({});
    setForm({
      id: b.id, title: b.title, author: b.author, isbn: b.isbn,
      year: b.year || "", stock: b.stock || 0, cover: null, preview: b.cover_url
    });
    setShow(true);
  }

  function onPickCover(e) {
    const file = e.target.files?.[0];
    if (!file) { setForm(f=>({...f, cover:null })); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, cover: file, preview: reader.result }));
    reader.readAsDataURL(file);
  }

  async function save(e) {
    e.preventDefault();
    setErrors({});
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("author", form.author);
      fd.append("isbn", form.isbn);
      if (form.year)  fd.append("year", String(form.year));
      fd.append("stock", String(form.stock ?? 0));
      if (form.cover) fd.append("cover", form.cover); // kirim hanya jika ada file baru

      if (form.id) {
        // trik aman utk multipart PUT di Laravel → method spoofing
        fd.append("_method", "PUT");
        await api.post(`/books/${form.id}`, fd);
        alert("Buku berhasil diperbarui ✅");
      } else {
        await api.post("/books", fd);
        alert("Buku berhasil ditambahkan ✅");
      }

      setShow(false);
      fetchData(1, q);
    } catch (err) {
      if (err?.response?.status === 422) {
        const ve = err.response.data?.errors || {};
        setErrors(ve);
        // tampilkan pesan singkat
        const msg = Object.values(ve).flat().join("\n") || "Validasi gagal.";
        alert("Gagal menyimpan:\n" + msg);
      } else {
        alert("Terjadi kesalahan saat menyimpan buku.");
      }
    }
  }

  async function remove(id) {
    if (!confirm("Hapus buku ini?")) return;
    try {
      await api.delete(`/books/${id}`);
      alert("Buku berhasil dihapus ✅");
      fetchData(1, q);
    } catch {
      alert("Gagal menghapus buku.");
    }
  }

  // helper untuk menampilkan error kecil di bawah input
  const Err = ({name}) => errors?.[name]?.length ? (
    <div className="text-xs text-rose-400 mt-1">{errors[name][0]}</div>
  ) : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold">Manajemen Buku</h2>
        <button onClick={openNew} className="px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 shadow">Tambah</button>
      </div>

      <div className="flex items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e)=>e.key==="Enter"&&fetchData(1,q)}
          placeholder="Cari…"
          className="px-3 py-2 rounded-lg bg-[#0b1220] border border-white/10 w-full max-w-md"
        />
        <button onClick={() => fetchData(1, q)} className="px-3 py-2 rounded-lg bg-slate-800 border border-white/10">
          Cari
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="px-4 py-3">Cover</th>
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">Penulis</th>
              <th className="px-4 py-3">ISBN</th>
              <th className="px-4 py-3">Tahun</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3 w-40">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {items.map((b) => (
              <tr key={b.id} className="hover:bg-white/5">
                <td className="px-4 py-3">
                  <img src={b.cover_url} alt={b.title} className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                </td>
                <td className="px-4 py-3 font-medium">{b.title}</td>
                <td className="px-4 py-3">{b.author}</td>
                <td className="px-4 py-3 text-slate-300/90">{b.isbn}</td>
                <td className="px-4 py-3">{b.year ?? "-"}</td>
                <td className="px-4 py-3">{b.stock ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(b)} className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10">Edit</button>
                    <button onClick={() => remove(b.id)} className="px-2 py-1 rounded-lg bg-rose-600/90 hover:bg-rose-600">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan="7" className="px-4 py-6 text-center text-sm text-slate-300">Belum ada data.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShow(false)}></div>
          <div className="relative max-w-xl w-full mx-auto mt-20 p-4">
            <div className="rounded-2xl border border-white/10 bg-white/[.04] backdrop-blur p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{form.id ? "Ubah" : "Tambah"} Buku</h3>
                <button onClick={() => setShow(false)} className="px-2 py-1 rounded-lg bg-slate-800 border border-white/10">✕</button>
              </div>

              <form onSubmit={save} className="grid gap-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs mb-1">Judul</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-[#0b1220] border border-white/10"
                      value={form.title}
                      onChange={(e)=>setForm(f=>({...f,title:e.target.value}))}
                      required
                    />
                    <Err name="title" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Penulis</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-[#0b1220] border border-white/10"
                      value={form.author}
                      onChange={(e)=>setForm(f=>({...f,author:e.target.value}))}
                      required
                    />
                    <Err name="author" />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1">ISBN</label>
                    <input
                      className="w-full px-3 py-2 rounded-lg bg-[#0b1220] border border-white/10"
                      value={form.isbn}
                      onChange={(e)=>setForm(f=>({...f,isbn:e.target.value}))}
                      required
                    />
                    <Err name="isbn" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Tahun</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-lg bg-[#0b1220] border border-white/10"
                      value={form.year||""}
                      onChange={(e)=>setForm(f=>({...f,year:e.target.value}))}
                    />
                    <Err name="year" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">Stok</label>
                    <input
                      type="number" min="0"
                      className="w-full px-3 py-2 rounded-lg bg-[#0b1220] border border-white/10"
                      value={form.stock}
                      onChange={(e)=>setForm(f=>({...f,stock:e.target.value}))}
                    />
                    <Err name="stock" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1">Cover (jpg/png/webp, max 2MB)</label>
                  <input
                    type="file" accept="image/*"
                    onChange={onPickCover}
                    className="block w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:border-white/10 file:bg-slate-800 file:text-slate-100 file:hover:bg-slate-700"
                  />
                  {form.preview && (
                    <img src={form.preview} alt="preview" className="mt-3 w-40 h-40 object-cover rounded-xl border border-white/10"/>
                  )}
                  <Err name="cover" />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShow(false)} className="px-3 py-2 rounded-lg bg-slate-800 border border-white/10">Batal</button>
                  <button className="px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 shadow">Simpan</button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
