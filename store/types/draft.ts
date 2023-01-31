export type Draft = {
  key: string;
  content: string;
};

export type DraftState = {
  message: {
    autosave: string;
  };
};

export type MessageAutoSavePayload = {
  content: string;
};
