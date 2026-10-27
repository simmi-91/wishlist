import { useId, useState } from "react";
import { Badge, CloseButton, Form } from "react-bootstrap";

import type { Person } from "../types/giftlog.ts";
import { findByName } from "../utils/giftlog.ts";

// id is missing for names that are not saved as a person yet
export type PersonRef = { id?: number; name: string };

type PersonPickerProps = {
    label: string;
    value: PersonRef[];
    persons: Person[];
    onChange: (value: PersonRef[]) => void;
};

function PersonPicker({ label, value, persons, onChange }: PersonPickerProps) {
    const inputId = useId();
    const listId = useId();
    const [draft, setDraft] = useState("");

    const isSelected = (name: string) => findByName(value, name) !== undefined;

    const add = (text: string) => {
        const name = text.trim();
        setDraft("");
        if (!name || isSelected(name)) {
            return;
        }
        const existing = findByName(persons, name);
        onChange([...value, existing ? { id: existing.id, name: existing.name } : { name }]);
    };

    const remove = (name: string) => onChange(value.filter((person) => person.name !== name));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Picking from the datalist fills in the whole name in one go
        const inputType = (e.nativeEvent as InputEvent).inputType;
        const fromList = inputType === undefined || inputType === "insertReplacementText";
        if (fromList && findByName(persons, e.target.value)) {
            add(e.target.value);
            return;
        }
        setDraft(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
            e.preventDefault();
            add(draft);
        } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    };

    return (
        <Form.Group>
            <Form.Label htmlFor={inputId}>{label}</Form.Label>
            <div className="form-control d-flex flex-wrap align-items-center gap-1">
                {value.map((person) => (
                    <Badge
                        key={person.name}
                        bg={person.id ? "secondary" : "info"}
                        className="d-flex align-items-center gap-1"
                    >
                        {person.name}
                        {!person.id && " (ny)"}
                        <CloseButton
                            variant="white"
                            style={{ fontSize: "0.6em" }}
                            aria-label={`Fjern ${person.name}`}
                            onClick={() => remove(person.name)}
                        />
                    </Badge>
                ))}
                <input
                    id={inputId}
                    list={listId}
                    value={draft}
                    placeholder={value.length === 0 ? "Skriv navn" : ""}
                    className="border-0 bg-transparent flex-grow-1"
                    style={{ outline: "none", minWidth: "8em", color: "inherit" }}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onBlur={() => add(draft)}
                />
            </div>
            <datalist id={listId}>
                {persons
                    .filter((person) => !isSelected(person.name))
                    .map((person) => (
                        <option key={person.id} value={person.name} />
                    ))}
            </datalist>
        </Form.Group>
    );
}

export default PersonPicker;
