import { useGiftSummary } from "../hooks/useGiftlog.ts";
import type { SummaryTotals } from "../types/giftlog.ts";
import { STATUS_LABELS, STATUS_ORDER, formatKr, occasionIcon } from "../utils/giftlog.ts";

// Sum with the count below; one grid cell in the mobile lists
function MobileTotals({ totals }: { totals: SummaryTotals }) {
    return (
        <span className="text-end">
            {formatKr(totals.total)}
            <br />
            <small className="text-body-secondary">{totals.count} stk</small>
        </span>
    );
}

export function StatusSummary() {
    const { data } = useGiftSummary();
    const byStatus = [...(data?.byStatus ?? [])].sort(
        (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
    );

    return (
        <>
            <table className="table table-striped table-dark d-none d-md-table">
                <thead className="sticky-head">
                    <tr>
                        <th>Status</th>
                        <th>Antall</th>
                        <th>Sum</th>
                    </tr>
                </thead>
                <tbody>
                    {byStatus.map((item) => (
                        <tr key={item.status}>
                            <td>{STATUS_LABELS[item.status]}</td>
                            <td>{item.count}</td>
                            <td>{item.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <ul className="gift-list d-md-none">
                {byStatus.map((item) => (
                    <li key={item.status} className="gift-list-item">
                        <div className="gift-list-line gift-list-grid">
                            <span className="fw-semibold">{STATUS_LABELS[item.status]}</span>
                            <span className="text-end">{item.count} stk</span>
                            <span className="text-end">{formatKr(item.total)}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}

export function YearSummary() {
    const { data } = useGiftSummary();
    const years = data?.years ?? [];

    return (
        <>
            <table className="table table-dark d-none d-md-table">
                <thead className="sticky-head">
                    <tr>
                        <th rowSpan={2}>År</th>
                        <th colSpan={2}>Gitt</th>
                        <th colSpan={2}>Fått</th>
                    </tr>
                    <tr>
                        <th>Antall</th>
                        <th>Sum</th>
                        <th>Antall</th>
                        <th>Sum</th>
                    </tr>
                </thead>
                {years.map((item) => (
                    <tbody key={item.year} className="table-group-divider">
                        <tr className="table-active fw-bold">
                            <td>{item.year}</td>
                            <td>{item.given.count}</td>
                            <td>{item.given.total}</td>
                            <td>{item.received.count}</td>
                            <td>{item.received.total}</td>
                        </tr>
                        {item.occasions.map((oc) => (
                            <tr key={oc.id}>
                                <td className="ps-4">
                                    <i className={`bi ${occasionIcon(oc.name)} me-2`}></i>
                                    {oc.name}
                                </td>
                                <td>{oc.given.count}</td>
                                <td>{oc.given.total}</td>
                                <td>{oc.received.count}</td>
                                <td>{oc.received.total}</td>
                            </tr>
                        ))}
                        {item.persons.map((person) => (
                            <tr key={person.id ?? "felles"}>
                                <td className="ps-4 fst-italic">{person.name}</td>
                                <td>{person.given.count}</td>
                                <td>{person.given.total}</td>
                                <td>{person.received.count}</td>
                                <td>{person.received.total}</td>
                            </tr>
                        ))}
                    </tbody>
                ))}
            </table>

            {/* Mobile: one item per year; the first line is both total and column header */}
            <ul className="gift-list d-md-none">
                {years.map((item) => (
                    <li key={item.year} className="gift-list-item">
                        <div className="gift-list-line gift-list-grid text-body-secondary">
                            <span></span>
                            <span className="text-end">Gitt</span>
                            <span className="text-end">Fått</span>
                        </div>
                        <div className="gift-list-line gift-list-grid fw-bold">
                            <span>{item.year}</span>
                            <MobileTotals totals={item.given} />
                            <MobileTotals totals={item.received} />
                        </div>
                        {item.occasions.map((oc) => (
                            <div key={oc.id} className="gift-list-line gift-list-grid">
                                <span>
                                    <i className={`bi ${occasionIcon(oc.name)} me-2`}></i>
                                    {oc.name}
                                </span>
                                <MobileTotals totals={oc.given} />
                                <MobileTotals totals={oc.received} />
                            </div>
                        ))}
                        {item.persons.map((person) => (
                            <div key={person.id ?? "felles"} className="gift-list-line gift-list-grid">
                                <span className="fst-italic">{person.name}</span>
                                <MobileTotals totals={person.given} />
                                <MobileTotals totals={person.received} />
                            </div>
                        ))}
                    </li>
                ))}
            </ul>
        </>
    );
}
