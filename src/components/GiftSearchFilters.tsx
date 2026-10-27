import { useEffect, useRef, useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

import { useGiftYears, useOccasions, usePersons } from "../hooks/useGiftlog.ts";
import type { GiftFilters, GiftRole, GiftStatus } from "../types/giftlog.ts";
import { STATUS_LABELS, STATUS_ORDER } from "../utils/giftlog.ts";

type GiftSearchFiltersProps = {
    filters: GiftFilters;
    // Only the changed filters; undefined removes one
    onChange: (changes: Partial<GiftFilters>, options?: { replace?: boolean }) => void;
};

// Wait this long after the last key press before searching
const SEARCH_DELAY_MS = 300;

const toNumber = (value: string) => (value ? Number(value) : undefined);

function GiftSearchFilters({ filters, onChange }: GiftSearchFiltersProps) {
    const { data: years = [] } = useGiftYears();
    const { data: occasions = [] } = useOccasions();
    const { data: persons = [] } = usePersons();

    const [text, setText] = useState(filters.q ?? "");
    const timer = useRef<number | undefined>(undefined);

    // Follows the URL when it changes from outside, e.g. the back button
    const [urlText, setUrlText] = useState(filters.q);
    if (filters.q !== urlText) {
        setUrlText(filters.q);
        if ((filters.q ?? "") !== text.trim()) {
            setText(filters.q ?? "");
        }
    }

    // Otherwise a search typed just before leaving the page would navigate back to it
    useEffect(() => () => window.clearTimeout(timer.current), []);

    // Household first, then by name
    const sortedPersons = [...persons].sort(
        (a, b) => b.is_household - a.is_household || a.name.localeCompare(b.name, "nb")
    );
    const sortedOccasions = [...occasions].sort((a, b) => a.name.localeCompare(b.name, "nb"));

    // Replaces the history entry, so the back button doesn't step through every letter
    const changeText = (value: string) => {
        setText(value);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(
            () => onChange({ q: value.trim() || undefined }, { replace: true }),
            SEARCH_DELAY_MS
        );
    };

    const hasFilters = Object.values(filters).some((value) => value !== undefined);
    const reset = () => {
        window.clearTimeout(timer.current);
        setText("");
        onChange({
            q: undefined,
            year: undefined,
            occasion_id: undefined,
            status: undefined,
            person_id: undefined,
            role: undefined,
        });
    };

    return (
        <Form onSubmit={(e) => e.preventDefault()} className="mb-3">
            <Row className="g-2">
                <Col xs={12} lg={4}>
                    <Form.Control
                        type="search"
                        placeholder="Søk i gave og beskrivelse"
                        aria-label="Søk i gave og beskrivelse"
                        value={text}
                        onChange={(e) => changeText(e.target.value)}
                    />
                </Col>
                <Col xs={6} md={3} lg={2}>
                    <Form.Select
                        aria-label="År"
                        value={filters.year ?? ""}
                        onChange={(e) => onChange({ year: toNumber(e.target.value) })}>
                        <option value="">Alle år</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col xs={6} md={3} lg={2}>
                    <Form.Select
                        aria-label="Anledning"
                        value={filters.occasion_id ?? ""}
                        onChange={(e) => onChange({ occasion_id: toNumber(e.target.value) })}>
                        <option value="">Alle anledninger</option>
                        {sortedOccasions.map((occasion) => (
                            <option key={occasion.id} value={occasion.id}>
                                {occasion.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col xs={12} md={6} lg={4}>
                    {/* The backend leaves ideas out unless status is idea */}
                    <Form.Select
                        aria-label="Status"
                        value={filters.status ?? ""}
                        onChange={(e) => onChange({ status: (e.target.value || undefined) as GiftStatus | undefined })}>
                        <option value="">Alle unntatt ideer</option>
                        {STATUS_ORDER.map((status) => (
                            <option key={status} value={status}>
                                {STATUS_LABELS[status]}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col xs={6} md={3} lg={4}>
                    <Form.Select
                        aria-label="Person"
                        value={filters.person_id ?? ""}
                        onChange={(e) => onChange({ person_id: toNumber(e.target.value) })}>
                        <option value="">Alle personer</option>
                        {sortedPersons.map((person) => (
                            <option key={person.id} value={person.id}>
                                {person.name}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col xs={6} md={3} lg={2}>
                    <Form.Select
                        aria-label="Fra eller til"
                        value={filters.role ?? ""}
                        disabled={filters.person_id === undefined}
                        onChange={(e) => onChange({ role: (e.target.value || undefined) as GiftRole | undefined })}>
                        <option value="">Fra eller til</option>
                        <option value="giver">Fra</option>
                        <option value="recipient">Til</option>
                    </Form.Select>
                </Col>
                <Col xs="auto">
                    <Button variant="outline-light" disabled={!hasFilters} onClick={reset}>
                        <i className="bi bi-x-lg me-1"></i>
                        Nullstill
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}

export default GiftSearchFilters;
