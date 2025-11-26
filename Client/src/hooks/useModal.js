import { useCallback, useState } from "react";

export default function useModal(initial = false) {
  const [open, setOpen] = useState(initial);
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);
  const toggleModal = useCallback(() => setOpen(o => !o), []);
  return { open, openModal, closeModal, toggleModal };
}
