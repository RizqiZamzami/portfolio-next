
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { sudahMasuk } from "@/lib/pin";
import { supabaseAdmin } from "@/lib/supabase-admin";

// ==========================================
// FUNGSI BUKU TAMU
// ==========================================

export async function kirimPesan(stateSebelum, formData) {
    const nama = formData.get("nama")?.trim() || "";
    const pesan = formData.get("pesan")?.trim() || "";

    if (!nama || !pesan) {
        return {
            error: "Nama dan pesan wajib diisi.",
            nama,
            pesan,
        };
    }

    if (nama.length > 100) {
        return {
            error: "Nama maksimal 100 karakter.",
            nama,
            pesan,
        };
    }

    if (pesan.length > 300) {
        return {
            error: "Pesan maksimal 300 karakter.",
            nama,
            pesan,
        };
    }

    const hasil = await supabaseAdmin
        .from("buku_tamu")
        .insert([{ nama, pesan }]);

    if (hasil.error) {
        return {
            error: `Pesan gagal dikirim: ${hasil.error.message}`,
            nama,
            pesan,
        };
    }

    revalidatePath("/buku-tamu");
    revalidatePath("/kelola");

    return {
        berhasil: "Terima kasih! Pesan kamu berhasil dikirim.",
        nama: "",
        pesan: "",
    };
}

// ==========================================
// FUNGSI PIN & KELOLA ADMIN
// ==========================================

export async function masukKelola(stateSebelum, formData) {
    const pin = formData.get("pin");

    if (pin !== process.env.ADMIN_PIN) {
        return {
            error: "PIN salah. Coba lagi.",
        };
    }

    const kue = await cookies();

    kue.set("pin_admin", pin, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 60 * 60,
        secure: process.env.NODE_ENV === "production",
        path: "/",
    });

    return {};
}

export async function keluarKelola() {
    const kue = await cookies();
    kue.delete("pin_admin");
}

export async function sematkanPesan(formData) {
    if (!(await sudahMasuk())) return;

    const id = formData.get("id");
    const sematkan = formData.get("sematkan") === "ya";

    const hasil = await supabaseAdmin
        .from("buku_tamu")
        .update({ disematkan: sematkan })
        .eq("id", id);

    if (hasil.error) {
        throw new Error(hasil.error.message);
    }

    revalidatePath("/kelola");
    revalidatePath("/buku-tamu");
}

export async function hapusPesan(formData) {
    if (!(await sudahMasuk())) return;

    const id = formData.get("id");

    const hasil = await supabaseAdmin
        .from("buku_tamu")
        .delete()
        .eq("id", id);

    if (hasil.error) {
        throw new Error(hasil.error.message);
    }

    revalidatePath("/kelola");
    revalidatePath("/buku-tamu");
}

// ==========================================
// FUNGSI KELOLA PROYEK
// ==========================================

// 7 KATEGORI PROYEK
const daftarKategori = [
    "HTML",
    "CSS",
    "JavaScript",
    "Next.js",
    "UI/UX",
    "Tailwind CSS",
    "IoT",
];

function bacaProyek(formData) {
    return {
        judul: formData.get("judul")?.trim() || "",
        slug: formData.get("slug")?.trim() || "",
        kategori: formData.get("kategori")?.trim() || "",
        deskripsi: formData.get("deskripsi")?.trim() || "",

        fitur: (formData.get("fitur") || "")
            .split("\n")
            .map((f) => f.trim())
            .filter((f) => f !== ""),

        gambar_url: formData.get("gambar_url")?.trim() || "",
    };
}

function cekProyek(proyek) {
    if (
        proyek.judul === "" ||
        proyek.slug === "" ||
        proyek.deskripsi === ""
    ) {
        return "Judul, slug, dan deskripsi wajib diisi.";
    }

    if (proyek.slug.includes(" ")) {
        return "Slug tidak boleh memakai spasi. Gunakan tanda hubung, contoh: buku-tamu.";
    }

    if (!daftarKategori.includes(proyek.kategori)) {
        return "Kategori harus HTML, CSS, JavaScript, Next.js, UI/UX, Tailwind CSS, atau IoT.";
    }

    if (!proyek.gambar_url.startsWith("/proyek/")) {
        return "Alamat gambar harus diawali /proyek/, contoh: /proyek/proyek-buku-tamu.png.";
    }

    return "";
}

function perbaruiHalaman(slug) {
    revalidatePath("/");
    revalidatePath("/proyek");
    revalidatePath("/kelola");

    if (slug) {
        revalidatePath(`/proyek/${slug}`);
    }
}

// ==========================================
// TAMBAH PROYEK
// ==========================================

export async function tambahProyek(stateSebelum, formData) {
    const proyek = bacaProyek(formData);

    if (!(await sudahMasuk())) {
        return {
            error: "Masukkan PIN dulu di halaman Kelola.",
            proyek,
        };
    }

    const error = cekProyek(proyek);

    if (error !== "") {
        return {
            error,
            proyek,
        };
    }

    const hasil = await supabaseAdmin
        .from("projects")
        .insert(proyek);

    if (hasil.error) {
        if (hasil.error.code === "23505") {
            return {
                error: "Slug sudah dipakai proyek lain.",
                proyek,
            };
        }

        return {
            error: `Proyek gagal disimpan: ${hasil.error.message}`,
            proyek,
        };
    }

    perbaruiHalaman(proyek.slug);

    redirect("/kelola");
}

// ==========================================
// UBAH PROYEK
// ==========================================

export async function ubahProyek(stateSebelum, formData) {
    const id = formData.get("id");
    const proyek = bacaProyek(formData);

    if (!(await sudahMasuk())) {
        return {
            error: "Masukkan PIN dulu di halaman Kelola.",
            proyek,
        };
    }

    if (!id) {
        return {
            error: "ID proyek tidak ditemukan.",
            proyek,
        };
    }

    const error = cekProyek(proyek);

    if (error !== "") {
        return {
            error,
            proyek,
        };
    }

    const hasil = await supabaseAdmin
        .from("projects")
        .update(proyek)
        .eq("id", id);

    if (hasil.error) {
        if (hasil.error.code === "23505") {
            return {
                error: "Slug sudah dipakai proyek lain.",
                proyek,
            };
        }

        return {
            error: `Proyek gagal diubah: ${hasil.error.message}`,
            proyek,
        };
    }

    perbaruiHalaman(proyek.slug);

    redirect("/kelola");
}

// ==========================================
// HAPUS PROYEK
// ==========================================

export async function hapusProyek(formData) {
    if (!(await sudahMasuk())) {
        return {
            error: "Masukkan PIN dulu di halaman Kelola.",
        };
    }

    const id = formData.get("id");

    if (!id) {
        return {
            error: "ID proyek tidak ditemukan.",
        };
    }

    const hasil = await supabaseAdmin
        .from("projects")
        .delete()
        .eq("id", id);

    if (hasil.error) {
        return {
            error: `Proyek gagal dihapus: ${hasil.error.message}`,
        };
    }

    perbaruiHalaman("");

    redirect("/kelola");
}
