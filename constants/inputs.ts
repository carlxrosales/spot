/**
 * Input field configurations and styling constants.
 * Defines validation rules, placeholders, and style properties for different input types.
 */
export const Inputs = {
  answer: {
    placeholder: "Type your answer",
    validation: {
      minLength: 3,
      maxLength: 20,
    },
    style: {
      maxWidth: 360,
      borderRadius: 24,
      placeholderColor: "rgb(100, 100, 100)",
    },
  },
  lazyMode: {
    style: {
      maxWidth: 600,
      minHeight: 160,
    },
  },
};
