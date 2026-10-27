import { useState } from "react";
import { Button } from "react-bootstrap";

import { useToasts } from "./toastContext";
import GiftEditModal from "./GiftEditModal";
import { useDeleteGift, useMarkGiftGiven, useOccasions } from "../hooks/useGiftlog.ts";
import type { Gift, GiftPerson } from "../types/giftlog.ts";
import { STATUS_LABELS, STATUS_ORDER, apiErrorMessage, formatKr, occasionIcon, todayIso } from "../utils/giftlog.ts";

type GiftYearListProps = {
    gifts: Gift[];
    isLoading: boolean;
    emptyText: string;
    // given: one year, sorted on occasion. pending: status instead of the date given.
    // history: search results across years, newest first, with status when not all are given
    mode?: "given" | "pending" | "history";
};

const joinNames = (persons: GiftPerson[]) => persons.map((person) => person.name).join(", ");
const compareNb = (a: string, b: string) => a.localeCompare(b, "nb");

function GiftYearList({ gifts, isLoading, emptyText, mode = "given" }: GiftYearListProps) {
    const { addToast } = useToasts();
    const { data: occasions = [] } = useOccasions();
    const deleteGift = useDeleteGift();
    const markGiven = useMarkGiftGiven();

    const [editing, setEditing] = useState<Gift | null>(null);

    const occasionName = (id: number | null) =>
        occasions.find((occasion) => occasion.id === id)?.name ?? "Uten anledning";

    const history = mode === "history";
    const showStatus = mode === "pending" || (history && gifts.some((gift) => gift.status !== "given"));
    const showDate = mode !== "pending";

    // History: newest year and date first (ideas without a year last). Then status, occasion, recipient and giver
    const sortedGifts = [...gifts].sort(
        (a, b) =>
            (history ? (b.year ?? 0) - (a.year ?? 0) || (b.date_given ?? "").localeCompare(a.date_given ?? "") : 0) ||
            STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
            compareNb(occasionName(a.occasion_id), occasionName(b.occasion_id)) ||
            compareNb(joinNames(a.recipients), joinNames(b.recipients)) ||
            compareNb(joinNames(a.givers), joinNames(b.givers))
    );

    const handleDelete = async (gift: Gift) => {
        if (!confirm(`Slette «${gift.title ?? gift.description}»?`)) {
            return;
        }
        try {
            await deleteGift.mutateAsync(gift.id);
            addToast({ variant: "info", title: "Gave slettet", message: gift.title ?? gift.description ?? "" });
        } catch (err) {
            addToast({
                variant: "danger",
                title: "Sletting feilet",
                message: apiErrorMessage(err),
            });
        }
    };

    // Sends the browser's date, so it is today here and not on the server
    const handleMarkGiven = async (gift: Gift) => {
        try {
            await markGiven.mutateAsync({ id: gift.id, date_given: todayIso() });
            addToast({ variant: "success", title: "Markert som gitt", message: gift.title ?? gift.description ?? "" });
        } catch (err) {
            addToast({ variant: "danger", title: "Kunne ikke markere som gitt", message: apiErrorMessage(err) });
        }
    };

    if (isLoading) {
        return <p className="text-light">Laster…</p>;
    }
    if (gifts.length === 0) {
        return <p className="text-light">{emptyText}</p>;
    }

    // Shared by the table and the mobile list
    const renderIcon = (gift: Gift) => {
        const occasion = occasionName(gift.occasion_id);
        return <i className={`bi ${occasionIcon(occasion)}`} title={occasion} aria-label={occasion}></i>;
    };

    const renderTitle = (gift: Gift) => (
        <>
            {gift.title}
            {gift.description && (
                <small className="gift-description d-block text-body-secondary fw-normal">{gift.description}</small>
            )}
        </>
    );

    // Same size and color as the description
    const renderPrice = (gift: Gift) =>
        gift.price !== null && <small className="text-body-secondary text-nowrap">{formatKr(gift.price)}</small>;

    // Gifts not given yet only have a year
    const renderDate = (gift: Gift) => gift.date_given ?? (history ? gift.year : null);

    const renderActions = (gift: Gift) => (
        <div className="d-flex justify-content-end gap-1">
            {gift.status !== "given" && (
                <Button
                    size="sm"
                    variant="outline-success"
                    title="Marker som gitt"
                    aria-label="Marker som gitt"
                    disabled={markGiven.isPending}
                    onClick={() => handleMarkGiven(gift)}>
                    <i className="bi bi-check-lg"></i>
                </Button>
            )}
            <Button
                size="sm"
                variant="outline-light"
                title="Rediger"
                aria-label="Rediger"
                onClick={() => setEditing(gift)}>
                <i className="bi bi-pencil"></i>
            </Button>
            <Button
                size="sm"
                variant="outline-danger"
                title="Slett"
                aria-label="Slett"
                onClick={() => handleDelete(gift)}>
                <i className="bi bi-trash"></i>
            </Button>
        </div>
    );

    return (
        <>
            <table className="table table-dark table-sm align-middle d-none d-md-table">
                <thead className="sticky-head">
                    <tr>
                        <th aria-label="Anledning"></th>
                        {showStatus && <th>Status</th>}
                        <th>Til</th>
                        <th>Fra</th>
                        <th>Gave</th>
                        <th className="text-end">Pris</th>
                        {showDate && <th>Dato gitt</th>}
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {sortedGifts.map((gift) => (
                        <tr key={gift.id}>
                            <td className="text-center">{renderIcon(gift)}</td>
                            {showStatus && <td>{STATUS_LABELS[gift.status]}</td>}
                            <td>{joinNames(gift.recipients)}</td>
                            <td>{joinNames(gift.givers)}</td>
                            <td>{renderTitle(gift)}</td>
                            <td className="text-end">{renderPrice(gift)}</td>
                            {showDate && <td className="text-nowrap">{renderDate(gift)}</td>}
                            <td>{renderActions(gift)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile: one item per gift, with recipient/giver, gift and price/date on their own lines */}
            <ul className="gift-list d-md-none">
                {sortedGifts.map((gift) => (
                    <li key={gift.id} className="gift-list-item">
                        <div className="gift-list-line d-flex flex-wrap align-items-baseline column-gap-2">
                            {renderIcon(gift)}
                            <span>
                                <span className="text-body-secondary">Til</span> {joinNames(gift.recipients)}
                            </span>
                            <span className="ms-auto text-end">
                                <span className="text-body-secondary">fra</span> {joinNames(gift.givers)}
                            </span>
                        </div>
                        <div className="gift-list-line fw-semibold">{renderTitle(gift)}</div>
                        <div className="gift-list-line d-flex align-items-center column-gap-3">
                            {showStatus && <span className="badge text-bg-secondary">{STATUS_LABELS[gift.status]}</span>}
                            {renderPrice(gift)}
                            {showDate && gift.date_given && (
                                <span className="text-body-secondary text-nowrap">gitt {gift.date_given}</span>
                            )}
                            {showDate && !gift.date_given && history && gift.year && (
                                <span className="text-body-secondary text-nowrap">{gift.year}</span>
                            )}
                            <div className="ms-auto">{renderActions(gift)}</div>
                        </div>
                    </li>
                ))}
            </ul>

            <GiftEditModal gift={editing} onHide={() => setEditing(null)} />
        </>
    );
}

export default GiftYearList;
