import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'


export default function Login() {
    const nav = useNavigate()
    const [email, setEmail] = useState('admin@buku.test')
    const [password, setPassword] = useState('password')
    const [err, setErr] = useState('')


    async function onSubmit(e) {
        e.preventDefault()
        try {
            const { data } = await api.post('/auth/login', { email, password })
            localStorage.setItem('token', data.token)
            nav('/')
        } catch (e) { setErr('Email / password salah') }
    }


    return (
        <div className="min-h-[70vh] grid place-items-center">
            <form onSubmit={onSubmit} className="w-full max-w-sm bg-slate-900/60 border border-white/10 p-5 rounded-2xl">
                <h2 className="text-xl font-bold mb-4">Masuk</h2>
                {err && <p className="text-rose-400 text-sm mb-2">{err}</p>}
                <label className="block text-xs mb-1">Email</label>
                <input className="w-full mb-3 px-3 py-2 rounded-lg bg-slate-950 border border-white/10" value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
                <label className="block text-xs mb-1">Password</label>
                <input type="password" className="w-full mb-4 px-3 py-2 rounded-lg bg-slate-950 border border-white/10" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
                <button className="w-full px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 shadow">Login</button>
                <p className="text-xs opacity-70 mt-3">Contoh: admin@buku.test / password atau user@buku.test / password</p>
            </form>
        </div>
    )
}