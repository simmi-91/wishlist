import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import { Button, Col, Collapse, Row } from "react-bootstrap";
import { useGifts } from "../hooks/useGiftlog.ts";
import type { GiftFilters } from "../types/giftlog.ts";
import { STATUS_ORDER, formatKr } from "../utils/giftlog.ts";
import GiftSearchFilters from "../components/GiftSearchFilters";
import { StatusSummary, YearSummary } from "../components/GiftSummaryTables";
import GiftYearList from "../components/GiftYearList";
import PersonManager from "../components/PersonManager";

const positiveInt = (value: unknown) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : undefined;
};

// The filters live in the URL, e.g. /giftlog/history?q=lego&year=2024,
// so the back button and bookmarks keep the search. Unknown values are dropped
function validateSearch(search: Record<string, unknown>): GiftFilters {
    const { q, year, occasion_id, status, person_id, role } = search;
    return {
        q: typeof q === "string" && q.trim() ? q.trim() : undefined,
        year: positiveInt(year),
        occasion_id: positiveInt(occasion_id),
        status: STATUS_ORDER.find((item) => item === status),
        person_id: positiveInt(person_id),
        role: role === "giver" || role === "recipient" ? role : undefined,
    };
}

// ProtectedRoute and the dark container come from the /giftlog layout
export const Route = createFileRoute("/giftlog/history")({
    validateSearch,
    component: GiftlogHistoryRoute,
});

function GiftlogHistoryRoute() {
    const filters = Route.useSearch();
    const navigate = Route.useNavigate();
    const gifts = useGifts(filters);
    const [showPersons, setShowPersons] = useState(false);

    const changeFilters = (changes: Partial<GiftFilters>, options?: { replace?: boolean }) =>
        navigate({ search: (prev) => ({ ...prev, ...changes }), replace: options?.replace });

    const found = gifts.data ?? [];
    const total = found.reduce((sum, gift) => sum + (gift.price ?? 0), 0);

    return (
        <>
            <Row>
                <Col>
                    <h5 className="text-light">Søk i gaver</h5>
                    <GiftSearchFilters filters={filters} onChange={changeFilters} />
                    {found.length > 0 && (
                        <p className="text-light small">
                            {found.length} {found.length === 1 ? "gave" : "gaver"} · {formatKr(total)}
                        </p>
                    )}
                    <GiftYearList
                        gifts={found}
                        isLoading={gifts.isLoading}
                        emptyText="Ingen gaver passer søket."
                        mode="history"
                    />
                </Col>
            </Row>

            <Row>
                <Col>
                    <h5 className="text-light">Per status</h5>
                    <StatusSummary />
                </Col>
            </Row>

            <Row>
                <Col>
                    <h5 className="text-light">Per år</h5>
                    <YearSummary />
                </Col>
            </Row>

            <Row>
                <Col>
                    {/* Only needed now and then, so hidden until asked for */}
                    <Button
                        variant="outline-light"
                        size="sm"
                        className="mb-2"
                        aria-expanded={showPersons}
                        aria-controls="person-manager"
                        onClick={() => setShowPersons((shown) => !shown)}>
                        <i className={`bi bi-chevron-${showPersons ? "up" : "down"} me-1`}></i>
                        {showPersons ? "Skjul personer" : "Rediger personer"}
                    </Button>
                    <Collapse in={showPersons}>
                        <div id="person-manager">
                            <PersonManager />
                        </div>
                    </Collapse>
                </Col>
            </Row>
        </>
    );
}
