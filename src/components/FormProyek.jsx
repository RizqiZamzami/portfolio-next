
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function TombolKirim({ teks }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Menyimpan..." : teks}
    </Button>
  );
}

export default function FormProyek({ aksi, proyek, teksTombol }) {
  const [state, formAction] = useActionState(aksi, { proyek });

  const nilai = state.proyek || proyek;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={proyek?.id || ""} />

      {/* Judul Proyek */}
      <div className="space-y-2">
        <Label htmlFor="judul">Judul Proyek</Label>
        <Input
          id="judul"
          name="judul"
          placeholder="Contoh: Buku Tamu Digital"
          defaultValue={nilai?.judul || ""}
          required
        />
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          placeholder="Contoh: buku-tamu"
          defaultValue={nilai?.slug || ""}
          required
        />
      </div>

      {/* Kategori */}
      <div className="space-y-2">
        <Label htmlFor="kategori">Kategori</Label>

        <select
          id="kategori"
          name="kategori"
          defaultValue={nilai?.kategori || "HTML"}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="HTML">HTML</option>
          <option value="CSS">CSS</option>
          <option value="JavaScript">JavaScript</option>
          <option value="Next.js">Next.js</option>
          <option value="UI/UX">UI/UX</option>
          <option value="Tailwind CSS">Tailwind CSS</option>
          <option value="IoT">IoT</option>
        </select>
      </div>

      {/* Minggu */}
      <div className="space-y-2">
        <Label htmlFor="minggu">Dibuat di</Label>
        <Input
          id="minggu"
          name="minggu"
          placeholder="Contoh: Minggu 15"
          defaultValue={nilai?.minggu || ""}
          required
        />
      </div>

      {/* Deskripsi */}
      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi</Label>
        <Textarea
          id="deskripsi"
          name="deskripsi"
          rows={2}
          placeholder="Deskripsi singkat proyek"
          defaultValue={nilai?.deskripsi || ""}
          required
        />
      </div>

      {/* Fitur yang Dipelajari */}
      <div className="space-y-2">
        <Label htmlFor="fitur">Yang Saya Pelajari</Label>
        <Textarea
          id="fitur"
          name="fitur"
          rows={3}
          placeholder={"Server Actions\nValidasi form\nSupabase"}
          defaultValue={(nilai?.fitur || []).join("\n")}
        />

        <p className="text-sm text-muted-foreground">
          Tulis satu poin di setiap baris.
        </p>
      </div>

      {/* Alamat Gambar */}
      <div className="space-y-2">
        <Label htmlFor="gambar_url">Alamat Gambar</Label>
        <Input
          id="gambar_url"
          name="gambar_url"
          placeholder="/proyek/proyek-buku-tamu.png"
          defaultValue={nilai?.gambar_url || ""}
          required
        />
      </div>

      {/* Pesan Error */}
      {state.error && (
        <p className="rounded-md bg-red-100 p-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      {/* Tombol Simpan */}
      <TombolKirim teks={teksTombol} />
    </form>
  );
}
