import { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";

import { useToasts } from "./toastContext";
import { useCreatePerson, useDeletePerson, usePersons, useUpdatePerson } from "../hooks/useGiftlog.ts";
import type { Person } from "../types/giftlog.ts";
import { apiErrorMessage } from "../utils/giftlog.ts";

function PersonManager() {
    const { addToast } = useToasts();
    const { data: persons = [] } = usePersons();
    const createPerson = useCreatePerson();
    const updatePerson = useUpdatePerson();
    const deletePerson = useDeletePerson();

    const [name, setName] = useState("");
    const [isHousehold, setIsHousehold] = useState(false);

    // Person whose name is being edited in the table
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");

    // Household first, then by name
    const sortedPersons = [...persons].sort(
        (a, b) => b.is_household - a.is_household || a.name.localeCompare(b.name, "nb")
    );

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            return;
        }
        try {
            await createPerson.mutateAsync({ name: name.trim(), is_household: isHousehold });
            setName("");
            setIsHousehold(false);
        } catch (err) {
            addToast({ variant: "danger", title: "Kunne ikke legge til", message: apiErrorMessage(err) });
        }
    };

    const toggleHousehold = async (person: Person) => {
        try {
            await updatePerson.mutateAsync({
                id: person.id,
                data: { name: person.name, is_household: person.is_household !== 1 },
            });
        } catch (err) {
            addToast({ variant: "danger", title: "Oppdatering feilet", message: apiErrorMessage(err) });
        }
    };

    const startEdit = (person: Person) => {
        setEditingId(person.id);
        setEditName(person.name);
    };

    const cancelEdit = () => setEditingId(null);

    const saveEdit = async (person: Person) => {
        const newName = editName.trim();
        if (!newName) {
            return;
        }
        if (newName === person.name) {
            cancelEdit();
            return;
        }
        try {
            await updatePerson.mutateAsync({
                id: person.id,
                data: { name: newName, is_household: person.is_household === 1 },
            });
            cancelEdit();
        } catch (err) {
            addToast({ variant: "danger", title: "Kunne ikke lagre", message: apiErrorMessage(err) });
        }
    };

    const handleDelete = async (person: Person) => {
        if (!confirm(`Slette ${person.name}?`)) {
            return;
        }
        try {
            await deletePerson.mutateAsync(person.id);
        } catch (err) {
            addToast({ variant: "danger", title: "Sletting feilet", message: apiErrorMessage(err) });
        }
    };

    return (
        <>
            <Form onSubmit={handleAdd} className="mb-2">
                <Row className="g-2 align-items-center">
                    <Col xs={12} sm>
                        <Form.Control
                            placeholder="Navn"
                            aria-label="Navn"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Col>
                    <Col xs="auto">
                        <Form.Check
                            id="new-person-household"
                            label="Husstand"
                            className="text-light"
                            checked={isHousehold}
                            onChange={(e) => setIsHousehold(e.target.checked)}
                        />
                    </Col>
                    <Col xs="auto">
                        <Button type="submit" variant="success" disabled={createPerson.isPending}>
                            Legg til
                        </Button>
                    </Col>
                </Row>
            </Form>

            <table className="table table-dark table-sm align-middle">
                <thead className="sticky-head">
                    <tr>
                        <th>Navn</th>
                        <th>Husstand</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {sortedPersons.map((person) => (
                        <tr key={person.id}>
                            <td>
                                {editingId === person.id ? (
                                    <Form.Control
                                        size="sm"
                                        autoFocus
                                        aria-label="Nytt navn"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                saveEdit(person);
                                            } else if (e.key === "Escape") {
                                                cancelEdit();
                                            }
                                        }}
                                    />
                                ) : (
                                    person.name
                                )}
                            </td>
                            <td>
                                <Form.Check
                                    type="switch"
                                    id={`household-${person.id}`}
                                    aria-label={`${person.name} er i husstanden`}
                                    checked={person.is_household === 1}
                                    onChange={() => toggleHousehold(person)}
                                />
                            </td>
                            <td className="text-end text-nowrap">
                                {editingId === person.id ? (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="success"
                                            aria-label="Lagre navn"
                                            disabled={updatePerson.isPending}
                                            onClick={() => saveEdit(person)}
                                        >
                                            <i className="bi bi-check-lg"></i>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-secondary"
                                            className="ms-1"
                                            aria-label="Avbryt"
                                            onClick={cancelEdit}
                                        >
                                            <i className="bi bi-x-lg"></i>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            size="sm"
                                            variant="outline-light"
                                            aria-label={`Rediger ${person.name}`}
                                            onClick={() => startEdit(person)}
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline-danger"
                                            className="ms-1"
                                            aria-label={`Slett ${person.name}`}
                                            onClick={() => handleDelete(person)}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </Button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}

export default PersonManager;
