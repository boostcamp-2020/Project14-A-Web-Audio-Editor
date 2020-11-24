class Modal {
  constructor() {
    addEventListener('click', this.closeModal.bind(this));
  }

  closeModal(e): void {
    const { target } = e;
    const modalElement: HTMLElement | null = document.querySelector('.modal');
    const modalCloseButton: HTMLElement | null = document.querySelector('.modal-close-button');

    if (modalElement && (target === modalElement || target === modalCloseButton)) {
      modalElement.style.display = 'none';
    }
  }
}

export default new Modal();
