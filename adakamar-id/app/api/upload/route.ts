import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Tidak ada file gambar yang diunggah." },
        { status: 400 }
      );
    }

    // Validate mime type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File harus berformat gambar (JPG, PNG, WEBP, GIF, SVG)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const rawExt = path.extname(file.name) || ".jpg";
    const ext = rawExt.toLowerCase().startsWith(".") ? rawExt.toLowerCase() : `.${rawExt.toLowerCase()}`;
    const filename = `media-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url,
      filename,
      name: file.name,
      size: file.size,
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal menyimpan file gambar." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { readdir, stat } = await import("fs/promises");
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filenames = await readdir(uploadsDir);
    const files = await Promise.all(
      filenames
        .filter((fn) => !fn.startsWith(".") && /\.(jpe?g|png|webp|gif|svg)$/i.test(fn))
        .map(async (fn) => {
          const fp = path.join(uploadsDir, fn);
          const st = await stat(fp).catch(() => null);
          return {
            url: `/uploads/${fn}`,
            filename: fn,
            size: st?.size || 0,
            createdAt: st?.birthtime || new Date(),
          };
        })
    );

    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      files,
    });
  } catch (error: any) {
    return NextResponse.json({ success: true, files: [] });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { unlink } = await import("fs/promises");
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "Nama file tidak valid." }, { status: 400 });
    }

    // Prevent directory traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), "public", "uploads", safeFilename);

    await unlink(filePath).catch(() => null);

    return NextResponse.json({ success: true, message: "File berhasil dihapus." });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menghapus file." }, { status: 500 });
  }
}


