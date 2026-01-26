import { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { useToasts } from "../components/toastContext";

import type { WishlistImageItem } from "../types/wishlistImage";
import {
  useUploadNewImage,
  useDeleteWishImage,
  useAttachImageFromUrl,
} from "../hooks/useWishlistImages";

type ImageManagerProps = {
  wishId: number;
  images: WishlistImageItem[];
  maxImages?: number;
};

function ImageManager({ wishId, images, maxImages = 10 }: ImageManagerProps) {
  const { addToast } = useToasts();

  type UploadMode = "idle" | "file" | "url" | "gallery";
  const [uploadMode, setUploadMode] = useState<UploadMode>("idle");

  const [urlInput, setUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFilename, setCustomFilename] = useState("");

  const uploadImage = useUploadNewImage();
  const deleteImage = useDeleteWishImage();
  const attachImageUrl = useAttachImageFromUrl();

  const handleCancelUpload = () => {
    setUploadMode("idle");
    setSelectedFile(null);
    setCustomFilename("");
    setUrlInput("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      addToast({
        variant: "danger",
        title: "Invalid file type",
        message: "Only image files are allowed (JPEG, PNG, GIF, WebP)",
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast({
        variant: "danger",
        title: "File too large",
        message: "Maximum file size is 5MB",
      });
      return;
    }

    setUploadMode("file");
    setSelectedFile(file);
    setCustomFilename("");
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    try {
      await uploadImage.mutateAsync({
        wishId,
        data: {
          file: selectedFile,
          filename: customFilename || undefined,
        },
      });

      addToast({
        variant: "success",
        title: "Image uploaded",
        message: "Image uploaded successfully",
      });

      handleCancelUpload();
    } catch (err) {
      console.warn(err);
      const message = (err as Error)?.message ?? "Unknown error";
      addToast({
        variant: "danger",
        title: "Upload failed",
        message,
      });
    }
  };

  const handleUrlAdd = async () => {
    if (!urlInput) return;

    const isValid = URL.canParse(urlInput) && urlInput.startsWith("http");
    if (!isValid) {
      addToast({
        variant: "danger",
        title: "Invalid URL",
        message: "Please enter a valid url (ie. https://...)",
      });
      return;
    }

    try {
      await attachImageUrl.mutateAsync({
        wishId,
        data: {
          imagePath: urlInput,
        },
      });

      addToast({
        variant: "success",
        title: "Image attached",
        message: "Image url attached successfully",
      });

      handleCancelUpload();
    } catch (err) {
      console.warn(err);
      const message = (err as Error)?.message ?? "Unknown error";
      addToast({
        variant: "danger",
        title: "Attachement failed",
        message,
      });
    }
  };

  const handleGallerySelect = async () => {
    // TODO: Open gallery modal
    console.log("Select from gallery");
  };

  const handleDelete = async (imageId: number, path: string) => {
    if (!confirm(`Do you want to delete image named ${path}?`)) return;

    try {
      await deleteImage.mutateAsync({ wishId, imageId });

      addToast({
        variant: "info",
        title: "Image deleted",
        message: `Image ${path} deleted successfully`,
      });
    } catch (err) {
      const message = (err as Error)?.message ?? "Unknown error";
      addToast({
        variant: "danger",
        title: "Delete failed",
        message,
      });
    }
  };

  const canAddMore = images.length < maxImages;

  return (
    <Container fluid className="border-top p-0">
      <Row>
        <Col className="my-2 fw-bold">Images</Col>
      </Row>

      {/* Existing images */}
      {images.length > 0 && (
        <Row className="px-3" xs={1} lg={images.length < 3 ? images.length : 3}>
          {images.map((img) => (
            <Col key={img.id} className="my-1">
              <Row>
                <img
                  src={img.url}
                  alt={img.path}
                  className="img-thumbnail"
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                  }}
                />
                <Col>
                  <Button
                    size="sm"
                    variant="danger"
                    className=""
                    onClick={() => handleDelete(img.id, img.path)}
                    disabled={deleteImage.isPending}
                  >
                    {deleteImage.isPending &&
                    deleteImage.variables.imageId === img.id
                      ? "..."
                      : "Delete"}
                  </Button>
                  <div className=" text-break">{img.path}</div>
                </Col>
              </Row>
            </Col>
          ))}
        </Row>
      )}

      {/* Add images */}
      {canAddMore && (
        <>
          {uploadMode === "idle" && (
            <Row>
              <Col className="d-flex gap-2 py-2">
                <label className="btn btn-primary">
                  Upload file
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="d-none"
                  />
                </label>

                <Button
                  variant="outline-secondary"
                  onClick={() => setUploadMode("url")}
                >
                  Add from URL
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={() => setUploadMode("gallery")}
                  disabled={true}
                >
                  Choose from gallery
                </Button>
              </Col>
            </Row>
          )}

          {uploadMode === "file" && selectedFile && (
            <>
              <Row className="my-1">
                <Col>
                  <b>Selected file:</b> {selectedFile.name}
                </Col>
              </Row>

              <Row className="my-1">
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Leave empty to use original filename (optional)"
                    value={customFilename}
                    onChange={(e) => setCustomFilename(e.target.value)}
                  />
                </Col>
              </Row>

              <Row className="my-1">
                <Col className="d-flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleFileUpload}
                    disabled={uploadImage.isPending}
                  >
                    {uploadImage.isPending ? "Uploading..." : "Upload File"}
                  </Button>

                  <Button variant="secondary" onClick={handleCancelUpload}>
                    Cancel
                  </Button>
                </Col>
              </Row>
            </>
          )}

          {uploadMode === "url" && (
            <>
              <Row>
                <Col>
                  <Form.Label>Url</Form.Label>
                  <Form.Control
                    type="text"
                    name="imageUrl"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Image url"
                  />
                </Col>
              </Row>
              <Row className="my-2">
                <Col className="d-flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleUrlAdd}
                    disabled={attachImageUrl.isPending}
                  >
                    {attachImageUrl.isPending ? "Uploading..." : "Upload Url"}
                  </Button>

                  <Button variant="secondary" onClick={handleCancelUpload}>
                    Cancel
                  </Button>
                </Col>
              </Row>
            </>
          )}

          {uploadMode === "gallery" && (
            <Row>
              <Col>
                <Button variant="primary" onClick={handleGallerySelect}>
                  Upload
                </Button>

                <Button variant="secondary" onClick={handleCancelUpload}>
                  Cancel
                </Button>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
}

export default ImageManager;
