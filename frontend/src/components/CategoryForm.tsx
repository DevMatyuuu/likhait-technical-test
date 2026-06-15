import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { TextField, Button } from "../vibes";
import { CategoryFormData } from "../types";
import EmojiPicker from "emoji-picker-react";
import { logger } from "../utils/devLogger";

interface CategoryFormProps {
  initialData?: Partial<CategoryFormData>;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Add Category",
}: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emoji, setEmoji] = useState(initialData?.emoji || "");
  const [showPicker, setShowPicker] = useState(false);

  logger.info("emoji", emoji);
  
  const buttonRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [pickerPos, setPickerPos] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };

    const rect = buttonRef.current.getBoundingClientRect();

    const PADDING = 8;
    const PICKER_WIDTH = 350;
    const PICKER_HEIGHT = 400;

    let top = rect.bottom + PADDING;
    let left = rect.left;

    if (left + PICKER_WIDTH > window.innerWidth) {
      left = window.innerWidth - PICKER_WIDTH - PADDING;
    }

    if (left < PADDING) {
      left = PADDING;
    }

    if (top + PICKER_HEIGHT > window.innerHeight) {
      top = rect.top - PICKER_HEIGHT - PADDING;
    }

    if (top < PADDING) {
      top = PADDING;
    }

    return { top, left };
  };

  const handleTogglePicker = () => {
    if (!showPicker) {
      setPickerPos(updatePosition());
    }
    setShowPicker((v) => !v);
  };

  useEffect(() => {
    if (!showPicker) return;

    const handlePosition = () => {
      setPickerPos(updatePosition());
    };

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        pickerRef.current &&
        pickerRef.current.contains(target)
      ) {
        return;
      }

      if (
        buttonRef.current &&
        buttonRef.current.contains(target)
      ) {
        return;
      }

      setShowPicker(false);
    };

    window.addEventListener("scroll", handlePosition, true);
    window.addEventListener("resize", handlePosition);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("scroll", handlePosition, true);
      window.removeEventListener("resize", handlePosition);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showPicker]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      const response = await onSubmit({
        name: name.trim(),
        emoji: emoji,
      });

      logger.info("Category form submitted successfully", response);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <TextField
            label="Category Name"
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            error={error}
            fullWidth
            required
          />
        </div>

        <div ref={buttonRef} style={{ marginTop: "1.75rem" }}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleTogglePicker}
          >
            {emoji || "😀"}
          </Button>
        </div>
      </div>

      {showPicker &&
        createPortal(
          <div
            ref={pickerRef}
            style={{
              position: "fixed",
              top: pickerPos.top,
              left: pickerPos.left,
              zIndex: 99999,
            }}
          >
            <EmojiPicker
              onEmojiClick={(emojiData) => {
                setEmoji(emojiData.emoji);
                setShowPicker(false);
              }}
            />
          </div>,
          document.body
        )}

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "1rem",
        }}
      >
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          fullWidth
        >
          {isSubmitting ? "Submitting..." : submitLabel}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}