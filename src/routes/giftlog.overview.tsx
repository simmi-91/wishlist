import { createFileRoute } from "@tanstack/react-router";

import { useState } from "react";
import { Button, Col, Collapse, Row } from "react-bootstrap";
import { StatusSummary, YearSummary } from "../components/GiftSummaryTables";
import PersonManager from "../components/PersonManager";

// ProtectedRoute and the dark container come from the /giftlog layout
export const Route = createFileRoute("/giftlog/overview")({
    component: GiftlogOverviewRoute,
});

function GiftlogOverviewRoute() {
    const [showPersons, setShowPersons] = useState(false);

    return (
        <>
            <Row>
                <Col>
                    <h5 className="text-light">Per år</h5>
                    <StatusSummary />
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
