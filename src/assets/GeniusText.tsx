import { useEffect, useState, useCallback } from "react";

/**
 * A single piece of the passage. Either plain text, or an annotatable
 * span that opens a note when clicked.
 */
export type Segment =
    | { type: "text"; content: string }
    | { type: "note"; id: string; content: string; note: string; label?: string }
    | { type: "break" };

export interface GeniusTextProps {
    title?: string;
    subtitle?: string;
    segments: Segment[];
}

export default function GeniusText({ title, subtitle, segments }: GeniusTextProps) {
    const [activeId, setActiveId] = useState<string | null>(null);

    const active = segments.find((s) => s.type === "note" && s.id === activeId) as
        | Extract<Segment, { type: "note" }>
        | undefined;

    const close = useCallback(() => setActiveId(null), []);

    // Escape closes the mobile sheet
    useEffect(() => {
        if (!activeId) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [activeId, close]);

    return (
        <div className="relative mx-auto grid max-w-245 grid-cols-1 gap-0 px-4 py-10 font-sans sm:px-6 md:grid-cols-[minmax(0,1fr)_320px] md:gap-10 md:py-12">
            <div>
                {(title || subtitle) && (
                    <header className="mb-6">
                        {title && (
                            <h1 className="mb-1 font-serif text-3xl font-semibold tracking-tight">{title}</h1>
                        )}
                        {subtitle && <p className="text-sm">{subtitle}</p>}
                    </header>
                )}

                <div className="font-serif text-[1.15rem] leading-[1.85]">
                    {segments.map((seg, i) =>
                        seg.type === "break" ? (
                            <br key={i} />
                        ) : seg.type === "text" ? (
                            <span key={i}>{seg.content}</span>
                        ) : (
                            <button
                                key={i}
                                type="button"
                                aria-expanded={seg.id === activeId}
                                onClick={() => setActiveId(seg.id === activeId ? null : seg.id)}
                                className={
                                    "cursor-pointer rounded-[3px] border-0 border-b-2 border-[#c99a2e] px-[0.15em] py-[0.02em] font-inherit text-inherit transition-colors focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#2c6e6b] " +
                                    (seg.id === activeId
                                        ? "bg-[#c99a2e]/30 text-[#2c6e6b]"
                                        : "bg-[#c99a2e]/16 hover:bg-[#c99a2e]/30")
                                }
                            >
                                {seg.content}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Desktop: sticky side panel. Mobile: bottom sheet (same markup, classes reposition it) */}
            <aside
                aria-live="polite"
                className={
                    "fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto transition-transform duration-250 ease-out motion-reduce:transition-none " +
                    "md:sticky md:top-8 md:inset-auto md:z-auto md:max-h-none md:translate-y-0 md:overflow-visible " +
                    (active ? "translate-y-0" : "translate-y-full md:translate-y-0")
                }
            >
                <div className="min-h-35 rounded-t-2xl bg-gray-800 px-5 py-4 shadow-[0_-8px_24px_rgba(0,0,0,0.18)] md:rounded-xl md:shadow-none">
                    {active ? (
                        <>
                            <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {active.label ?? "Annotation"}
                </span>
                                <button
                                    type="button"
                                    onClick={close}
                                    aria-label="Close"
                                    className="block px-1 text-2xl leading-none md:hidden"
                                >
                                    ×
                                </button>
                            </div>
                            <blockquote className="mb-2.5 border-l-2 border-[#c99a2e] pl-3 font-serif text-sm italic">
                                {active.content}
                            </blockquote>
                            <p className="text-sm leading-relaxed">{active.note}</p>
                        </>
                    ) : (
                        <p className="text-sm">
                            Klicke auf eine markierte Stelle um die Erklärung zu sehen
                        </p>
                    )}
                </div>
            </aside>

            {/* Backdrop only visible on mobile when the sheet is open */}
            <div
                onClick={close}
                aria-hidden="true"
                className={
                    "fixed inset-0 z-40 bg-[rgba(20,16,10,0.35)] transition-opacity duration-200 md:hidden " +
                    (active ? "opacity-100" : "pointer-events-none opacity-0")
                }
            />
        </div>
    );
}