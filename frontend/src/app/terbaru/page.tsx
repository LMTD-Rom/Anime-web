import { createClient } from "@/lib/supabase/server";
import AnimeCard from "@/app/components/AnimeCard";
import Link from "next/link";
import FilterBar from "@/app/components/FilterBar";
import { Suspense } from "react";

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

    const pageStr = resolvedParams.page ? String(resolvedParams.page) : "1";
    const page = parseInt(pageStr, 10) > 0 ? parseInt(pageStr, 10) : 1;
    const itemsPerPage = 24;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage - 1;

    const sort = resolvedParams.sort ? String(resolvedParams.sort) : "terbaru";
    const status = resolvedParams.status ? String(resolvedParams.status) : "Ongoing";
    const genre = resolvedParams.genre ? String(resolvedParams.genre) : "";

    let query = supabase.from("animes").select("*", { count: "exact" });

    if (status === "all") {
        query = query.not("genres", "cs", '{"Popular"}');
    } else {
        query = query.eq("status", status).not("genres", "cs", '{"Popular"}');
    }
    if (genre) query = query.contains("genres", [genre]);

    if (sort === "az") query = query.order("title", { ascending: true });
    else if (sort === "za") query = query.order("title", { ascending: false });
    else query = query.order("updated_at", { ascending: false });

    const { data: animes, count } = await query.range(start, end);

    const totalPages = Math.ceil((count ?? 0) / itemsPerPage);

    const buildHref = (p: number) => {
        const params = new URLSearchParams();
        params.set("page", String(p));
        if (sort !== "terbaru") params.set("sort", sort);
        if (status !== "Ongoing") params.set("status", status);
        if (genre) params.set("genre", genre);
        return `/terbaru?${params.toString()}`;
    };

    return (
        <div style={{ minHeight: "100vh", padding: "2.5rem 0 4rem" }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                    <div className="section-label" style={{ marginBottom: 0 }}>
                        <span>Update Terbaru — Hal. {page}</span>
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{count ?? 0} anime</span>
                </div>

                <Suspense>
                    <FilterBar />
                </Suspense>

                {(!animes || animes.length === 0) ? (
                    <div style={{ textAlign: "center", padding: "5rem 0" }}>
                        <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>Tidak ada anime dengan filter tersebut.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {animes.map((anime) => (
                                <AnimeCard key={anime.id} anime={anime} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "3rem", flexWrap: "wrap" }}>
                                {page > 1 && <Link href={buildHref(page - 1)} className="pagination-btn">« Prev</Link>}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum = page - 2 + i;
                                    if (page <= 3) pageNum = i + 1;
                                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                                    if (pageNum > 0 && pageNum <= totalPages) {
                                        return <Link key={pageNum} href={buildHref(pageNum)} className={`pagination-btn ${pageNum === page ? "active" : ""}`}>{pageNum}</Link>;
                                    }
                                    return null;
                                })}
                                {page < totalPages && <Link href={buildHref(page + 1)} className="pagination-btn">Next »</Link>}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
