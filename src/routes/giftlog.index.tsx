import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useGiftYears, useGifts, usePendingGifts } from "../hooks/useGiftlog.ts";
import GiftForm from "../components/GiftForm";
import GiftYearList from "../components/GiftYearList";

// ProtectedRoute and the dark container come from the /giftlog layout
export const Route = createFileRoute("/giftlog/")({
    component: GiftlogRegisterRoute,
});

function GiftlogRegisterRoute() {
    const [year, setYear] = useState(new Date().getFullYear());
    const { data: years = [year] } = useGiftYears();
    const given = useGifts({ year, status: "given" });
    const pending = usePendingGifts();

    return (
        <>
            <Row>
                {/* Same space below as the tables (.table / .gift-list margin-bottom) */}
                <Col className="mb-3">
                    <GiftForm />
                </Col>
            </Row>

            <Row>
                <Col>
                    <h5 className="text-light d-flex align-items-center gap-2">
                        Gitt i
                        <Form.Select
                            size="sm"
                            className="w-auto"
                            aria-label="År"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}>
                            {years.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </Form.Select>
                    </h5>
                    <GiftYearList
                        gifts={given.data ?? []}
                        isLoading={given.isLoading}
                        emptyText={`Ingen gaver gitt i ${year}.`}
                    />
                </Col>
            </Row>

            <Row>
                <Col>
                    <h5 className="text-light">Ideer og på vei</h5>
                    <GiftYearList
                        gifts={pending.data}
                        isLoading={pending.isLoading}
                        emptyText="Ingen ideer eller gaver på vei."
                        mode="pending"
                    />
                </Col>
            </Row>
        </>
    );
}
