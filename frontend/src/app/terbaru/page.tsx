import { createClient } from "@/lib/supabase/server";
import AnimeCard from "@/app/components/AnimeCard";
import Link from "next/link";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const resolvedParams = await searchParams;
    const page = resolvedParams.page ? String(resolvedParams.page) : "1";
    return {
        title: `Update Terbaru Halaman ${page} — Sukinime`,
        description: `Daftar anime update terbaru halaman ${page} di Sukinime.`,
    };
}

export default async function TerbaruPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const supabase = await createClient();
    const resolvedParams = await searchParams;

    // Parse page number
    const pageStr = resolvedParams.page ? String(resolvedParams.page) : "1";
    const page = parseInt(pageStr, 10) > 0 ? parseInt(pageStr, 10) : 1;
    const itemsPerPage = 24;

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage - 1;

    // Get total count
    const { count } = await supabase
        .from("animes")
        .select("*", { count: "exact", head: true })
        .contains("genres", ["Update Terbaru"]);

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get animes for current page
    const { data: animes } = await supabase
        .from("animes")
        .select("*")
        .contains("genres", ["Update Terbaru"])
        .order("updated_at", { ascending: false })
        .range(start, end);

    return (
        <div style={{ minHeight: "100vh", padding: "2.5rem 0 4rem" }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>
                        <span>Update Terbaru - Halaman {page}</span>
                    </div>
                </div>

                {(!animes || animes.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "5rem 0" }}>
                        <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>Belum ada data update terbaru.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {animes.map((anime) => (
                                <AnimeCard key={anime.id} anime={anime} />
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "3rem", flexWrap: "wrap" }}>
                                {page > 1 && (
                                    <Link href={`/terbaru?page=${page - 1}`} className="pagination-btn">
                                        &laquo; Prev
                                    </Link>
                                )}

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Logic to show a window of pages around current page
                                    let pageNum = page - 2 + i;
                                    if (page <= 3) pageNum = i + 1;
                                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;

                                    if (pageNum > 0 && pageNum <= totalPages) {
                                        return (
                                            <Link
                                                key={pageNum}
                                                href={`/terbaru?page=${pageNum}`}
                                                className={`pagination-btn ${pageNum === page ? "active" : ""}`}
                                            >
                                                {pageNum}
                                            </Link>
                                        );
                                    }
                                    return null;
                                })}

                                {page < totalPages && (
                                    <Link href={`/terbaru?page=${page + 1}`} className="pagination-btn">
                                        Next &raquo;
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
