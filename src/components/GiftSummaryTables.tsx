import { Fragment, useState } from "react";

import { useGiftSummary } from "../hooks/useGiftlog.ts";
import type { DirectionTotals, SummaryTotals } from "../types/giftlog.ts";
import { STATUS_LABELS, STATUS_ORDER, formatKr, occasionIcon } from "../utils/giftlog.ts";

// Years open when the page loads; the rest start collapsed
const OPEN_YEARS = 2;

// Count with the sum after it
function Totals({ totals }: { totals: SummaryTotals }) {
    return (
        <td className="text-end text-nowrap">
            {totals.count}
            <small className="text-body-secondary ms-1">{formatKr(totals.total)}</small>
        </td>
    );
}

// Occasion or person line under an open year
function SubRow({ label, totals }: { label: React.ReactNode; totals: DirectionTotals }) {
    return (
        <tr className="summary-sub">
            <td>{label}</td>
            <td className="text-end text-nowrap">
                {totals.given.count} · {formatKr(totals.given.total)}
            </td>
            <td className="text-end text-nowrap">
                {totals.received.count} · {formatKr(totals.received.total)}
            </td>
        </tr>
    );
}

// Gifts still in progress. "Given" is left out, the years below already show it
export function StatusSummary() {
    const { data } = useGiftSummary();
    const open = (data?.byStatus ?? [])
        .filter((item) => item.status !== "given")
        .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));

    if (open.length === 0) {
        return null;
    }

    return (
        <div className="d-flex flex-wrap gap-2 mb-2">
            {open.map((item) => (
                <span key={item.status} className="border rounded-pill px-2 small">
                    {STATUS_LABELS[item.status]} <b>{item.count}</b>
                    {item.total > 0 && <span className="text-body-secondary ms-1">{formatKr(item.total)}</span>}
                </span>
            ))}
        </div>
    );
}

// One line per year; open it to see occasions and household persons
export function YearSummary() {
    const { data } = useGiftSummary();
    const years = data?.years ?? [];

    // Years the user has opened or closed, i.e. that differ from the default
    const [toggled, setToggled] = useState<Set<number>>(new Set());
    const isOpen = (year: number, index: number) => index < OPEN_YEARS !== toggled.has(year);
    const toggle = (year: number) =>
        setToggled((prev) => {
            const next = new Set(prev);
            if (!next.delete(year)) {
                next.add(year);
            }
            return next;
        });

    return (
        <table className="table table-dark table-sm align-middle summary-table">
            <thead className="sticky-head">
                <tr>
                    <th>År</th>
                    <th className="text-end">Gitt</th>
                    <th className="text-end">Fått</th>
                </tr>
            </thead>
            <tbody>
                {years.map((item, index) => {
                    const open = isOpen(item.year, index);
                    return (
                        <Fragment key={item.year}>
                            <tr className="summary-year" onClick={() => toggle(item.year)}>
                                <td>
                                    {/* The row handles the click; the button gives keyboard access */}
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 fw-bold text-reset text-decoration-none"
                                        aria-expanded={open}>
                                        <i className={`bi bi-chevron-${open ? "down" : "right"} small me-1`}></i>
                                        {item.year}
                                    </button>
                                </td>
                                <Totals totals={item.given} />
                                <Totals totals={item.received} />
                            </tr>
                            {open && (
                                <>
                                    {item.occasions.map((oc) => (
                                        <SubRow
                                            key={`o${oc.id}`}
                                            label={
                                                <>
                                                    <i className={`bi ${occasionIcon(oc.name)} me-2`}></i>
                                                    {oc.name}
                                                </>
                                            }
                                            totals={oc}
                                        />
                                    ))}
                                    {item.persons.map((person) => (
                                        <SubRow
                                            key={`p${person.id ?? "felles"}`}
                                            label={<span className="fst-italic">{person.name}</span>}
                                            totals={person}
                                        />
                                    ))}
                                </>
                            )}
                        </Fragment>
                    );
                })}
            </tbody>
        </table>
    );
}
