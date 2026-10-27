import { useId, useRef, useState } from "react";
import { Button, ButtonGroup, Card, Col, Form, Row } from "react-bootstrap";

import { useToasts } from "./toastContext";
import PersonPicker, { type PersonRef } from "./PersonPicker";
import { useCreateGift, useGifts, useOccasions, usePersons, useResolveGiftRefs } from "../hooks/useGiftlog.ts";
import type { Gift, GiftStatus, Person } from "../types/giftlog.ts";
import { STATUS_LABELS, STATUS_ORDER, apiErrorMessage, findByName, todayIso } from "../utils/giftlog.ts";

type QuickChoice = {
    label: string;
    givers: Person[];
    recipients: Person[];
};

const toRef = (person: Person): PersonRef => ({ id: person.id, name: person.name });
const joinNames = (refs: PersonRef[]) => refs.map((ref) => ref.name).join(", ");

// Christmas mode: occasion, date and status are fixed, so only the people and the description are entered
const CHRISTMAS = "Jul";
const CHRISTMAS_TITLE = "Julegave"; // when no description is typed (chk_giftlog_gift_text)
const CHRISTMAS_MODE_KEY = "giftlog.christmasMode";

// Remembered per browser, so a reload on Christmas Eve keeps the mode
function readChristmasMode() {
    try {
        return localStorage.getItem(CHRISTMAS_MODE_KEY) === "1";
    } catch {
        return false;
    }
}

function saveChristmasMode(on: boolean) {
    try {
        localStorage.setItem(CHRISTMAS_MODE_KEY, on ? "1" : "0");
    } catch {
        // Not stored; the mode still works until the page is reloaded
    }
}

// Per giver: the household persons they gave to in these gifts. The household gives to each other
// too, so household givers count as well, but never as giving to themselves
function householdRecipientsByGiver(gifts: Gift[], isHousehold: (ref: PersonRef) => boolean) {
    const result = new Map<number, Set<number>>();
    gifts.forEach((gift) => {
        const householdRecipients = gift.recipients.filter(isHousehold);
        gift.givers.forEach((giver) => {
            const ids = result.get(giver.id) ?? new Set<number>();
            householdRecipients
                .filter((recipient) => recipient.id !== giver.id)
                .forEach((recipient) => ids.add(recipient.id));
            if (ids.size > 0) {
                result.set(giver.id, ids);
            }
        });
    });
    return result;
}

function GiftForm() {
    const { addToast } = useToasts();
    const { data: persons = [] } = usePersons();
    const { data: occasions = [] } = useOccasions();
    const createGift = useCreateGift();
    const { resolvePersons, resolveOccasion } = useResolveGiftRefs();

    const occasionListId = useId();
    const titleRef = useRef<HTMLInputElement>(null);

    const [givers, setGivers] = useState<PersonRef[]>([]);
    const [recipients, setRecipients] = useState<PersonRef[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [occasion, setOccasion] = useState("");
    const [date, setDate] = useState(todayIso());
    const [status, setStatus] = useState<GiftStatus>("given");
    const [christmas, setChristmas] = useState(readChristmasMode);
    const [saving, setSaving] = useState(false);

    const household = persons.filter((person) => person.is_household === 1);
    const isHousehold = (ref: PersonRef) => household.some((person) => person.id === ref.id);

    // The household gives by default; in Christmas mode the household receives
    const applyDefaults = (christmasMode: boolean) => {
        setGivers(christmasMode ? [] : household.map(toRef));
        setRecipients(christmasMode ? household.map(toRef) : []);
    };

    // Once the persons are loaded
    const [defaultsSet, setDefaultsSet] = useState(false);
    if (!defaultsSet && household.length > 0) {
        setDefaultsSet(true);
        applyDefaults(christmas);
    }

    const toggleChristmas = (on: boolean) => {
        setChristmas(on);
        saveChristmasMode(on);
        applyDefaults(on);
    };

    // Christmas gifts this year and the history years before it
    const thisYear = new Date().getFullYear();
    const christmasOccasion = findByName(occasions, CHRISTMAS);
    const isChristmasGift = (gift: Gift) => gift.occasion_id === christmasOccasion?.id;
    const { data: givenThisYear = [] } = useGifts({ year: thisYear, status: "given" });
    const { data: givenLastYear = [] } = useGifts({ year: thisYear - 1, status: "given" });
    const { data: givenYearBefore = [] } = useGifts({ year: thisYear - 2, status: "given" });
    const christmasThisYear = givenThisYear.filter(isChristmasGift);
    const christmasHistory = [...givenLastYear, ...givenYearBefore].filter(isChristmasGift);

    // Household persons each person has given Christmas gifts to before (expected) and this year
    const expectedRecipients = householdRecipientsByGiver(christmasHistory, isHousehold);
    const receivedThisYear = householdRecipientsByGiver(christmasThisYear, isHousehold);

    // Without any history, everyone is expected to give to those in «Til» (except themselves)
    const hasHistory = expectedRecipients.size > 0;
    const tilIds = recipients.flatMap((ref) => (ref.id === undefined ? [] : [ref.id]));

    // Who a person still has not given to. Jointly or one each does not matter, only that everyone is covered
    const remainingFor = (personId: number) => {
        const expected = hasHistory ? (expectedRecipients.get(personId) ?? []) : tilIds;
        const received = receivedThisYear.get(personId);
        return [...expected].filter((id) => id !== personId && !received?.has(id));
    };
    // The household first, then by name
    const remainingGivers = persons
        .filter((person) => remainingFor(person.id).length > 0)
        .sort((a, b) => b.is_household - a.is_household || a.name.localeCompare(b.name, "nb"));

    const isGiver = (person: Person) => givers.some((ref) => ref.id === person.id);

    // «Til» follows who the chosen givers still have not given to (only with history; without it «Til» decides the list)
    const toggleGiver = (person: Person) => {
        const next = isGiver(person) ? givers.filter((ref) => ref.id !== person.id) : [...givers, toRef(person)];
        setGivers(next);
        if (!hasHistory) {
            // Nobody gives to themselves
            setRecipients((prev) => prev.filter((ref) => !next.some((giver) => giver.id === ref.id)));
            return;
        }
        const ids = new Set(next.flatMap((ref) => (ref.id === undefined ? [] : remainingFor(ref.id))));
        if (ids.size > 0) {
            setRecipients(household.filter((member) => ids.has(member.id)).map(toRef));
        }
    };

    const quickChoices: QuickChoice[] = [
        {
            label: household.length === 1 ? `Fra ${household[0].name}` : "Fra oss",
            givers: household,
            recipients: [],
        },
        ...household.map((person) => ({
            label: `Til ${person.name}`,
            givers: [],
            recipients: [person],
        })),
        ...(household.length > 1 ? [{ label: "Til oss", givers: [], recipients: household }] : []),
    ];

    // Compares only the household persons, so a typed-in giver keeps the choice active
    const sameHousehold = (refs: PersonRef[], wanted: Person[]) => {
        const ids = refs.filter(isHousehold).map((ref) => ref.id);
        return ids.length === wanted.length && wanted.every((person) => ids.includes(person.id));
    };
    const isActive = (choice: QuickChoice) =>
        sameHousehold(givers, choice.givers) && sameHousehold(recipients, choice.recipients);

    // Replaces only the household persons, so typed-in names stay when switching choice
    const applyChoice = (choice: QuickChoice) => {
        const typedIn = (refs: PersonRef[]) => refs.filter((ref) => !isHousehold(ref));
        setGivers((prev) => [...choice.givers.map(toRef), ...typedIn(prev)]);
        setRecipients((prev) => [...choice.recipients.map(toRef), ...typedIn(prev)]);
    };

    // Christmas mode fills in the hidden fields
    const fields = christmas
        ? { status: "given" as GiftStatus, occasion: CHRISTMAS, date: `${thisYear}-12-24`, title: "", price: "" }
        : { status, occasion, date, title, price };

    // Only given gifts have a date given
    const isGiven = fields.status === "given";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const giftTitle = fields.title.trim() || (christmas && !description.trim() ? CHRISTMAS_TITLE : "");
        const missing = [
            givers.length === 0 && "fra",
            recipients.length === 0 && "til",
            // The database needs at least one of them (chk_giftlog_gift_text)
            !giftTitle && !description.trim() && "gave eller beskrivelse",
            // Everything but ideas needs year and occasion (chk_giftlog_gift_idea)
            fields.status !== "idea" && !fields.occasion.trim() && "anledning",
            isGiven && !fields.date && "dato gitt",
        ].filter(Boolean);
        if (missing.length > 0) {
            addToast({ variant: "warning", title: "Mangler felt", message: missing.join(", ") });
            return;
        }

        setSaving(true);
        try {
            const [giver_ids, recipient_ids] = await resolvePersons(givers, recipients);
            const occasion_id = await resolveOccasion(fields.occasion);

            await createGift.mutateAsync({
                title: giftTitle || null,
                description: description.trim() || null,
                // Year follows the date given; bought and sent gifts are this year's, ideas have none
                year: isGiven ? Number(fields.date.slice(0, 4)) : fields.status === "idea" ? null : thisYear,
                date_given: isGiven ? fields.date : null,
                occasion_id,
                status: fields.status,
                price: fields.price === "" ? null : Number(fields.price),
                giver_ids,
                recipient_ids,
            });

            addToast({
                variant: "success",
                title: "Gave registrert",
                message:
                    `${giftTitle || description.trim()}: fra ${joinNames(givers)} til ${joinNames(recipients)}` +
                    (isGiven ? "" : ` (${STATUS_LABELS[fields.status].toLowerCase()})`),
            });

            setTitle("");
            setDescription("");
            setPrice("");
            if (christmas) {
                // The next giver is picked from the list, which sets «Til» when there is history
                setGivers([]);
                if (!hasHistory) {
                    setRecipients(household.map(toRef));
                }
            } else {
                // Keep occasion, date and the household side for the next gift
                setGivers((prev) => prev.filter(isHousehold));
                setRecipients((prev) => prev.filter(isHousehold));
                titleRef.current?.focus();
            }
        } catch (err) {
            addToast({ variant: "danger", title: "Lagring feilet", message: apiErrorMessage(err) });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <Card.Body>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                    {household.length === 0 ? (
                        <small className="text-body-secondary">
                            Marker deg selv og samboeren som husstand under «Rediger personer» nederst for å få hurtigvalg.
                        </small>
                    ) : (
                        <ButtonGroup>
                            {quickChoices.map((choice) => (
                                <Button
                                    key={choice.label}
                                    variant={isActive(choice) ? "primary" : "outline-primary"}
                                    onClick={() => applyChoice(choice)}
                                >
                                    {choice.label}
                                </Button>
                            ))}
                        </ButtonGroup>
                    )}
                    <Form.Check
                        type="switch"
                        id="christmas-mode"
                        className="ms-auto"
                        label={
                            <>
                                <i className="bi bi-snow2 me-1"></i>Julegavemodus
                            </>
                        }
                        checked={christmas}
                        onChange={(e) => toggleChristmas(e.target.checked)}
                    />
                </div>

                {christmas && (
                    <div className="mb-3">
                        <small className="text-body-secondary d-block mb-1">
                            Jul, gitt 24.12.{thisYear} · {remainingGivers.length} igjen å registrere fra
                            {hasHistory ? " (basert på julegaver de to siste årene)" : ""}
                        </small>
                        <div className="d-flex flex-wrap gap-1">
                            {remainingGivers.map((person) => (
                                <Button
                                    key={person.id}
                                    size="sm"
                                    variant={isGiver(person) ? "primary" : "outline-secondary"}
                                    aria-pressed={isGiver(person)}
                                    onClick={() => toggleGiver(person)}>
                                    {person.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <Form onSubmit={handleSubmit}>
                    <Row className="g-2 mb-2">
                        <Col md={6}>
                            <PersonPicker label="Fra" value={givers} persons={persons} onChange={setGivers} />
                        </Col>
                        <Col md={6}>
                            <PersonPicker
                                label="Til"
                                value={recipients}
                                persons={persons}
                                onChange={setRecipients}
                            />
                        </Col>
                    </Row>

                    <Row className="g-2 mb-3">
                        {!christmas && (
                            // The title field takes the date's place when there is no date given
                            <Col md={isGiven ? 5 : 7}>
                                <Form.Group controlId="gift-title">
                                    <Form.Label>Gave</Form.Label>
                                    <Form.Control
                                        ref={titleRef}
                                        maxLength={150}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        )}
                        {/* Right below the title on mobile, a full line of its own last in the row from md */}
                        <Col xs={12} className="order-md-last">
                            <Form.Group controlId="gift-description">
                                <Form.Label>Beskrivelse</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        {!christmas && (
                            <>
                                <Col xs={6} md={2}>
                                    <Form.Group controlId="gift-price">
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
                                <Col xs={6} md={3}>
                                    <Form.Group controlId="gift-occasion">
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
                                {isGiven && (
                                    <Col md={2}>
                                        <Form.Group controlId="gift-date">
                                            <Form.Label>Dato gitt</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                            />
                                        </Form.Group>
                                    </Col>
                                )}
                            </>
                        )}
                    </Row>

                    <div className="d-flex align-items-center gap-2">
                        <Button type="submit" variant="success" disabled={saving}>
                            {saving ? "Lagrer…" : "Registrer gave"}
                        </Button>
                        {!christmas && (
                            <Form.Select
                                className="w-auto"
                                aria-label="Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value as GiftStatus)}>
                                {STATUS_ORDER.map((item) => (
                                    <option key={item} value={item}>
                                        {STATUS_LABELS[item]}
                                    </option>
                                ))}
                            </Form.Select>
                        )}
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
}

export default GiftForm;
