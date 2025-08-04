'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getFirebaseApp } from "@/lib/firebase";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name || !email || !password) {
      setError("Semua field harus diisi.");
      setLoading(false);
      return;
    }
    
    if (!email.endsWith('@sekolah.id')) {
        setError("Email harus menggunakan domain @sekolah.id");
        setLoading(false);
        return;
    }

    try {
      // Initialize DB on client
      const db = getFirestore(getFirebaseApp());
      // Simpan data pengguna ke Firestore
      // Dalam aplikasi nyata, Anda akan menggunakan Firebase Authentication
      // dan menyimpan ID pengguna, bukan email sebagai ID dokumen.
      await setDoc(doc(db, "users", email), {
        name: name,
        email: email,
        role: email === 'admin@sekolah.id' ? 'admin' : 'user'
      });

      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda telah dibuat. Silakan login.",
      });
      router.push('/login');
    } catch (err) {
      console.error("Error registering user:", err);
      setError("Gagal mendaftarkan pengguna. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-3xl">Buat Akun Baru</CardTitle>
            <CardDescription>Daftarkan diri Anda untuk akses ke sistem inventaris</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input id="name" type="text" placeholder="Nama Anda" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="namaanda@sekolah.id" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required placeholder="●●●●●●●●" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Mendaftarkan...' : 'Register'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun? <Link href="/login" className="text-primary hover:underline">Login</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
