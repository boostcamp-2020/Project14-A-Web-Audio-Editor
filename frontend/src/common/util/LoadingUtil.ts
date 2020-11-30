const startLoading = (element: HTMLElement): void => {
  element.classList.remove('hide');
};

const endLoading = (element: HTMLElement): void => {
  element.classList.add('hide');
};

export { startLoading, endLoading };
