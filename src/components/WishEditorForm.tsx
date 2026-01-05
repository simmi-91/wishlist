import { useState, useEffect } from "react";

import { useToasts } from "./toastContext";
import { usePendingChanges } from "../hooks/usePendingChanges";
import {
  useCreateWishlistItem,
  useUpdateWishlistItem,
} from "../hooks/useWishlist";
import type { WishlistItem, NewWishlistItem } from "../types/wishlist";

import { Alert, Button, Form, Row, Col } from "react-bootstrap";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type WishEditorFormProps = {
  wish: WishlistItem | NewWishlistItem;
  onCancel: () => void;
};

function WishEditorForm({ wish, onCancel }: WishEditorFormProps) {
  const { addToast } = useToasts();
  const setHasPendingChanges = usePendingChanges(
    (state) => state.setHasPendingChanges
  );

  const sanitizeQuillTextForSave = (value: string) => {
    if (typeof value !== "string") return "";
    let trimmed = value.replace(/(?:<p><br><\/p>)+$/i, "").trim();
    trimmed = trimmed.replace(/;\s*/gi, "").trim();
    return trimmed;
  };

  const [formData, setFormData] = useState({
    title: wish.title,
    description: wish.description,
    active: wish.active ?? 0,
    category: wish.category ?? 0,
  });
  const [originalData, setOriginalData] = useState(formData);

  useEffect(() => {
    const hasChanges =
      JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasPendingChanges(hasChanges);
  }, [formData, originalData, setHasPendingChanges]);

  const isExisting = "id" in wish;
  const updateWish = useUpdateWishlistItem();
  const createWish = useCreateWishlistItem();

  const handleQuillChange = (content: string, name: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: content };
      return newData;
    });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.target;
    const { name, value } = target;

    const newValue =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
          ? 1
          : 0
        : value;

    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]: newValue,
      };

      return newData;
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        description: sanitizeQuillTextForSave(formData.description),
      };

      if (isExisting) {
        await updateWish.mutateAsync({
          id: wish.id,
          data: payload,
        });
        addToast({
          variant: "success",
          title: "Wish saved",
          message: `Saved wish ${wish.id} with title "${formData.title}"`,
        });
      } else {
        await createWish.mutateAsync({
          ...payload,
        });
        addToast({
          variant: "success",
          title: "Wish created",
          message: `Created new wish with title "${formData.title}"`,
        });
      }

      setOriginalData(payload);
      setFormData(payload);
    } catch (err) {
      const message = (err as Error)?.message ?? "Unknown error";
      addToast({
        variant: "danger",
        title: "Save failed",
        message,
      });
    }
  };

  const handleCancel = async () => {
    onCancel();
  };

  return (
    <div className="bg-white border rounded-4 p-3 h-100">
      <h5 className="mb-3">
        {isExisting ? `Edit “${wish.title}”` : "Add new wish"}
      </h5>

      <Form className="d-flex flex-column gap-3">
        <Form.Group controlId="wishTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Wish title"
            className={
              formData.title === originalData.title
                ? ""
                : "border border-warning"
            }
          />
        </Form.Group>
        <Form.Group>
          <Form.Label as="span" className="form-label">
            Description
          </Form.Label>
          <ReactQuill
            theme="snow"
            value={formData.description}
            onChange={(content) => handleQuillChange(content, "description")}
            placeholder="Wish description"
            className={
              formData.description === originalData.description
                ? ""
                : "border border-warning"
            }
          />
        </Form.Group>

        <Row>
          <Col md={2}>
            <Form.Group controlId="wishActive" className="mb-0">
              <Form.Label className="mb-1">Active</Form.Label>
              <Form.Check
                type="switch"
                name="active"
                checked={!!formData.active}
                onChange={handleChange}
                label={formData.active ? "On" : "Off"}
                className={
                  formData.active === originalData.active ? "" : "text-warning"
                }
              />
            </Form.Group>
          </Col>

          <Col>
            <Form.Group controlId="wishCategory" className="flex-grow-1 mb-0">
              <Form.Label className="mb-1">Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className={
                  formData.category === originalData.category
                    ? ""
                    : "border border-warning"
                }
              >
                <option value={0}>Select category</option>
                <option value={1}>Category 1</option>
                <option value={2}>Category 2</option>
                <option value={3}>Category 3</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex gap-2">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={updateWish.isPending || createWish.isPending}
          >
            {isExisting
              ? updateWish.isPending
                ? "Saving..."
                : "Save"
              : createWish.isPending
                ? "Creating..."
                : "Create"}
          </Button>
          <Button variant="outline-secondary" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
        {(updateWish.isError || createWish.isError) && (
          <Alert variant="danger">
            Failed to save:{" "}
            {((updateWish.error || createWish.error) as Error)?.message ??
              "Unknown"}
          </Alert>
        )}
        {(updateWish.isSuccess || createWish.isSuccess) && (
          <Alert variant="success">Changes saved.</Alert>
        )}
      </Form>
    </div>
  );
}

export default WishEditorForm;
