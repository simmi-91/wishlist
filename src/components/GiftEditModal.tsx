import { useId, useState } from "react";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

import { useToasts } from "./toastContext";
import PersonPicker, { type PersonRef } from "./PersonPicker";
import { useOccasions, usePersons, useResolveGiftRefs, useUpdateGift } from "../hooks/useGiftlog.ts";
import type { Gift, GiftStatus } from "../types/giftlog.ts";
import { STATUS_LABELS, STATUS_ORDER, apiErrorMessage, todayIso } from "../utils/giftlog.ts";

type GiftEditModalProps = {
    gift: Gift | null;
    onHide: () => void;
};

function GiftEditModal({ gift, onHide }: GiftEditModalProps) {
    return (
        <Modal show={gift !== null} onHide={onHide} size="lg" data-bs-theme="dark">
            {/* key resets the form for each gift */}
            {gift && <GiftEditForm key={gift.id} gift={gift} onDone={onHide} />}
        </Modal>
    );
}

type GiftEditFormProps = {
    gift: Gift;
    onDone: () => void;
};

function GiftEditForm({ gift, onDone }: GiftEditFormProps) {
    const { addToast } = useToasts();
    const { data: persons = [] } = usePersons();
    const { data: occasions = [] } = useOccasions();
    const updateGift = useUpdateGift();
    const { resolvePersons, resolveOccasion } = useResolveGiftRefs();

    const occasionListId = useId();

    const [givers, setGivers] = useState<PersonRef[]>(gift.givers);
    const [recipients, setRecipients] = useState<PersonRef[]>(gift.recipients);
    const [title, setTitle] = useState(gift.title ?? "");
    const [description, setDescription] = useState(gift.description ?? "");
    const [price, setPrice] = useState(gift.price === null ? "" : String(gift.price));
    const [occasion, setOccasion] = useState(
        occasions.find((item) => item.id === gift.occasion_id)?.name ?? ""
    );
    const [status, setStatus] = useState<GiftStatus>(gift.status);
    const [date, setDate] = useState(gift.date_given ?? "");
    const [saving, setSaving] = useState(false);

    // A gift that becomes given gets today's date if it has none
    const changeStatus = (value: GiftStatus) => {
        setStatus(value);
        if (value === "given" && !date) {
            setDate(todayIso());
        }
    };

    // Only given gifts have a date given
    const isGiven = status === "given";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Title or description (chk_giftlog_gift_text); everything but ideas needs year and occasion (chk_giftlog_gift_idea)
        const missing = [
            !title.trim() && !description.trim() && "gave eller beskrivelse",
            status !== "idea" && !occasion.trim() && "anledning",
            isGiven && !date && "dato gitt",
        ].filter(Boolean);
        if (missing.length > 0) {
            addToast({ variant: "warning", title: "Mangler felt", message: missing.join(", ") });
            return;
        }

        // Year follows the date given; otherwise the gift keeps its year, or gets this year if it needs one
        const year = isGiven
            ? Number(date.slice(0, 4))
            : gift.year ?? (status === "idea" ? null : new Date().getFullYear());

        setSaving(true);
        try {
            const [giver_ids, recipient_ids] = await resolvePersons(givers, recipients);
            const occasion_id = await resolveOccasion(occasion);

            await updateGift.mutateAsync({
                id: gift.id,
                data: {
                    title: title.trim() || null,
                    description: description.trim() || null,
                    year,
                    date_given: isGiven ? date : null,
                    occasion_id,
                    status,
                    price: price === "" ? null : Number(price),
                    giver_ids,
                    recipient_ids,
                },
            });

            addToast({ variant: "success", title: "Gave oppdatert", message: title.trim() || description.trim() });
            onDone();
        } catch (err) {
            addToast({ variant: "danger", title: "Lagring feilet", message: apiErrorMessage(err) });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Modal.Header closeButton>
                <Modal.Title>Rediger gave</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Row className="g-2 mb-2">
                    <Col md={6}>
                        <PersonPicker label="Fra" value={givers} persons={persons} onChange={setGivers} />
                    </Col>
                    <Col md={6}>
                        <PersonPicker label="Til" value={recipients} persons={persons} onChange={setRecipients} />
                    </Col>
                </Row>

                <Row className="g-2 mb-2">
                    <Col md={8}>
                        <Form.Group controlId="edit-gift-title">
                            <Form.Label>Gave</Form.Label>
                            <Form.Control maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} />
                        </Form.Group>
                    </Col>
                    {/* Right below the title on mobile, a full line of its own last in the row from md */}
                    <Col xs={12} className="order-md-last">
                        <Form.Group controlId="edit-gift-description">
                            <Form.Label>Beskrivelse</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="edit-gift-price">
                            <Form.Label>Pris</Form.Label>
                            <Form.Control
                                type="number"
                                inputMode="numeric"
                                min={0}
                                step={1}
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="g-2">
                    <Col md={4}>
                        <Form.Group controlId="edit-gift-occasion">
                            <Form.Label>Anledning</Form.Label>
                            <Form.Control
                                list={occasionListId}
                                value={occasion}
                                placeholder="F.eks. Jul"
                                onChange={(e) => setOccasion(e.target.value)}
                            />
                            <datalist id={occasionListId}>
                                {occasions.map((item) => (
                                    <option key={item.id} value={item.name} />
                                ))}
                            </datalist>
                        </Form.Group>
                    </Col>
                    <Col xs={6} md={4}>
                        <Form.Group controlId="edit-gift-status">
                            <Form.Label>Status</Form.Label>
                            <Form.Select
                                value={status}
                                onChange={(e) => changeStatus(e.target.value as GiftStatus)}
                            >
                                {STATUS_ORDER.map((item) => (
                                    <option key={item} value={item}>
                                        {STATUS_LABELS[item]}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    {isGiven && (
                        <Col xs={6} md={4}>
                            <Form.Group controlId="edit-gift-date">
                                <Form.Label>Dato gitt</Form.Label>
                                <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                            </Form.Group>
                        </Col>
                    )}
                </Row>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onDone}>
                    Avbryt
                </Button>
                <Button type="submit" variant="success" disabled={saving}>
                    {saving ? "Lagrer…" : "Lagre"}
                </Button>
            </Modal.Footer>
        </Form>
    );
}

export default GiftEditModal;
